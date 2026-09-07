import React, { useState } from 'react';
import { PlanChangeRecord } from '../types';
import { Search, Filter, ShieldCheck } from 'lucide-react';

interface PlanHistoryViewProps {
  historyRecords: PlanChangeRecord[];
  onSelectCase: (caseId: string) => void;
}

export const PlanHistoryView: React.FC<PlanHistoryViewProps> = ({
  historyRecords,
  onSelectCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [overrideFilter, setOverrideFilter] = useState('All');

  const filtered = historyRecords.filter(r => {
    if (roleFilter !== 'All' && r.user_role !== roleFilter) return false;
    if (overrideFilter === 'Overrides' && !r.override_flag) return false;
    if (overrideFilter === 'Approvals' && r.override_flag) return false;

    const term = searchTerm.toLowerCase();
    return (
      r.change_id.toLowerCase().includes(term) ||
      r.case_id.toLowerCase().includes(term) ||
      r.vehicle_id.toLowerCase().includes(term) ||
      r.user_name.toLowerCase().includes(term) ||
      r.reason.toLowerCase().includes(term) ||
      r.new_plan.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-purple-950/80 text-purple-300 border border-purple-500/40 px-2 py-0.5">
              Append-Only Ledger
            </span>
            <div className="h-[1px] w-6 bg-white/20"></div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Cryptographic Plan Versioning
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
            Plan Change & Dispatcher Override History
          </h2>
          <p className="text-xs text-white/60 font-light max-w-3xl leading-relaxed">
            Every modification, approval, or deferral of an automated root-cause recommendation is recorded with cryptographic immutability and personnel accountability.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 text-xs font-mono text-white/80 bg-black px-4 py-2.5 border border-white/15 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
          <span className="uppercase tracking-wider text-[11px]">ISO 55000 / RCM-II Compliant</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d0d0d] border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
          <input
            id="input-search-history"
            type="text"
            placeholder="Search change ID, case ID, vehicle, dispatcher, justification reason..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/15 text-white text-xs pl-9 pr-3 py-2 focus:outline-none focus:border-[#ccff00] font-mono"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <Filter className="w-3.5 h-3.5 text-[#ccff00]" />
          <select
            id="filter-history-role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
          >
            <option value="All">All Roles</option>
            <option value="Dispatcher">Dispatcher</option>
            <option value="Maintenance Planner">Maintenance Planner</option>
            <option value="Reliability Engineer">Reliability Engineer</option>
          </select>

          <select
            id="filter-history-type"
            value={overrideFilter}
            onChange={e => setOverrideFilter(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
          >
            <option value="All">All Changes</option>
            <option value="Overrides">Overrides Only</option>
            <option value="Approvals">Approvals Only</option>
          </select>
        </div>
      </div>

      {/* History Records Table */}
      <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/5 text-white/40 uppercase font-mono text-[10px] tracking-[0.15em] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Change ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Case & Vehicle</th>
                <th className="px-4 py-3">User & Role</th>
                <th className="px-4 py-3">Audit Type</th>
                <th className="px-4 py-3">Previous Plan vs New Committed Plan</th>
                <th className="px-4 py-3">Operational Reason</th>
                <th className="px-4 py-3 text-right">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filtered.map(r => (
                <tr key={r.change_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#ccff00]">{r.change_id}</td>
                  <td className="px-4 py-3.5 font-mono text-white/40 whitespace-nowrap text-[11px]">
                    {new Date(r.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => onSelectCase(r.case_id)}
                      className="font-mono text-[#ccff00] hover:underline font-bold block cursor-pointer"
                    >
                      {r.case_id}
                    </button>
                    <span className="text-[10px] text-white/40 font-mono">{r.vehicle_id}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-white font-bold">{r.user_name}</div>
                    <div className="text-[10px] text-white/40 font-mono">{r.user_role}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {r.override_flag ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono tracking-wider">
                        Override
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-white/5 text-[#ccff00] border border-[#ccff00]/30 font-mono tracking-wider">
                        Approved
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 max-w-sm">
                    <div className="text-[10px] text-white/30 line-through truncate font-mono" title={r.previous_plan}>
                      Prev: {r.previous_plan}
                    </div>
                    <div className="text-[11px] text-white font-mono mt-0.5" title={r.new_plan}>
                      New: {r.new_plan}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs text-white/70 italic text-[11px]" title={r.reason}>
                    "{r.reason}"
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase font-mono tracking-wider ${
                        r.priority === 'Critical'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          : r.priority === 'High'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-white/5 text-white/80 border border-white/10'
                      }`}
                    >
                      {r.priority}
                    </span>
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
