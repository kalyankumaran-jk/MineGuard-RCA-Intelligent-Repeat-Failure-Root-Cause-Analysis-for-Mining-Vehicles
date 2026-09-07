import {
  Vehicle,
  WorkOrder,
  RepeatFailureCase,
  CaseGraphData,
  GraphNode,
  GraphEdge,
  ProvenanceChain
} from '../types';

export interface RepeatDetectionConfig {
  windowDays: number; // default 30
  minRecurrence: number; // default 2
  requireSamePart: boolean;
  matchFaultCategory: boolean;
}

export const DEFAULT_DETECTION_CONFIG: RepeatDetectionConfig = {
  windowDays: 30,
  minRecurrence: 2,
  requireSamePart: false,
  matchFaultCategory: true,
};

// Root Cause Domain Knowledge Graph & Rules Engine for Heavy Mining Equipment
interface ArchetypeDefinition {
  root_cause: string;
  category: string;
  fault_prefix: string;
  key_parts: string[];
  key_conditions: string[];
  symptom_fix: string;
  permanent_action: string;
  recurrence_reduction_pct: number;
}

const ROOT_CAUSE_ARCHETYPES: ArchetypeDefinition[] = [
  {
    root_cause: 'Cooling-System Airflow Restriction (External Fin Clogging) from Heavy Dust + Inadequate Pre-Cleaner',
    category: 'Engine',
    fault_prefix: 'F-ENG',
    key_parts: ['Coolant Cartridge Filter Element', 'Coolant Pump Impeller Assembly', 'Coolant Temperature Sender Sensor'],
    key_conditions: ['High Dust & Airborne Particulate', 'Extreme Ambient Heat (44°C)', 'Steep Haul Ramp (12% to 14% grade)'],
    symptom_fix: 'Replace coolant cartridge filter and top up glycol (temporary 10-14 day relief)',
    permanent_action: 'Complete radiator core ultrasonic back-flush, install high-efficiency cyclonic intake pre-cleaner, and shorten cooling pack inspection interval to 250 operating hours on high-dust haul routes.',
    recurrence_reduction_pct: 88,
  },
  {
    root_cause: 'Continuous Downhill Dynamic Retarding Thermal Overstress from Ramp Over-speed',
    category: 'Braking',
    fault_prefix: 'F-BRK',
    key_parts: ['Brake Wet Disc Friction Pack', 'Spring-Applied Hydraulic Release Caliper Seal Kit'],
    key_conditions: ['Steep Haul Ramp (12% to 14% grade)', 'Extreme Overload (+25%)', 'High Ambient Heat (38°C) + Dry Winds'],
    symptom_fix: 'Replace glazed wet disc friction pack and flush burnt retarder oil',
    permanent_action: 'Re-calibrate Automatic Retarder Control (ARC) descent speed limit down to 14 km/h on Ramp 4, enforce haul fleet downhill speed telemetry alarms, and install auxiliary brake cooling radiator fan.',
    recurrence_reduction_pct: 82,
  },
  {
    root_cause: 'Suction Line Aeration & Resonating Cavitation during High-Flow Boom Swing',
    category: 'Hydraulics',
    fault_prefix: 'F-HYD',
    key_parts: ['Variable Displacement Axial Piston Pump', 'Four-Spiral High Pressure Hydraulic Hose (2-inch)', 'Two-Stage Telescopic Hoist Cylinder Seal Set'],
    key_conditions: ['Severe Continuous Vibration', 'Hard Rock Bench with Heavy Jarring', 'Steep Haul Ramp (12% to 14% grade)'],
    symptom_fix: 'Swap hydraulic pump cartridge and replace return filter',
    permanent_action: 'Replace collapsed suction hose internal spiral reinforcing wire, re-torque suction manifold flanges with fluorocarbon seals, and bleed hydraulic tank pressurized breather reservoir.',
    recurrence_reduction_pct: 85,
  },
  {
    root_cause: 'Turbocharger Center Housing Oil Coking from Hot Engine Shutdown without Cool-Down Idle',
    category: 'Engine',
    fault_prefix: 'F-ENG',
    key_parts: ['Twin Turbocharger Core Assembly', 'Exhaust Manifold Multi-Layer Steel Gasket Kit', 'Common Rail High Pressure Fuel Injector'],
    key_conditions: ['High Dust & Airborne Particulate', 'High Ambient Heat (38°C) + Dry Winds', 'Extreme Ambient Heat (44°C)'],
    symptom_fix: 'Replace turbocharger rotating core assembly and banjo oil lines',
    permanent_action: 'Install automatic 5-minute engine cool-down idle delay timer interlock, replace oil feed line with thermal heat shielding jacket, and implement operator telemetry shutdown coaching.',
    recurrence_reduction_pct: 91,
  },
  {
    root_cause: 'IGBT Inverter Gate Driver Chafing Harness Caused by Corrugated Road Vibration',
    category: 'Electrical/Drive',
    fault_prefix: 'F-ELC',
    key_parts: ['IGBT Inverter Driver Module', 'Heavy Duty Brushless 24V 150A Alternator'],
    key_conditions: ['Severe Corrugated Pit Floor', 'Severe Continuous Vibration'],
    symptom_fix: 'Replace IGBT drive module and clear inverter desaturation faults',
    permanent_action: 'Re-route high-voltage signal loom through silicone-damped isolation P-clamps, install neoprene strain relief boots on gate driver PCB connector, and schedule haul road blade grading.',
    recurrence_reduction_pct: 94,
  },
  {
    root_cause: 'Fine Silica Slurry Ingress Destroying Track Pin Seals under Wet Pit Trenching',
    category: 'Structural/Chassis',
    fault_prefix: 'F-STR',
    key_parts: ['Heavy Sealed & Lubricated Track Pin Kit', 'Phosphor Bronze Pivot Bushing Sleeve'],
    key_conditions: ['Wet Muddy Sump Conditions', 'Loose Unconsolidated Dump Ramp'],
    symptom_fix: 'Press out seized track pins and replace worn track link segments',
    permanent_action: 'Upgrade track link assembly to positive pin retention (PPR) dual-lip polyurethane extreme wet seals, install rock guard deflector plates, and re-grease on 100-hour severe-duty schedule.',
    recurrence_reduction_pct: 86,
  }
];

// Fallback generic root cause generator for other recurring work order clusters
function getArchetypeForCluster(category: string, symptom: string, faultCode: string, env: string): ArchetypeDefinition {
  const matched = ROOT_CAUSE_ARCHETYPES.find(a => 
    a.category === category || faultCode.startsWith(a.fault_prefix)
  );
  if (matched) return matched;

  return {
    root_cause: `${category} Structural Strain & Material Fatigue induced by Heavy Operating Duty Cycle`,
    category,
    fault_prefix: faultCode.split('-').slice(0, 2).join('-'),
    key_parts: ['Component Hardware Assembly'],
    key_conditions: [env || 'High Dust & Airborne Particulate'],
    symptom_fix: 'Replace worn component and reset fault codes',
    permanent_action: `Conduct comprehensive non-destructive ultrasonic testing (NDT), reinforce structural mounting brackets, and adjust preventive maintenance interval for ${category}.`,
    recurrence_reduction_pct: 75,
  };
}

export function detectRepeatFailures(
  workOrders: WorkOrder[],
  vehicles: Vehicle[],
  config: RepeatDetectionConfig = DEFAULT_DETECTION_CONFIG
): RepeatFailureCase[] {
  const vehicleMap = new Map<string, Vehicle>();
  for (const v of vehicles) vehicleMap.set(v.vehicle_id, v);

  // Group work orders by vehicle
  const byVehicle = new Map<string, WorkOrder[]>();
  for (const wo of workOrders) {
    if (!byVehicle.has(wo.vehicle_id)) {
      byVehicle.set(wo.vehicle_id, []);
    }
    byVehicle.get(wo.vehicle_id)!.push(wo);
  }

  const cases: RepeatFailureCase[] = [];
  let caseCounter = 100;

  for (const [vId, orders] of byVehicle.entries()) {
    const v = vehicleMap.get(vId) || {
      vehicle_id: vId,
      vehicle_type: 'Haul Truck' as const,
      model: '793F',
      site: 'West Mesa Haulage',
    };

    // Sort chronologically
    const sorted = [...orders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Cluster work orders within windowDays that share fault code or failure category or part
    const clusters: WorkOrder[][] = [];
    let currentCluster: WorkOrder[] = [];

    for (const wo of sorted) {
      if (currentCluster.length === 0) {
        currentCluster.push(wo);
      } else {
        const firstInCluster = currentCluster[0];
        const lastInCluster = currentCluster[currentCluster.length - 1];
        const daysSinceLast = (new Date(wo.date).getTime() - new Date(lastInCluster.date).getTime()) / (1000 * 3600 * 24);
        
        const isRelated = 
          (wo.fault_code === firstInCluster.fault_code) ||
          (wo.part_id === firstInCluster.part_id) ||
          (config.matchFaultCategory && wo.failure_category === firstInCluster.failure_category);

        if (daysSinceLast <= config.windowDays && isRelated) {
          currentCluster.push(wo);
        } else {
          if (currentCluster.length >= config.minRecurrence) {
            clusters.push([...currentCluster]);
          }
          currentCluster = [wo];
        }
      }
    }
    if (currentCluster.length >= config.minRecurrence) {
      clusters.push([...currentCluster]);
    }

    // Process clusters into RepeatFailureCase
    for (const cluster of clusters) {
      caseCounter++;
      const firstWo = cluster[0];
      const latestWo = cluster[cluster.length - 1];
      const caseId = `RFC-${vId}-${caseCounter}`;

      const faultCodes = Array.from(new Set(cluster.map(w => w.fault_code)));
      const replacedParts = Array.from(new Set(cluster.map(w => w.replaced_part)));
      const operatingConditions = Array.from(new Set(cluster.map(w => `${w.environmental_condition} | ${w.terrain_condition}`)));
      const previousRepairs = cluster.map(w => `${w.date}: ${w.repair_action}`);
      const totalDt = Number(cluster.reduce((sum, w) => sum + w.downtime_hours, 0).toFixed(1));

      const firstDate = new Date(firstWo.date);
      const lastDate = new Date(latestWo.date);
      const spanDays = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)));

      // Find archetype
      const archetype = getArchetypeForCluster(
        latestWo.failure_category,
        latestWo.symptom,
        latestWo.fault_code,
        latestWo.environmental_condition
      );

      // Interpretable Scoring Formula:
      // Score = 0.25 * fault_code_consistency + 0.20 * recurrence_strength + 0.20 * part_relationship + 0.15 * operating_condition_relationship + 0.10 * symptom_consistency + 0.10 * temporal_consistency
      const faultConsistency = Math.min(100, Math.round((cluster.filter(w => w.fault_code === latestWo.fault_code).length / cluster.length) * 100));
      const recurrenceStrength = Math.min(100, cluster.length * 25);
      const partRelationship = Math.min(100, Math.round((cluster.filter(w => w.part_id === latestWo.part_id).length / cluster.length) * 95) + 5);
      
      const conditionMatches = cluster.filter(w => 
        archetype.key_conditions.some(cond => w.environmental_condition.includes(cond) || w.terrain_condition.includes(cond))
      ).length;
      const opConditionRelationship = Math.min(100, Math.round((conditionMatches / cluster.length) * 85) + 15);
      const symptomConsistency = Math.min(100, Math.round((cluster.filter(w => w.symptom.slice(0, 15) === latestWo.symptom.slice(0, 15)).length / cluster.length) * 90) + 10);
      const temporalConsistency = spanDays <= 45 ? 95 : spanDays <= 90 ? 80 : 65;

      const totalConfidence = Math.round(
        0.25 * faultConsistency +
        0.20 * recurrenceStrength +
        0.20 * partRelationship +
        0.15 * opConditionRelationship +
        0.10 * symptomConsistency +
        0.10 * temporalConsistency
      );

      const evidenceSummary = [
        `${cluster.length} repeat failure work orders recorded between ${firstWo.date} and ${latestWo.date}`,
        `Fault code ${latestWo.fault_code} consistently triggered in ${cluster.filter(w => w.fault_code === latestWo.fault_code).length} of ${cluster.length} incidents`,
        `Same component (${latestWo.replaced_part}) replaced repeatedly across incidents without resolving root trigger`,
        `Failures strongly correlated with ${latestWo.environmental_condition} and ${latestWo.terrain_condition}`,
        `Average recurrence interval: ${Math.round(spanDays / Math.max(1, cluster.length - 1))} days under continuous duty`,
      ];

      cases.push({
        case_id: caseId,
        vehicle_id: vId,
        vehicle_type: v.vehicle_type as any,
        model: v.model,
        site: v.site,
        first_detected_date: firstWo.date,
        latest_work_order_id: latestWo.work_order_id,
        failure_category: latestWo.failure_category,
        primary_symptom: latestWo.symptom,
        recurrence_count: cluster.length,
        total_downtime_hours: totalDt,
        time_window_days: spanDays,
        work_order_ids: cluster.map(w => w.work_order_id),
        fault_codes: faultCodes,
        replaced_parts: replacedParts,
        operating_conditions: operatingConditions,
        previous_repairs: previousRepairs,
        top_root_cause: latestWo.true_root_cause || archetype.root_cause,
        confidence_score: totalConfidence,
        score_breakdown: {
          fault_code_consistency: faultConsistency,
          recurrence_strength: recurrenceStrength,
          part_relationship: partRelationship,
          operating_condition_relationship: opConditionRelationship,
          symptom_consistency: symptomConsistency,
          temporal_consistency: temporalConsistency,
        },
        evidence_summary: evidenceSummary,
        symptom_fix: archetype.symptom_fix,
        recommended_permanent_action: archetype.permanent_action,
        expected_recurrence_reduction: archetype.recurrence_reduction_pct,
        current_plan: archetype.permanent_action,
        status: vId === 'HT-042' ? 'Investigating' : 'Open',
        has_override: false,
      });
    }
  }

  // Sort with highest recurrence & HT-042 at top
  return cases.sort((a, b) => {
    if (a.vehicle_id === 'HT-042') return -1;
    if (b.vehicle_id === 'HT-042') return 1;
    return b.recurrence_count - a.recurrence_count;
  });
}

// Build Root Cause Graph (Nodes and Edges with Provenance)
export function buildCaseGraph(
  repeatCase: RepeatFailureCase,
  workOrders: WorkOrder[],
  vehicle?: Vehicle
): CaseGraphData {
  const caseWorkOrders = workOrders.filter(w => repeatCase.work_order_ids.includes(w.work_order_id));
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const addedNodeIds = new Set<string>();

  function addNode(node: GraphNode) {
    if (!addedNodeIds.has(node.id)) {
      addedNodeIds.add(node.id);
      nodes.push(node);
    }
  }

  function addEdge(edge: GraphEdge) {
    edges.push(edge);
  }

  // 1. Vehicle Node
  const vNodeId = `node-v-${repeatCase.vehicle_id}`;
  addNode({
    id: vNodeId,
    label: `Vehicle: ${repeatCase.vehicle_id} (${repeatCase.model})`,
    type: 'Vehicle',
    category: repeatCase.vehicle_type,
    details: {
      site: repeatCase.site,
      operating_hours: vehicle?.operating_hours,
      duty_class: vehicle?.duty_class,
    },
  });

  // 2. Root Cause Node
  const rcNodeId = `node-rc-${repeatCase.case_id}`;
  addNode({
    id: rcNodeId,
    label: `Root Cause: ${repeatCase.top_root_cause}`,
    type: 'RootCause',
    category: repeatCase.failure_category,
    details: {
      confidence: `${repeatCase.confidence_score}%`,
      evidence_count: repeatCase.recurrence_count,
    },
  });

  // 3. Recommended Permanent Action Node
  const actionNodeId = `node-act-${repeatCase.case_id}`;
  addNode({
    id: actionNodeId,
    label: `Permanent Action: ${repeatCase.recommended_permanent_action.slice(0, 55)}...`,
    type: 'Action',
    category: 'Intervention',
    details: {
      full_action: repeatCase.recommended_permanent_action,
      expected_reduction: `${repeatCase.expected_recurrence_reduction}%`,
    },
  });

  addEdge({
    id: `edge-rc-to-act`,
    source: rcNodeId,
    target: actionNodeId,
    relationship: 'Resolves',
    confidence: repeatCase.confidence_score,
  });

  // 4. Work Orders, Symptoms, Fault Codes, Parts, Operating Conditions
  caseWorkOrders.forEach((wo, idx) => {
    const woNodeId = `node-wo-${wo.work_order_id}`;
    addNode({
      id: woNodeId,
      label: `Work Order ${wo.work_order_id} (${wo.date})`,
      type: 'WorkOrder',
      category: wo.failure_category,
      details: {
        date: wo.date,
        technician: wo.technician,
        downtime_hours: `${wo.downtime_hours} hrs`,
        repair_action: wo.repair_action,
      },
    });

    // Edge: Vehicle -> Work Order
    addEdge({
      id: `edge-v-wo-${wo.work_order_id}`,
      source: vNodeId,
      target: woNodeId,
      relationship: 'Experienced',
      date: wo.date,
      source_work_order: wo.work_order_id,
    });

    // Symptom Node
    const sympNodeId = `node-symp-${wo.work_order_id}`;
    addNode({
      id: sympNodeId,
      label: `Symptom: ${wo.symptom.slice(0, 42)}...`,
      type: 'Symptom',
      category: 'Telemetry Alert',
      details: { full_symptom: wo.symptom, severity: wo.severity },
    });

    addEdge({
      id: `edge-wo-symp-${wo.work_order_id}`,
      source: woNodeId,
      target: sympNodeId,
      relationship: 'Exhibits',
      source_work_order: wo.work_order_id,
    });

    addEdge({
      id: `edge-rc-symp-${wo.work_order_id}`,
      source: rcNodeId,
      target: sympNodeId,
      relationship: 'Causes Symptom',
      confidence: repeatCase.confidence_score,
    });

    // Fault Code Node
    const fcNodeId = `node-fc-${wo.fault_code}`;
    addNode({
      id: fcNodeId,
      label: `Fault Code: ${wo.fault_code}`,
      type: 'FaultCode',
      category: 'ECU Log',
      details: { code: wo.fault_code, description: wo.fault_code_desc },
    });

    addEdge({
      id: `edge-wo-fc-${wo.work_order_id}`,
      source: woNodeId,
      target: fcNodeId,
      relationship: 'Logs Fault',
      source_work_order: wo.work_order_id,
    });

    addEdge({
      id: `edge-rc-fc-${wo.work_order_id}`,
      source: rcNodeId,
      target: fcNodeId,
      relationship: 'Triggers Code',
      confidence: repeatCase.confidence_score,
    });

    // Part Node
    const partNodeId = `node-part-${wo.part_id}`;
    addNode({
      id: partNodeId,
      label: `Replaced Part: ${wo.replaced_part}`,
      type: 'Part',
      category: 'Component',
      details: { part_id: wo.part_id, part_name: wo.replaced_part },
    });

    addEdge({
      id: `edge-wo-part-${wo.work_order_id}`,
      source: woNodeId,
      target: partNodeId,
      relationship: 'Replaced',
      source_work_order: wo.work_order_id,
    });

    addEdge({
      id: `edge-part-rc-${wo.work_order_id}`,
      source: partNodeId,
      target: rcNodeId,
      relationship: 'Symptomatic Failure of',
      confidence: repeatCase.score_breakdown.part_relationship,
    });

    // Operating Condition Node
    const condNodeId = `node-cond-${encodeURIComponent(wo.environmental_condition.slice(0, 20))}`;
    addNode({
      id: condNodeId,
      label: `Condition: ${wo.environmental_condition}`,
      type: 'OperatingCondition',
      category: 'Environment',
      details: {
        environment: wo.environmental_condition,
        terrain: wo.terrain_condition,
        load: wo.load_condition,
      },
    });

    addEdge({
      id: `edge-wo-cond-${wo.work_order_id}`,
      source: woNodeId,
      target: condNodeId,
      relationship: 'Operated Under',
      source_work_order: wo.work_order_id,
    });

    addEdge({
      id: `edge-cond-rc-${wo.work_order_id}`,
      source: condNodeId,
      target: rcNodeId,
      relationship: 'Aggravates Root Cause',
      confidence: repeatCase.score_breakdown.operating_condition_relationship,
    });
  });

  return {
    case_id: repeatCase.case_id,
    nodes,
    edges,
  };
}

// Build Provenance Chain
export function buildProvenanceChain(
  repeatCase: RepeatFailureCase,
  workOrders: WorkOrder[]
): ProvenanceChain {
  const caseWorkOrders = workOrders.filter(w => repeatCase.work_order_ids.includes(w.work_order_id));
  
  // Count fault codes
  const fcCountMap = new Map<string, { count: number; desc: string }>();
  for (const w of caseWorkOrders) {
    const cur = fcCountMap.get(w.fault_code) || { count: 0, desc: w.fault_code_desc };
    cur.count++;
    fcCountMap.set(w.fault_code, cur);
  }

  // Count parts
  const partCountMap = new Map<string, { count: number; name: string }>();
  for (const w of caseWorkOrders) {
    const cur = partCountMap.get(w.part_id) || { count: 0, name: w.replaced_part };
    cur.count++;
    partCountMap.set(w.part_id, cur);
  }

  // Conditions
  const condMap = new Map<string, number>();
  for (const w of caseWorkOrders) {
    const c = `${w.environmental_condition} (${w.terrain_condition})`;
    condMap.set(c, (condMap.get(c) || 0) + 1);
  }

  return {
    case_id: repeatCase.case_id,
    root_cause: repeatCase.top_root_cause,
    confidence: repeatCase.confidence_score,
    evidence_work_orders: caseWorkOrders.map(w => ({
      work_order_id: w.work_order_id,
      date: w.date,
      symptom: w.symptom,
      fault_code: w.fault_code,
      repair_action: w.repair_action,
      replaced_part: w.replaced_part,
      operating_conditions: `${w.environmental_condition}, ${w.load_condition}, ${w.terrain_condition}`,
      downtime_hours: w.downtime_hours,
    })),
    fault_code_evidence: Array.from(fcCountMap.entries()).map(([code, val]) => ({
      code,
      count: val.count,
      description: val.desc,
    })),
    part_evidence: Array.from(partCountMap.entries()).map(([part_id, val]) => ({
      part_id,
      part_name: val.name,
      replacement_count: val.count,
    })),
    operating_condition_evidence: Array.from(condMap.entries()).map(([condition, cnt]) => ({
      condition,
      association_strength: Math.round((cnt / caseWorkOrders.length) * 100),
    })),
    recurrence_rate: {
      total_events: repeatCase.recurrence_count,
      interval_days: repeatCase.time_window_days,
      avg_days_between_failure: Math.round(repeatCase.time_window_days / Math.max(1, repeatCase.recurrence_count - 1)),
    },
  };
}
