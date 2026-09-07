import React, { useState } from 'react';
import { Vehicle, RepeatFailureCase } from '../types';
import { Search, SlidersHorizontal, AlertTriangle } from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  repeatCases: RepeatFailureCase[];
  onSelectCase: (caseId: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  repeatCases,
  onSelectCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dutyFilter, setDutyFilter] = useState('All');

  const filtered = vehicles.filter(v => {
    if (typeFilter !== 'All' && v.vehicle_type !== typeFilter) return false;
    if (dutyFilter !== 'All' && v.duty_class !== dutyFilter) return false;
    const term = searchTerm.toLowerCase();
    return (
      v.vehicle_id.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      v.manufacturer.toLowerCase().includes(term) ||
      v.site.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-white/5 text-[#ccff00] border border-white/15 px-2 py-0.5">
              Fleet Asset Registry
            </span>
            <div className="h-[1px] w-6 bg-white/20"></div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              105 Monitored Heavy Mining Units
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
            Heavy Mining Equipment Fleet
          </h2>
          <p className="text-xs text-white/60 font-light max-w-3xl leading-relaxed">
            Duty classification spectra, telemetry states, engine service meter intervals, and active recurring failure associations across pits.
          </p>
        </div>

        <div className="bg-black px-4 py-2.5 border border-white/15 font-mono text-right shrink-0">
          <div className="text-[9px] text-white/40 uppercase tracking-wider">Filtered Fleet</div>
          <div className="text-xl font-black text-white italic">{filtered.length} / {vehicles.length} Units</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0d0d0d] border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
          <input
            id="input-search-vehicles"
            type="text"
            placeholder="Search Vehicle ID (HT-042), Model, Manufacturer, Site Location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/15 text-white text-xs pl-9 pr-3 py-2 focus:outline-none focus:border-[#ccff00] font-mono"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#ccff00]" />
          <select
            id="filter-vehicle-equipment-type"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
          >
            <option value="All">All Equipment Types</option>
            <option value="Haul Truck">Haul Truck</option>
            <option value="Hydraulic Excavator">Hydraulic Excavator</option>
            <option value="Wheel Loader">Wheel Loader</option>
            <option value="Track Dozer">Track Dozer</option>
            <option value="Drill Rig">Drill Rig</option>
          </select>

          <select
            id="filter-vehicle-duty"
            value={dutyFilter}
            onChange={e => setDutyFilter(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
          >
            <option value="All">All Duty Classes</option>
            <option value="Ultra-Heavy">Ultra-Heavy</option>
            <option value="Heavy">Heavy</option>
            <option value="Standard">Standard</option>
            <option value="Severe-Haul">Severe-Haul</option>
          </select>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/5 text-white/40 uppercase font-mono text-[10px] tracking-[0.15em] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Vehicle ID</th>
                <th className="px-4 py-3">Type & Model</th>
                <th className="px-4 py-3">Manufacturer</th>
                <th className="px-4 py-3">Site Location</th>
                <th className="px-4 py-3">Duty Class</th>
                <th className="px-4 py-3">Operating Hours</th>
                <th className="px-4 py-3">Load Profile</th>
                <th className="px-4 py-3">Shift Pattern</th>
                <th className="px-4 py-3 text-right">Recurrence Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filtered.map(v => {
                const repeatCase = repeatCases.find(c => c.vehicle_id === v.vehicle_id);
                return (
                  <tr
                    key={v.vehicle_id}
                    className={`hover:bg-white/5 transition-colors ${
                      v.vehicle_id === 'HT-042' ? 'bg-[#ccff00]/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-[#ccff00]">
                      <div className="flex items-center space-x-1.5">
                        <span>{v.vehicle_id}</span>
                        {v.vehicle_id === 'HT-042' && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase bg-[#ccff00] text-black">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white uppercase tracking-tight">{v.model}</div>
                      <div className="text-[10px] text-white/40 font-mono">{v.vehicle_type}</div>
                    </td>
                    <td className="px-4 py-3.5 text-white/80">{v.manufacturer}</td>
                    <td className="px-4 py-3.5 text-white/80">{v.site}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-white/5 text-white/80 border border-white/10">
                        {v.duty_class}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-white/90">
                      {v.operating_hours.toLocaleString()}h
                    </td>
                    <td className="px-4 py-3.5 text-white/60 text-[11px] font-mono">{v.load_profile}</td>
                    <td className="px-4 py-3.5 text-white/50 text-[11px] font-mono">{v.shift_pattern}</td>
                    <td className="px-4 py-3.5 text-right">
                      {repeatCase ? (
                        <button
                          id={`btn-vehicle-repeat-${v.vehicle_id}`}
                          onClick={() => onSelectCase(repeatCase.case_id)}
                          className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-[10px] uppercase font-mono tracking-wider font-bold inline-flex items-center space-x-1 cursor-pointer transition"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>{repeatCase.recurrence_count}x Repeat</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-white/30 uppercase">Routine PM</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
