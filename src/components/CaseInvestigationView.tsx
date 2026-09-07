import React, { useState } from 'react';
import {
  RepeatFailureCase,
  Vehicle,
  WorkOrder
} from '../types';
import {
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  FileCheck,
  CheckCircle2,
  Calendar,
  Wrench,
  RotateCcw,
  Sliders,
  ChevronRight,
  History,
  Info
} from 'lucide-react';

interface CaseInvestigationViewProps {
  selectedCaseId: string;
  repeatCases: RepeatFailureCase[];
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  onSelectCase: (caseId: string) => void;
  onNavigateToGraph: (caseId: string) => void;
  onNavigateToExport: (caseId: string) => void;
  onNavigateToHistory: (caseId: string) => void;
  onSaveOverride: (caseId: string, overrideData: {
    new_plan: string;
    reason: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    user_role: any;
    user_name: string;
  }) => Promise<void>;
}

export const CaseInvestigationView: React.FC<CaseInvestigationViewProps> = ({
  selectedCaseId,
  repeatCases,
  vehicles,
  workOrders,
  onSelectCase,
  onNavigateToGraph,
  onNavigateToExport,
  onNavigateToHistory,
  onSaveOverride,
}) => {
  const currentCase = repeatCases.find(c => c.case_id === selectedCaseId) || repeatCases[0];
  const vehicle = vehicles.find(v => v.vehicle_id === currentCase?.vehicle_id);
  const caseWorkOrders = workOrders.filter(w => currentCase?.work_order_ids.includes(w.work_order_id));

  // Dispatcher Override Form state
  const [overrideAction, setOverrideAction] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overridePriority, setOverridePriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [dispatcherName, setDispatcherName] = useState('Greg Callahan (Shift Dispatch Lead)');
  const [dispatcherRole, setDispatcherRole] = useState<'Dispatcher' | 'Maintenance Planner' | 'Reliability Engineer'>('Dispatcher');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Provenance Modal state
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);

  if (!currentCase) {
    return <div className="p-12 text-center text-white/40 font-mono">No repeat failure case selected.</div>;
  }

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim() || !overrideAction.trim()) {
      alert('Both the new action plan and override justification reason are required.');
      return;
    }
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      await onSaveOverride(currentCase.case_id, {
        new_plan: overrideAction,
        reason: overrideReason,
        priority: overridePriority,
        user_role: dispatcherRole,
        user_name: dispatcherName,
      });
      setSaveSuccessMsg('Override recorded successfully in immutable audit trail.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to save override.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Selector & Quick Case Switcher */}
      <div className="bg-[#0d0d0d] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-white/5 border border-white/15 flex items-center justify-center text-[#ccff00] font-black text-sm font-mono italic">
            {currentCase.vehicle_id.slice(0, 2)}
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#ccff00] uppercase tracking-[0.25em]">
              Investigation Dossier / Case File
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-lg font-black text-white font-mono tracking-tight">{currentCase.case_id}</span>
              {currentCase.vehicle_id === 'HT-042' && (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-[#ccff00] text-black font-mono tracking-wider">
                  Canonical Demo
                </span>
              )}
              {currentCase.has_override && (
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono tracking-wider">
                  Overridden
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <label className="text-xs font-mono uppercase text-white/40 tracking-wider">Switch Case:</label>
          <select
            id="select-case-dropdown"
            value={currentCase.case_id}
            onChange={e => onSelectCase(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-1.5 focus:outline-none focus:border-[#ccff00] font-mono uppercase tracking-wider"
          >
            {repeatCases.map(c => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} — {c.vehicle_id} ({c.recurrence_count}x: {c.primary_symptom.slice(0, 28)}...)
              </option>
            ))}
          </select>

          <button
            id="btn-case-provenance"
            onClick={() => setShowProvenanceModal(true)}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-[#ccff00] hover:text-black text-white/90 border border-white/15 text-[10px] uppercase font-mono tracking-widest flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Provenance</span>
          </button>

          <button
            id="btn-case-graph"
            onClick={() => onNavigateToGraph(currentCase.case_id)}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-[10px] uppercase font-mono tracking-widest flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Graph</span>
          </button>

          <button
            id="btn-case-export"
            onClick={() => onNavigateToExport(currentCase.case_id)}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-[10px] uppercase font-mono tracking-widest flex items-center space-x-1.5 transition cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-white/80" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Case Header Details & Vehicle Context */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d0d] border border-white/10 p-4 space-y-2">
          <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Target Unit</div>
          <div className="text-xl font-black text-white italic tracking-tight">{currentCase.vehicle_id}</div>
          <div className="text-xs text-white/60">{currentCase.model}</div>
          <div className="text-[11px] text-white/50 pt-2 border-t border-white/10 flex items-center justify-between font-mono">
            <span>Operating Hours:</span>
            <span className="text-[#ccff00] font-bold">{vehicle?.operating_hours.toLocaleString() || '18,450'}h</span>
          </div>
          <div className="text-[11px] text-white/50 flex items-center justify-between font-mono">
            <span>Bench / Site:</span>
            <span className="text-white/80">{currentCase.site}</span>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 p-4 space-y-2">
          <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Duty & Stress</div>
          <div className="text-xl font-black text-[#ccff00] italic tracking-tight">{vehicle?.duty_class || 'Ultra-Heavy'}</div>
          <div className="text-xs text-white/60">{vehicle?.load_profile || 'High Payload (+15%)'}</div>
          <div className="text-[11px] text-white/50 pt-2 border-t border-white/10 flex items-center justify-between font-mono">
            <span>Shift Pattern:</span>
            <span className="text-white/80">{vehicle?.shift_pattern || 'Continuous 24/7'}</span>
          </div>
          <div className="text-[11px] text-white/50 flex items-center justify-between font-mono">
            <span>Machine Status:</span>
            <span className="text-rose-400 font-bold">{vehicle?.status || 'Restricted Duty'}</span>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-rose-500/30 bg-rose-950/10 p-4 space-y-2">
          <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Recurrence Frequency</div>
          <div className="text-xl font-black text-rose-300 italic tracking-tight">{currentCase.recurrence_count} Episodes</div>
          <div className="text-xs text-white/60">Within {currentCase.time_window_days} Calendar Days</div>
          <div className="text-[11px] text-white/50 pt-2 border-t border-rose-500/20 flex items-center justify-between font-mono">
            <span>Lost Downtime:</span>
            <span className="text-rose-400 font-bold">{currentCase.total_downtime_hours}h</span>
          </div>
          <div className="text-[11px] text-white/50 flex items-center justify-between font-mono">
            <span>First Detected:</span>
            <span className="text-white/80">{currentCase.first_detected_date}</span>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-[#ccff00]/40 bg-[#ccff00]/5 p-4 space-y-2">
          <div className="text-[10px] font-mono text-[#ccff00] uppercase tracking-wider">Root Cause Confidence</div>
          <div className="text-2xl font-black text-[#ccff00] italic tracking-tight flex items-center space-x-2">
            <span>{currentCase.confidence_score}%</span>
            <span className="text-[9px] not-italic uppercase font-mono px-2 py-0.5 bg-[#ccff00] text-black font-bold">
              High
            </span>
          </div>
          <div className="text-xs text-white/60">Recurrence Reduction: -{currentCase.expected_recurrence_reduction}%</div>
          <div className="text-[11px] text-white/50 pt-2 border-t border-[#ccff00]/20 flex items-center justify-between font-mono">
            <span>Engine Logic:</span>
            <span className="text-white/80">Causal Directed Graph</span>
          </div>
          <div className="text-[11px] text-white/50 flex items-center justify-between font-mono">
            <span>Orders Linked:</span>
            <span className="text-[#ccff00] font-bold">{currentCase.work_order_ids.length} Work Orders</span>
          </div>
        </div>
      </div>

      {/* CORE DISCOVERY: Symptom-Level Fix vs Permanent Corrective Action */}
      <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-[#ccff00]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
              Root-Cause Disambiguation / Symptom vs Permanent Plan
            </h3>
          </div>
          <span className="text-[10px] text-[#ccff00] font-mono uppercase tracking-widest">
            Derived by Causal Graph
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: What Conventional Maintenance Did (Symptom-Level Fix) */}
          <div className="bg-black border border-rose-500/30 p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-widest">
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span>Conventional Symptom Fix (Reactive Cycle)</span>
            </div>

            <div>
              <div className="text-[10px] text-white/40 uppercase font-mono">Observed Symptom:</div>
              <div className="text-sm font-semibold text-white mt-1">{currentCase.primary_symptom}</div>
            </div>

            <div>
              <div className="text-[10px] text-white/40 uppercase font-mono">Repeated Reactive Action:</div>
              <div className="text-xs text-rose-200 bg-rose-950/40 border border-rose-500/30 p-3 mt-1 font-mono">
                {currentCase.symptom_fix}
              </div>
            </div>

            <div className="text-xs text-white/50 space-y-1.5 pt-3 border-t border-white/10">
              <div className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Repeated 4 times across last 45 days without addressing dust fin fouling or intake blockage.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Mean-time-between-failure (MTBF) remained trapped at 12–16 days.</span>
              </div>
            </div>
          </div>

          {/* Right: What the Root-Cause Graph Discovered (Permanent Corrective Action) */}
          <div className="bg-black border border-[#ccff00]/40 p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-[#ccff00] text-xs font-mono font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
              <span>Permanent Root-Cause Corrective Action</span>
            </div>

            <div>
              <div className="text-[10px] text-white/40 uppercase font-mono">Discovered Root Cause:</div>
              <div className="text-sm font-bold text-white mt-1 uppercase italic tracking-tight">{currentCase.top_root_cause}</div>
            </div>

            <div>
              <div className="text-[10px] text-white/40 uppercase font-mono">Engineering Intervention Prescribed:</div>
              <div className="text-xs text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/30 p-3 mt-1 leading-relaxed font-mono font-medium">
                {currentCase.recommended_permanent_action}
              </div>
            </div>

            <div className="text-xs text-white/80 flex items-center justify-between pt-3 border-t border-white/10 font-mono">
              <span className="text-[#ccff00] font-bold">Recurrence Reduction:</span>
              <span className="text-base font-black text-[#ccff00]">-{currentCase.expected_recurrence_reduction}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Scoring Formula Evidence Breakdown */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-[#ccff00]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
              Decision Formula Weight Vector
            </h3>
          </div>
          <span className="text-xs text-[#ccff00] font-mono font-bold">Confidence: {currentCase.confidence_score} / 100</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div className="bg-black border border-white/10 p-3 space-y-1">
            <div className="text-white/40 text-[9px] uppercase font-mono tracking-wider">Fault Consistency (25%)</div>
            <div className="text-xl font-black text-white italic">{currentCase.score_breakdown.fault_code_consistency}%</div>
            <div className="text-[9px] text-white/40 font-mono">ECU telemetry</div>
          </div>

          <div className="bg-black border border-white/10 p-3 space-y-1">
            <div className="text-white/40 text-[9px] uppercase font-mono tracking-wider">Recurrence (20%)</div>
            <div className="text-xl font-black text-white italic">{currentCase.score_breakdown.recurrence_strength}%</div>
            <div className="text-[9px] text-white/40 font-mono">Incident cluster</div>
          </div>

          <div className="bg-black border border-white/10 p-3 space-y-1">
            <div className="text-white/40 text-[9px] uppercase font-mono tracking-wider">Part Rel. (20%)</div>
            <div className="text-xl font-black text-white italic">{currentCase.score_breakdown.part_relationship}%</div>
            <div className="text-[9px] text-white/40 font-mono">Repeated swap</div>
          </div>

          <div className="bg-black border border-white/10 p-3 space-y-1">
            <div className="text-white/40 text-[9px] uppercase font-mono tracking-wider">Condition (15%)</div>
            <div className="text-xl font-black text-white italic">{currentCase.score_breakdown.operating_condition_relationship}%</div>
            <div className="text-[9px] text-white/40 font-mono">Dust / ramp grade</div>
          </div>

          <div className="bg-black border border-white/10 p-3 space-y-1">
            <div className="text-white/40 text-[9px] uppercase font-mono tracking-wider">Symptom (10%)</div>
            <div className="text-xl font-black text-white italic">{currentCase.score_breakdown.symptom_consistency}%</div>
            <div className="text-[9px] text-white/40 font-mono">NLP similarity</div>
          </div>

          <div className="bg-black border border-white/10 p-3 space-y-1">
            <div className="text-white/40 text-[9px] uppercase font-mono tracking-wider">Temporal (10%)</div>
            <div className="text-xl font-black text-white italic">{currentCase.score_breakdown.temporal_consistency}%</div>
            <div className="text-[9px] text-white/40 font-mono">30-day window</div>
          </div>
        </div>

        {/* Evidence bullet points */}
        <div className="pt-3 border-t border-white/10">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono text-white/50 mb-2">
            Multi-Modal Evidence Corroboration:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentCase.evidence_summary.map((ev, i) => (
              <div key={i} className="flex items-start space-x-2 text-xs text-white/80 bg-black p-2.5 border border-white/10">
                <span className="w-1.5 h-1.5 bg-[#ccff00] mt-1.5 shrink-0"></span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Operational Evidence Timeline */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-4 h-4 text-[#ccff00]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
              Operational Chronology / Work Order Cascade
            </h3>
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            Sequential Evidence Chain
          </span>
        </div>

        <div className="relative border-l-2 border-white/15 ml-4 pl-6 space-y-6">
          {caseWorkOrders.map((wo, index) => (
            <div key={wo.work_order_id} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] top-0 w-5 h-5 bg-black border border-white/40 flex items-center justify-center font-mono text-[9px] font-bold text-white">
                {index + 1}
              </div>

              <div className="bg-black border border-white/10 p-4 hover:border-white/30 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#ccff00]">{wo.work_order_id}</span>
                    <span className="text-xs text-white/40 font-mono">({wo.date} • {wo.shift})</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40">
                      Recurrence #{wo.recurrence_count}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-white/60 font-mono">
                    <span>Downtime: <strong className="text-white">{wo.downtime_hours}h</strong></span>
                    <span>Fault: <strong className="text-[#ccff00]">{wo.fault_code}</strong></span>
                  </div>
                </div>

                <div className="mt-2 text-xs font-medium text-white/90">
                  {wo.symptom}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-mono">Attempted Repair:</div>
                    <div className="text-white/80 mt-0.5">{wo.repair_action}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-mono">Replaced Part:</div>
                    <div className="text-white/80 mt-0.5 font-mono">{wo.replaced_part} ({wo.part_id})</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-mono">Operating Context:</div>
                    <div className="text-white/80 mt-0.5">{wo.environmental_condition} | {wo.terrain_condition}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Final Resolution Node on Timeline */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-5 h-5 bg-[#ccff00] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            </div>
            <div className="bg-black border border-[#ccff00]/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-[#ccff00] tracking-widest">
                  Root-Cause Graph Convergence
                </span>
                <span className="text-xs text-[#ccff00] font-mono font-bold">{currentCase.confidence_score}% Confidence</span>
              </div>
              <div className="text-sm font-black text-white uppercase italic tracking-tight mt-1">
                Permanent Engineering Action Prescribed
              </div>
              <div className="text-xs text-white/80 mt-1 font-mono">{currentCase.recommended_permanent_action}</div>
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCHER & MAINTENANCE PLANNER OVERRIDE PANEL */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <Wrench className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
              Dispatcher & Planner Human-in-the-Loop Override
            </h3>
          </div>
          <button
            onClick={() => onNavigateToHistory(currentCase.case_id)}
            className="text-xs text-white/60 hover:text-[#ccff00] flex items-center space-x-1.5 font-mono uppercase tracking-wider transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>View Audit History</span>
          </button>
        </div>

        <p className="text-xs text-white/60 leading-relaxed font-light">
          The causal graph recommendation is advisory. Maintenance personnel and shift dispatchers hold ultimate operational decision authority. Any modification or deferral of the permanent action plan is captured in an append-only ISO-55000 audit ledger.
        </p>

        {saveSuccessMsg && (
          <div className="p-3 bg-[#ccff00]/10 border border-[#ccff00] text-[#ccff00] text-xs flex items-center space-x-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleOverrideSubmit} className="space-y-4 bg-black border border-white/10 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">User Role</label>
              <select
                id="select-override-role"
                value={dispatcherRole}
                onChange={e => setDispatcherRole(e.target.value as any)}
                className="w-full mt-1 bg-[#0d0d0d] border border-white/15 text-white text-xs p-2.5 focus:outline-none focus:border-[#ccff00] font-mono uppercase"
              >
                <option value="Dispatcher">Shift Dispatcher</option>
                <option value="Maintenance Planner">Maintenance Planner</option>
                <option value="Reliability Engineer">Reliability Engineer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Officer Name</label>
              <input
                id="input-override-user"
                type="text"
                value={dispatcherName}
                onChange={e => setDispatcherName(e.target.value)}
                className="w-full mt-1 bg-[#0d0d0d] border border-white/15 text-white text-xs p-2.5 focus:outline-none focus:border-[#ccff00] font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Priority Level</label>
              <select
                id="select-override-priority"
                value={overridePriority}
                onChange={e => setOverridePriority(e.target.value as any)}
                className="w-full mt-1 bg-[#0d0d0d] border border-white/15 text-white text-xs p-2.5 focus:outline-none focus:border-[#ccff00] font-mono uppercase font-bold text-[#ccff00]"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              Current Active Plan (System Recommendation or Prior Override)
            </label>
            <div className="p-3 bg-[#0d0d0d] border border-white/10 text-xs text-white/80 font-mono mt-1">
              {currentCase.current_plan}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">
              New Plan Action (Overriding System Recommendation) *
            </label>
            <textarea
              id="textarea-override-plan"
              rows={2}
              value={overrideAction}
              onChange={e => setOverrideAction(e.target.value)}
              placeholder="e.g. Defer radiator core flush until weekend shift; implement temporary 18 km/h ramp speed cap and continuous thermal telemetry monitoring"
              className="w-full mt-1 bg-[#0d0d0d] border border-white/15 text-white text-xs p-3 focus:outline-none focus:border-[#ccff00] font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">
              Mandatory Operational Justification Reason *
            </label>
            <input
              id="input-override-reason"
              type="text"
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              placeholder="e.g. Critical haulage production quota requires 36 hours buffer before removing haul truck to maintenance bay"
              className="w-full mt-1 bg-[#0d0d0d] border border-white/15 text-white text-xs p-3 focus:outline-none focus:border-[#ccff00] font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
              Immutable ISO-55000 Append-Only Ledger Entry
            </span>
            <button
              id="btn-save-override"
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#ccff00] hover:bg-white text-black font-black uppercase text-xs tracking-widest transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.2)]"
            >
              <span>{isSaving ? 'Logging Override...' : 'Commit Dispatcher Override'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* PROVENANCE MODAL */}
      {showProvenanceModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0d0d0d] border border-white/15 max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-[0.2em]">Data Provenance Chain</span>
                <h3 className="text-base font-black text-white uppercase italic">Evidence Ledger for {currentCase.case_id}</h3>
              </div>
              <button
                id="btn-close-provenance"
                onClick={() => setShowProvenanceModal(false)}
                className="px-3 py-1 bg-white/5 hover:bg-white/15 text-white text-[10px] uppercase font-mono tracking-widest cursor-pointer border border-white/15"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-black p-3.5 border border-white/10">
                <div className="font-bold text-[#ccff00] uppercase font-mono text-[10px] tracking-wider">Identified Root Cause:</div>
                <div className="text-white text-sm mt-1 uppercase italic font-bold">{currentCase.top_root_cause}</div>
                <div className="text-[11px] text-white/50 mt-1 font-mono">Confidence: {currentCase.confidence_score}%</div>
              </div>

              <div>
                <div className="font-bold text-white/50 uppercase font-mono text-[10px] tracking-wider mb-1.5">
                  Supporting Work Orders ({caseWorkOrders.length}):
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {caseWorkOrders.map(wo => (
                    <div key={wo.work_order_id} className="p-2.5 bg-black border border-white/10 flex justify-between items-center text-[11px]">
                      <span className="font-mono text-[#ccff00]">{wo.work_order_id} ({wo.date})</span>
                      <span className="text-white/80">{wo.symptom}</span>
                      <span className="font-mono text-rose-300">{wo.fault_code}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black p-3 border border-white/10">
                  <div className="font-bold text-white/50 uppercase font-mono text-[10px] tracking-wider mb-1">Fault Codes Logged:</div>
                  {currentCase.fault_codes.map(f => (
                    <div key={f} className="font-mono text-[#ccff00] text-[11px]">• {f}</div>
                  ))}
                </div>
                <div className="bg-black p-3 border border-white/10">
                  <div className="font-bold text-white/50 uppercase font-mono text-[10px] tracking-wider mb-1">Replaced Parts:</div>
                  {currentCase.replaced_parts.map(p => (
                    <div key={p} className="text-white/80 text-[11px]">• {p}</div>
                  ))}
                </div>
              </div>

              <div className="bg-black p-3 border border-white/10">
                <div className="font-bold text-white/50 uppercase font-mono text-[10px] tracking-wider mb-1">Operating Conditions Correlated:</div>
                {currentCase.operating_conditions.map((cond, i) => (
                  <div key={i} className="text-white/80 text-[11px]">• {cond}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
