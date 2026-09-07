import React, { useState } from 'react';
import { RepeatFailureCase } from '../types';
import {
  Search,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface RepeatFailuresViewProps {
  repeatCases: RepeatFailureCase[];
  onSelectCase: (caseId: string) => void;
}

export const RepeatFailuresView: React.FC<RepeatFailuresViewProps> = ({
  repeatCases,
  onSelectCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = repeatCases.filter(c => {
    if (filterCategory !== 'All' && c.failure_category !== filterCategory) return false;
    if (filterStatus !== 'All') {
      if (filterStatus === 'Overridden' && !c.has_override) return false;
      if (filterStatus === 'Investigating' && c.status !== 'Investigating') return false;
      if (filterStatus === 'Open' && c.status !== 'Open') return false;
    }
    const term = searchTerm.toLowerCase();
    return (
      c.case_id.toLowerCase().includes(term) ||
      c.vehicle_id.toLowerCase().includes(term) ||
      c.primary_symptom.toLowerCase().includes(term) ||
      c.top_root_cause.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-rose-950/80 text-rose-300 border border-rose-500/40 px-2 py-0.5">
              Recurrence Detection Engine
            </span>
            <div className="h-[1px] w-6 bg-white/20"></div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              30-Day Sliding Recurrence Window
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
            Detected Repeat Failure Incidents
          </h2>
          <p className="text-xs text-white/60 font-light max-w-3xl leading-relaxed">
            Mining machinery displaying recurrent failure loops where baseline maintenance repeatedly replaced components without resolving core upstream causes.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs shrink-0">
          <div className="bg-black px-4 py-2.5 border border-white/15 font-mono text-right">
            <div className="text-[9px] text-white/40 uppercase tracking-wider">Total Clustered</div>
            <div className="text-xl font-black text-[#ccff00] italic">{repeatCases.length} Cases</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d0d0d] border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
          <input
            id="input-search-repeats"
            type="text"
            placeholder="Search Case ID, Vehicle ID (HT-042), Symptom, or Root Cause..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/15 text-white text-xs pl-9 pr-3 py-2 focus:outline-none focus:border-[#ccff00] font-mono"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#ccff00]" />
          <select
            id="filter-repeat-category"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
          >
            <option value="All">All Categories</option>
            <option value="Engine">Engine</option>
            <option value="Hydraulics">Hydraulics</option>
            <option value="Braking">Braking</option>
            <option value="Electrical/Drive">Electrical/Drive</option>
            <option value="Structural/Chassis">Structural/Chassis</option>
          </select>

          <select
            id="filter-repeat-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
          >
            <option value="All">All Statuses</option>
            <option value="Investigating">Investigating</option>
            <option value="Open">Open</option>
            <option value="Overridden">Overridden</option>
          </select>
        </div>
      </div>

      {/* Repeat Cases Table */}
      <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/5 text-white/40 uppercase font-mono text-[10px] tracking-[0.15em] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Recurrence</th>
                <th className="px-4 py-3">Symptom</th>
                <th className="px-4 py-3">Discovered Root Cause</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Lost Downtime</th>
                <th className="px-4 py-3">Active Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filtered.map(c => (
                <tr
                  key={c.case_id}
                  className={`hover:bg-white/5 transition-colors ${
                    c.vehicle_id === 'HT-042' ? 'bg-[#ccff00]/5' : ''
                  }`}
                >
                  <td className="px-4 py-3.5 font-mono font-bold text-[#ccff00]">
                    <div className="flex items-center space-x-1.5">
                      <span>{c.case_id}</span>
                      {c.vehicle_id === 'HT-042' && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase bg-[#ccff00] text-black">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white uppercase tracking-tight">{c.vehicle_id}</div>
                    <div className="text-[10px] text-white/40 font-mono">{c.model} • {c.site}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold font-mono uppercase bg-rose-950/60 text-rose-300 border border-rose-500/40">
                      {c.recurrence_count}x in {c.time_window_days}d
                    </span>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs truncate text-white/90 font-medium" title={c.primary_symptom}>
                    {c.primary_symptom}
                  </td>
                  <td className="px-4 py-3.5 max-w-xs truncate text-[#ccff00] font-mono text-[11px]" title={c.top_root_cause}>
                    {c.top_root_cause}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-white/10 h-1 overflow-hidden">
                        <div
                          className="bg-[#ccff00] h-full"
                          style={{ width: `${c.confidence_score}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[#ccff00] font-bold text-xs">{c.confidence_score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-white/80">{c.total_downtime_hours}h</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                        c.has_override
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                          : c.status === 'Investigating'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                          : 'bg-white/10 text-white/80 border border-white/15'
                      }`}
                    >
                      {c.has_override ? 'Overridden' : c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      id={`btn-open-repeat-${c.case_id}`}
                      onClick={() => onSelectCase(c.case_id)}
                      className="px-3 py-1 bg-white/5 hover:bg-[#ccff00] hover:text-black text-white/90 text-[10px] uppercase font-mono tracking-widest transition border border-white/15 cursor-pointer ml-auto flex items-center space-x-1"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
