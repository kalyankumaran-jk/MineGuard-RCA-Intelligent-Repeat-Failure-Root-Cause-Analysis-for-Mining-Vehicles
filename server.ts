import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateSyntheticDataset } from './src/data/syntheticGenerator';
import { runBaselineAnalysis } from './src/data/baselineEngine';
import {
  detectRepeatFailures,
  buildCaseGraph,
  buildProvenanceChain,
  DEFAULT_DETECTION_CONFIG
} from './src/data/rootCauseEngine';
import {
  getPlanChangeHistory,
  recordPlanChange,
  runEdgeCaseTests,
  getExperimentEvaluation,
  getErrorAnalysisCaseStudies
} from './src/data/historyAndTesting';
import { Vehicle, WorkOrder, RepeatFailureCase } from './src/types';

const PORT = 3000;

// Initialize in-memory dataset
let currentSeed = 42;
let { vehicles, workOrders } = generateSyntheticDataset(currentSeed);
let repeatCases = detectRepeatFailures(workOrders, vehicles, DEFAULT_DETECTION_CONFIG);
let baselineResult = runBaselineAnalysis(workOrders, vehicles);

async function startServer() {
  const app = express();
  app.use(express.json());

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), vehicles_count: vehicles.length, work_orders_count: workOrders.length });
  });

  // Regenerate Dataset
  app.post('/api/generate-data', (req, res) => {
    const seed = req.body?.seed ? Number(req.body.seed) : Math.floor(Math.random() * 10000);
    currentSeed = seed;
    const generated = generateSyntheticDataset(seed);
    vehicles = generated.vehicles;
    workOrders = generated.workOrders;
    repeatCases = detectRepeatFailures(workOrders, vehicles, DEFAULT_DETECTION_CONFIG);
    baselineResult = runBaselineAnalysis(workOrders, vehicles);
    res.json({
      status: 'success',
      seed,
      vehicles_count: vehicles.length,
      work_orders_count: workOrders.length,
      repeat_cases_count: repeatCases.length,
    });
  });

  // Vehicles
  app.get('/api/vehicles', (req, res) => {
    const { type, duty_class, site, status } = req.query;
    let list = [...vehicles];
    if (type) list = list.filter(v => v.vehicle_type === type);
    if (duty_class) list = list.filter(v => v.duty_class === duty_class);
    if (site) list = list.filter(v => v.site === site);
    if (status) list = list.filter(v => v.status === status);
    res.json(list);
  });

  // Work Orders
  app.get('/api/work-orders', (req, res) => {
    const { vehicle_id, category, fault_code, limit } = req.query;
    let list = [...workOrders];
    if (vehicle_id) list = list.filter(w => w.vehicle_id.toLowerCase() === String(vehicle_id).toLowerCase());
    if (category) list = list.filter(w => w.failure_category === category);
    if (fault_code) list = list.filter(w => w.fault_code === fault_code);
    if (limit) list = list.slice(0, Number(limit));
    res.json(list);
  });

  // Repeat Failures
  app.get('/api/repeat-failures', (req, res) => {
    const { vehicle_id, category, min_recurrence } = req.query;
    let list = [...repeatCases];
    if (vehicle_id) list = list.filter(c => c.vehicle_id.toLowerCase().includes(String(vehicle_id).toLowerCase()));
    if (category) list = list.filter(c => c.failure_category === category);
    if (min_recurrence) list = list.filter(c => c.recurrence_count >= Number(min_recurrence));
    res.json(list);
  });

  // Single Case Investigation
  app.get('/api/cases/:case_id', (req, res) => {
    const found = repeatCases.find(c => c.case_id === req.params.case_id);
    if (!found) {
      return res.status(404).json({ error: 'Case not found' });
    }
    const caseWorkOrders = workOrders.filter(w => found.work_order_ids.includes(w.work_order_id));
    const vehicle = vehicles.find(v => v.vehicle_id === found.vehicle_id);
    res.json({
      case: found,
      work_orders: caseWorkOrders,
      vehicle,
    });
  });

  // Case Root-Cause Graph
  app.get('/api/cases/:case_id/graph', (req, res) => {
    const found = repeatCases.find(c => c.case_id === req.params.case_id);
    if (!found) {
      return res.status(404).json({ error: 'Case not found' });
    }
    const vehicle = vehicles.find(v => v.vehicle_id === found.vehicle_id);
    const graphData = buildCaseGraph(found, workOrders, vehicle);
    res.json(graphData);
  });

  // Case Provenance
  app.get('/api/cases/:case_id/provenance', (req, res) => {
    const found = repeatCases.find(c => c.case_id === req.params.case_id);
    if (!found) {
      return res.status(404).json({ error: 'Case not found' });
    }
    const provenance = buildProvenanceChain(found, workOrders);
    res.json(provenance);
  });

  // Dispatcher Override
  app.post('/api/cases/:case_id/override', (req, res) => {
    const { case_id } = req.params;
    const { new_plan, reason, priority, user_role, user_name } = req.body;

    if (!reason || !new_plan) {
      return res.status(400).json({ error: 'Both reason and new_plan are required for an override.' });
    }

    const found = repeatCases.find(c => c.case_id === case_id);
    if (!found) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const previousPlan = found.current_plan;
    found.current_plan = new_plan;
    found.has_override = true;
    found.status = 'Overridden';

    const record = recordPlanChange({
      case_id,
      vehicle_id: found.vehicle_id,
      user_role: user_role || 'Dispatcher',
      user_name: user_name || 'Shift Dispatch Lead',
      previous_plan: previousPlan,
      new_plan,
      reason,
      override_flag: true,
      system_recommendation: found.recommended_permanent_action,
      dispatcher_decision: `Dispatcher Override: ${new_plan}`,
      priority: priority || 'High',
    });

    res.json({
      status: 'success',
      case: found,
      audit_record: record,
    });
  });

  // Case Plan Change History
  app.get('/api/cases/:case_id/history', (req, res) => {
    const history = getPlanChangeHistory({ case_id: req.params.case_id });
    res.json(history);
  });

  // Global Plan Change History
  app.get('/api/plan-history', (req, res) => {
    const { vehicle_id, case_id, user_role, override_only } = req.query;
    const history = getPlanChangeHistory({
      vehicle_id: vehicle_id ? String(vehicle_id) : undefined,
      case_id: case_id ? String(case_id) : undefined,
      user_role: user_role ? String(user_role) : undefined,
      override_only: override_only === 'true',
    });
    res.json(history);
  });

  // Audit Explanation Export JSON
  app.get('/api/cases/:case_id/explanation', (req, res) => {
    const found = repeatCases.find(c => c.case_id === req.params.case_id);
    if (!found) {
      return res.status(404).json({ error: 'Case not found' });
    }
    const caseWorkOrders = workOrders.filter(w => found.work_order_ids.includes(w.work_order_id));
    const vehicle = vehicles.find(v => v.vehicle_id === found.vehicle_id);
    const provenance = buildProvenanceChain(found, workOrders);
    const history = getPlanChangeHistory({ case_id: found.case_id });

    const auditReport = {
      report_title: 'Audit-Ready Root-Cause & Repeat Failure Investigation Report',
      generated_at: new Date().toISOString(),
      case_id: found.case_id,
      vehicle: {
        vehicle_id: found.vehicle_id,
        type: found.vehicle_type,
        model: found.model,
        site: found.site,
        operating_hours: vehicle?.operating_hours,
        duty_class: vehicle?.duty_class,
        load_profile: vehicle?.load_profile,
      },
      failure_summary: {
        primary_symptom: found.primary_symptom,
        failure_category: found.failure_category,
        recurrence_count: found.recurrence_count,
        total_downtime_hours: found.total_downtime_hours,
        first_detected_date: found.first_detected_date,
        time_window_days: found.time_window_days,
      },
      symptom_level_fix_vs_permanent_action: {
        symptom_fix: found.symptom_fix,
        recommended_permanent_action: found.recommended_permanent_action,
        expected_recurrence_reduction: `${found.expected_recurrence_reduction}%`,
        active_plan: found.current_plan,
        has_dispatcher_override: found.has_override,
      },
      root_cause_analysis: {
        identified_root_cause: found.top_root_cause,
        confidence_score: `${found.confidence_score}%`,
        decision_formula: 'Score = 0.25*fault_code + 0.20*recurrence + 0.20*part + 0.15*condition + 0.10*symptom + 0.10*temporal',
        score_breakdown: found.score_breakdown,
        evidence_summary: found.evidence_summary,
      },
      provenance_chain: provenance,
      timeline_work_orders: caseWorkOrders.map(w => ({
        work_order_id: w.work_order_id,
        date: w.date,
        shift: w.shift,
        symptom: w.symptom,
        fault_code: w.fault_code,
        fault_desc: w.fault_code_desc,
        severity: w.severity,
        downtime_hours: w.downtime_hours,
        technician: w.technician,
        repair_action: w.repair_action,
        replaced_part: w.replaced_part,
        operating_conditions: `${w.environmental_condition} | ${w.terrain_condition} | ${w.load_condition}`,
      })),
      plan_change_audit_history: history,
      compliance_notes: {
        framework: 'ISO 55000 Asset Management & Reliability Centered Maintenance (RCM-II)',
        classification: 'Synthetic operational benchmark data - human in the loop decision enforcement',
      }
    };

    res.json(auditReport);
  });

  // Metrics Dashboard Summary
  app.get('/api/metrics', (req, res) => {
    const totalVehicles = vehicles.length;
    const totalWorkOrders = workOrders.length;
    const repeatFailuresCount = repeatCases.length;
    const totalDowntime = Number(workOrders.reduce((sum, w) => sum + w.downtime_hours, 0).toFixed(1));
    const repeatDowntime = Number(repeatCases.reduce((sum, c) => sum + c.total_downtime_hours, 0).toFixed(1));
    const avgDowntime = Number((totalDowntime / totalWorkOrders).toFixed(1));
    const repeatRate = Number(((repeatCases.reduce((sum, c) => sum + c.recurrence_count, 0) / totalWorkOrders) * 100).toFixed(1));

    // Fault code frequencies
    const faultCounts: Record<string, number> = {};
    for (const w of workOrders) {
      faultCounts[w.fault_code] = (faultCounts[w.fault_code] || 0) + 1;
    }
    const topFaultCodes = Object.entries(faultCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([code, count]) => ({ code, count }));

    // Replaced parts frequencies
    const partCounts: Record<string, number> = {};
    for (const w of workOrders) {
      partCounts[w.replaced_part] = (partCounts[w.replaced_part] || 0) + 1;
    }
    const topParts = Object.entries(partCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([part, count]) => ({ part, count }));

    // Downtime by vehicle
    const vehicleDowntime: Record<string, number> = {};
    for (const w of workOrders) {
      vehicleDowntime[w.vehicle_id] = Number(((vehicleDowntime[w.vehicle_id] || 0) + w.downtime_hours).toFixed(1));
    }
    const topVehiclesByDowntime = Object.entries(vehicleDowntime)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([vehicle_id, downtime]) => ({ vehicle_id, downtime }));

    // Duty class breakdown
    const dutyCounts: Record<string, number> = {};
    for (const c of repeatCases) {
      const v = vehicles.find(veh => veh.vehicle_id === c.vehicle_id);
      const d = v?.duty_class || 'Heavy';
      dutyCounts[d] = (dutyCounts[d] || 0) + 1;
    }
    const repeatsByDutyClass = Object.entries(dutyCounts).map(([duty, count]) => ({ duty, count }));

    // Root Cause distribution
    const rootCauseCounts: Record<string, number> = {};
    for (const c of repeatCases) {
      const shortCause = c.top_root_cause.split('(')[0].trim().slice(0, 35);
      rootCauseCounts[shortCause] = (rootCauseCounts[shortCause] || 0) + 1;
    }
    const rootCauseDistribution = Object.entries(rootCauseCounts).map(([cause, count]) => ({ cause, count }));

    // Monthly repeat failures trend
    const monthlyRepeats: Record<string, number> = {
      '2026-01': 0, '2026-02': 0, '2026-03': 0, '2026-04': 0,
      '2026-05': 0, '2026-06': 0, '2026-07': 0, '2026-08': 0
    };
    for (const w of workOrders) {
      if (w.is_repeat_failure) {
        const ym = w.date.slice(0, 7);
        if (monthlyRepeats[ym] !== undefined) {
          monthlyRepeats[ym]++;
        }
      }
    }
    const repeatTrend = Object.entries(monthlyRepeats).map(([month, count]) => ({ month, count }));

    res.json({
      summary: {
        total_vehicles: totalVehicles,
        total_work_orders: totalWorkOrders,
        repeat_failure_clusters: repeatFailuresCount,
        repeat_failure_rate: `${repeatRate}%`,
        total_downtime_hours: totalDowntime,
        repeat_downtime_hours: repeatDowntime,
        average_downtime_hours: avgDowntime,
        root_causes_identified: repeatCases.length,
        permanent_actions_active: repeatCases.filter(c => c.status !== 'Open').length,
      },
      top_fault_codes: topFaultCodes,
      top_parts: topParts,
      top_vehicles_by_downtime: topVehiclesByDowntime,
      repeats_by_duty_class: repeatsByDutyClass,
      root_cause_distribution: rootCauseDistribution,
      repeat_trend: repeatTrend,
    });
  });

  // Baseline Analytics
  app.get('/api/baseline', (req, res) => {
    res.json(baselineResult);
  });

  // Test Harness
  app.get('/api/test-harness', (req, res) => {
    const testResults = runEdgeCaseTests();
    res.json({
      total_tests: testResults.length,
      passed: testResults.filter(t => t.status === 'PASS').length,
      failed: testResults.filter(t => t.status === 'FAIL').length,
      tests: testResults,
    });
  });

  // Experiment Results
  app.get('/api/experiment-results', (req, res) => {
    const evalData = getExperimentEvaluation();
    res.json(evalData);
  });

  // Error Analysis
  app.get('/api/error-analysis', (req, res) => {
    const studies = getErrorAnalysisCaseStudies();
    res.json(studies);
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Repeat-Failure Root-Cause Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
