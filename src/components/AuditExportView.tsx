import React, { useState } from 'react';
import { RepeatFailureCase, Vehicle, WorkOrder, PlanChangeRecord } from '../types';
import { buildProvenanceChain } from '../data/rootCauseEngine';
import {
  Download,
  Printer,
  Copy,
  Check,
  Building
} from 'lucide-react';

interface AuditExportViewProps {
  selectedCaseId: string;
  repeatCases: RepeatFailureCase[];
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  historyRecords: PlanChangeRecord[];
  onSelectCase: (caseId: string) => void;
}

export const AuditExportView: React.FC<AuditExportViewProps> = ({
  selectedCaseId,
  repeatCases,
  vehicles,
  workOrders,
  historyRecords,
  onSelectCase,
}) => {
  const [copied, setCopied] = useState(false);
  const currentCase = repeatCases.find(c => c.case_id === selectedCaseId) || repeatCases[0];
  const vehicle = vehicles.find(v => v.vehicle_id === currentCase?.vehicle_id);
  const caseWorkOrders = workOrders.filter(w => currentCase?.work_order_ids.includes(w.work_order_id));
  const provenance = currentCase ? buildProvenanceChain(currentCase, workOrders) : null;
  const caseHistory = historyRecords.filter(h => h.case_id === currentCase?.case_id);

  if (!currentCase) {
    return <div className="p-8 text-center text-white/40 font-mono">No case selected for audit export.</div>;
  }

  // Generate complete structured JSON
  const auditReportData = {
    report_title: 'Audit-Ready Root-Cause & Repeat Failure Investigation Report',
    compliance_framework: 'ISO 55000 Asset Management & Reliability Centered Maintenance (RCM-II)',
    generated_at: new Date().toISOString(),
    case_id: currentCase.case_id,
    vehicle_profile: {
      vehicle_id: currentCase.vehicle_id,
      equipment_type: currentCase.vehicle_type,
      model: currentCase.model,
      site: currentCase.site,
      operating_hours: vehicle?.operating_hours,
      duty_class: vehicle?.duty_class,
      load_profile: vehicle?.load_profile,
      shift_pattern: vehicle?.shift_pattern,
    },
    failure_chronology: {
      primary_symptom: currentCase.primary_symptom,
      category: currentCase.failure_category,
      recurrence_count: currentCase.recurrence_count,
      total_downtime_hours: currentCase.total_downtime_hours,
      time_window_days: currentCase.time_window_days,
      first_detected: currentCase.first_detected_date,
    },
    root_cause_disambiguation: {
      underlying_root_cause: currentCase.top_root_cause,
      confidence_score: `${currentCase.confidence_score}%`,
      decision_scoring_formula: 'Score = 0.25*fault_consistency + 0.20*recurrence + 0.20*part + 0.15*condition + 0.10*symptom + 0.10*temporal',
      scoring_breakdown: currentCase.score_breakdown,
      evidence_summary: currentCase.evidence_summary,
    },
    corrective_action_assessment: {
      symptom_level_reactive_fix: currentCase.symptom_fix,
      permanent_corrective_action: currentCase.recommended_permanent_action,
      expected_recurrence_reduction: `${currentCase.expected_recurrence_reduction}%`,
      current_committed_plan: currentCase.current_plan,
      dispatcher_override_active: currentCase.has_override,
    },
    evidentiary_work_orders: caseWorkOrders.map(w => ({
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
      part_id: w.part_id,
      operating_conditions: `${w.environmental_condition} | ${w.terrain_condition} | ${w.load_condition}`,
    })),
    data_provenance: provenance,
    plan_change_audit_history: caseHistory,
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditReportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AUDIT-${currentCase.case_id}-${currentCase.vehicle_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(auditReportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="bg-[#0d0d0d] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl print:hidden">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-white/5 text-[#ccff00] border border-white/15 px-2 py-0.5">
              Regulatory Audit Export
            </span>
            <div className="h-[1px] w-6 bg-white/20"></div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              ISO 55000 Certified Dossier
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tight mt-1">
            Audit-Ready Root-Cause Export: {currentCase.case_id}
          </h2>
        </div>

        <div className="flex items-center space-x-2.5 font-mono">
          <label className="text-xs text-white/40 uppercase tracking-wider">Case:</label>
          <select
            id="select-export-case"
            value={currentCase.case_id}
            onChange={e => onSelectCase(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
          >
            {repeatCases.map(c => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} — {c.vehicle_id}
              </option>
            ))}
          </select>

          <button
            id="btn-print-audit-report"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs uppercase font-mono tracking-wider flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Print / PDF</span>
          </button>

          <button
            id="btn-copy-audit-json"
            onClick={handleCopyJSON}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs uppercase font-mono tracking-wider flex items-center space-x-1.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#ccff00]" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            id="btn-download-audit-json"
            onClick={handleDownloadJSON}
            className="px-4 py-2 bg-[#ccff00] hover:bg-white text-black text-xs font-black uppercase font-mono tracking-widest flex items-center space-x-2 transition cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      {/* Formatted Printable Audit Report Document */}
      <div className="bg-[#0d0d0d] border border-white/10 p-8 sm:p-10 space-y-6 shadow-2xl text-white/90 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Report Official Header */}
        <div className="border-b border-white/10 print:border-black pb-5 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-[#ccff00] print:text-black" />
              <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ccff00] print:text-black">
                Western Pilbara Open-Pit Mining Operations
              </span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tight print:text-black">
              Repeat-Failure Root-Cause Investigation & Audit Dossier
            </h1>
            <div className="text-xs text-white/50 print:text-gray-600 font-mono pt-1">
              Investigation Case ID: <strong className="text-white print:text-black">{currentCase.case_id}</strong> • Target Unit: <strong className="text-[#ccff00] print:text-black">{currentCase.vehicle_id}</strong>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-white/40 print:text-gray-600 space-y-0.5">
            <div>Standard: ISO-55000 / RCM-II</div>
            <div>Date Generated: {new Date().toLocaleDateString()}</div>
            <div>Auditor Reference: REL-AUD-2026-04</div>
          </div>
        </div>

        {/* Section 1: Vehicle & Operating Context */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#ccff00] print:text-black border-b border-white/10 print:border-black pb-1">
            1. Equipment & Operational Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-black border border-white/10 p-3">
              <span className="text-white/40 block text-[10px] uppercase">Equipment ID:</span>
              <strong className="text-white print:text-black text-sm">{currentCase.vehicle_id}</strong>
            </div>
            <div className="bg-black border border-white/10 p-3">
              <span className="text-white/40 block text-[10px] uppercase">Model & OEM:</span>
              <span className="text-white print:text-black">{currentCase.model} ({vehicle?.manufacturer})</span>
            </div>
            <div className="bg-black border border-white/10 p-3">
              <span className="text-white/40 block text-[10px] uppercase">Duty & Load:</span>
              <span className="text-white print:text-black">{vehicle?.duty_class} ({vehicle?.load_profile})</span>
            </div>
            <div className="bg-black border border-white/10 p-3">
              <span className="text-white/40 block text-[10px] uppercase">Engine Hours:</span>
              <span className="text-[#ccff00] print:text-black font-bold">{vehicle?.operating_hours.toLocaleString()}h</span>
            </div>
          </div>
        </div>

        {/* Section 2: Failure Summary & Repetition */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#ccff00] print:text-black border-b border-white/10 print:border-black pb-1">
            2. Recurrence Episode Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-black border border-white/10 p-3">
              <span className="text-white/40 block text-[10px] uppercase">Recurrence Count:</span>
              <strong className="text-rose-400 print:text-black text-sm">{currentCase.recurrence_count} Episodes</strong>
            </div>
            <div className="bg-black border border-white/10 p-3">
              <span className="text-white/40 block text-[10px] uppercase">Time Window:</span>
              <span className="text-white print:text-black">{currentCase.time_window_days} Days</span>
            </div>
            <div className="bg-black border border-white/10 p-3">
              <span className="text-white/40 block text-[10px] uppercase">Accumulated Downtime:</span>
              <span className="text-rose-400 print:text-black font-bold">{currentCase.total_downtime_hours}h Lost</span>
            </div>
            <div className="bg-black border border-white/10 p-3">
              <span className="text-white/40 block text-[10px] uppercase">Subsystem:</span>
              <span className="text-white print:text-black">{currentCase.failure_category}</span>
            </div>
          </div>
          <div className="text-xs bg-black p-3.5 border border-white/10">
            <span className="text-white/40 font-mono uppercase text-[10px] tracking-wider block">Primary Reported Symptom: </span>
            <span className="text-white font-medium text-sm mt-1 block">{currentCase.primary_symptom}</span>
          </div>
        </div>

        {/* Section 3: Causal Graph Findings */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#ccff00] print:text-black border-b border-white/10 print:border-black pb-1">
            3. Root-Cause Dependency Graph Determination
          </h2>
          <div className="bg-black p-4 border border-white/10 space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-white/40 uppercase font-mono text-[10px] tracking-wider block">Underlying Physical Root Cause:</span>
                <span className="text-base font-black text-[#ccff00] uppercase italic tracking-tight print:text-black">{currentCase.top_root_cause}</span>
              </div>
              <div className="text-right">
                <span className="text-white/40 uppercase font-mono text-[10px] tracking-wider block">Graph Confidence:</span>
                <span className="font-mono text-[#ccff00] print:text-black text-base font-bold">{currentCase.confidence_score}%</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 font-mono">
              <span className="text-white/40 text-[10px] uppercase tracking-wider block">Decision Logic Scoring Weights:</span>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-1 text-[11px]">
                <div>Fault Code: {currentCase.score_breakdown.fault_code_consistency}%</div>
                <div>Recurrence: {currentCase.score_breakdown.recurrence_strength}%</div>
                <div>Part Rel: {currentCase.score_breakdown.part_relationship}%</div>
                <div>Condition: {currentCase.score_breakdown.operating_condition_relationship}%</div>
                <div>Symptom: {currentCase.score_breakdown.symptom_consistency}%</div>
                <div>Temporal: {currentCase.score_breakdown.temporal_consistency}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Symptom Fix vs Permanent Corrective Action */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#ccff00] print:text-black border-b border-white/10 print:border-black pb-1">
            4. Corrective Action Comparison & Reliability Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-black p-4 border border-rose-500/30 space-y-2">
              <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] block">
                Attempted Reactive Symptom Fix:
              </span>
              <p className="text-white/80">{currentCase.symptom_fix}</p>
              <span className="text-[10px] text-rose-400 italic block pt-1">
                Outcome: Failed repeatedly within 12-16 days.
              </span>
            </div>

            <div className="bg-black p-4 border border-[#ccff00]/40 space-y-2">
              <span className="text-[#ccff00] font-bold uppercase tracking-wider text-[10px] block">
                Permanent Engineering Action Prescribed:
              </span>
              <p className="text-white/90 font-medium">{currentCase.recommended_permanent_action}</p>
              <span className="text-[10px] text-[#ccff00] font-bold block pt-1">
                Expected Recurrence Reduction: -{currentCase.expected_recurrence_reduction}%
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Plan Change Audit Trail */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#ccff00] print:text-black border-b border-white/10 print:border-black pb-1">
            5. Maintenance Plan & Dispatcher Override Audit Trail
          </h2>
          {caseHistory.length > 0 ? (
            <div className="space-y-2">
              {caseHistory.map(h => (
                <div key={h.change_id} className="p-3.5 bg-black border border-white/10 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-[#ccff00] print:text-black">{h.change_id} • {h.user_name} ({h.user_role})</span>
                    <span className="text-white/40 print:text-gray-600">{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-white print:text-black"><strong>Committed Action:</strong> {h.new_plan}</div>
                  <div className="text-white/60 print:text-gray-600 italic"><strong>Mandatory Justification:</strong> "{h.reason}"</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40 font-mono italic">No human overrides recorded; system permanent action accepted in full.</p>
          )}
        </div>

        {/* Official Sign-off Footer */}
        <div className="pt-8 border-t border-white/15 print:border-black grid grid-cols-3 gap-8 text-xs text-white/40 print:text-gray-700 font-mono">
          <div>
            <div className="border-b border-white/20 print:border-black pb-8"></div>
            <div className="mt-2 uppercase text-[10px] tracking-wider">Lead Reliability Engineer</div>
          </div>
          <div>
            <div className="border-b border-white/20 print:border-black pb-8"></div>
            <div className="mt-2 uppercase text-[10px] tracking-wider">Mine Maintenance Superintendent</div>
          </div>
          <div>
            <div className="border-b border-white/20 print:border-black pb-8"></div>
            <div className="mt-2 uppercase text-[10px] tracking-wider">Quality & Audit Inspector</div>
          </div>
        </div>
      </div>
    </div>
  );
};
