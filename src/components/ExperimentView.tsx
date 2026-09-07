import React from 'react';
import { getExperimentEvaluation, getErrorAnalysisCaseStudies } from '../data/historyAndTesting';
import { BarChart3, AlertCircle } from 'lucide-react';

export const ExperimentView: React.FC = () => {
  const evalData = getExperimentEvaluation();
  const errorStudies = getErrorAnalysisCaseStudies();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-white/5 text-[#ccff00] border border-white/15 px-2 py-0.5">
              Synthetic Operational Trial (Seed: 42)
            </span>
            <div className="h-[1px] w-6 bg-white/20"></div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              105 Vehicles • 8 Months • 1,250 Work Orders
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
            Experiment Evaluation & Error Analysis
          </h2>
          <p className="text-xs text-white/60 font-light max-w-3xl leading-relaxed">
            Empirical benchmark comparing conventional reactive symptom repairs against the Root-Cause Dependency Graph intervention.
          </p>
        </div>

        <div className="bg-black px-4 py-2.5 border border-white/15 text-xs font-mono text-white/80 shrink-0">
          <span className="text-[#ccff00] font-bold uppercase">Protocol: </span>
          <span className="uppercase text-[11px] tracking-wider">Controlled Split-Period Intervention</span>
        </div>
      </div>

      {/* Before vs After Benchmark Comparison Table */}
      <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <BarChart3 className="w-4 h-4 text-[#ccff00]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
              Before vs After Intervention Measurement (Synthetic Experiment Results)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest font-bold">
            100% Reproducible Trial
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/5 text-white/40 uppercase font-mono text-[10px] tracking-[0.15em] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Reliability Metric</th>
                <th className="px-4 py-3">Baseline (Conventional)</th>
                <th className="px-4 py-3">Engineering Target</th>
                <th className="px-4 py-3">Measured Result</th>
                <th className="px-4 py-3">Improvement Delta</th>
                <th className="px-4 py-3 text-right">Trial Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {evalData.metrics_comparison.map(m => (
                <tr key={m.metric} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-white uppercase tracking-tight">{m.metric}</td>
                  <td className="px-4 py-3.5 font-mono text-rose-300">{m.baseline}</td>
                  <td className="px-4 py-3.5 font-mono text-white/40">{m.target}</td>
                  <td className="px-4 py-3.5 font-mono font-black text-[#ccff00] text-sm">{m.measured}</td>
                  <td className="px-4 py-3.5 text-white/90 font-mono">{m.improvement}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-black border-t border-white/10 text-xs text-white/60 leading-relaxed font-mono">
          <strong className="text-[#ccff00]">Methodology Note: </strong>
          {evalData.summary}
        </div>
      </div>

      {/* Experiment Design Details */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
          Controlled Experiment Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-light">
          <div className="bg-black p-4 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono text-[#ccff00] uppercase font-bold tracking-wider block">Phase 1: Baseline Generation</span>
            <p className="text-white/70 leading-relaxed">
              Vehicles operated under harsh Pilbara mine conditions. Work orders treated symptoms: technicians replaced coolant filters for overheating, swapped hydraulic pump cartridges for cavitation, and replaced brake packs for retarder overheating.
            </p>
          </div>

          <div className="bg-black p-4 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono text-[#ccff00] uppercase font-bold tracking-wider block">Phase 2: Graph Inference</span>
            <p className="text-white/70 leading-relaxed">
              Root-cause graph constructed multi-modal edges connecting operating dust, haul ramp grades, repeated part swaps, and ECU fault codes. Causal disambiguation algorithm scored upstream drivers.
            </p>
          </div>

          <div className="bg-black p-4 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono text-[#ccff00] uppercase font-bold tracking-wider block">Phase 3: Permanent Intervention</span>
            <p className="text-white/70 leading-relaxed">
              Permanent corrective actions were scheduled (ultrasonic radiator flushes, cyclonic pre-cleaners, retarder speed limit re-calibrations, vibration harness isolation). Recurrence rates dropped by 83.9%.
            </p>
          </div>
        </div>
      </div>

      {/* Error Analysis Section (Section 18) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-[#ccff00]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
            System Error Analysis & Edge Case Studies
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {errorStudies.map((study, idx) => (
            <div key={idx} className="bg-[#0d0d0d] border border-white/10 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-xs font-bold text-[#ccff00] bg-black px-2.5 py-0.5 border border-white/15">
                    {study.case_id}
                  </span>
                  <span className="text-sm font-black text-white uppercase italic tracking-tight">{study.case_type}</span>
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 text-white/80 border border-white/15">
                  {study.outcome}
                </span>
              </div>

              <div className="text-xs text-white/70 font-mono">
                <strong className="text-white uppercase">Scenario: </strong>{study.scenario}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-black p-3.5 border border-white/10">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">What Happened & Decision Logic:</div>
                  <div className="text-white/90 mt-1">{study.what_happened}</div>
                  <div className="text-white/40 mt-1 text-[11px] italic">{study.why_system_decided}</div>
                </div>

                <div className="bg-black p-3.5 border border-white/10">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Missing Evidence & Mitigation:</div>
                  <div className="text-white/90 mt-1">{study.missing_evidence}</div>
                  <div className="text-[#ccff00] mt-1 text-[11px]">{study.how_to_improve}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
