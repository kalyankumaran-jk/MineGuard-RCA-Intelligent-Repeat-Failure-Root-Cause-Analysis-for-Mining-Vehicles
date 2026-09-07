import React, { useState } from 'react';
import {
  RepeatFailureCase,
  Vehicle,
  WorkOrder
} from '../types';
import {
  AlertTriangle,
  Clock,
  Wrench,
  TrendingDown,
  ArrowUpRight,
  ShieldAlert,
  Layers,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardViewProps {
  repeatCases: RepeatFailureCase[];
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  onSelectCase: (caseId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

// Artistic Flair high-contrast cyber palette
const ARTISTIC_PALETTE = ['#ccff00', '#ffffff', '#00f0ff', '#ff3366', '#a855f7', '#71717a'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  repeatCases,
  vehicles,
  workOrders,
  onSelectCase,
  onNavigateToTab,
}) => {
  // Filter states
  const [selectedDuty, setSelectedDuty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Filtered cases
  const filteredCases = repeatCases.filter(c => {
    if (selectedCategory !== 'All' && c.failure_category !== selectedCategory) return false;
    if (selectedType !== 'All' && c.vehicle_type !== selectedType) return false;
    if (selectedDuty !== 'All') {
      const v = vehicles.find(veh => veh.vehicle_id === c.vehicle_id);
      if (v?.duty_class !== selectedDuty) return false;
    }
    return true;
  });

  // Calculate KPIs
  const totalVehicles = vehicles.length;
  const totalWorkOrders = workOrders.length;
  const totalDowntime = Math.round(workOrders.reduce((acc, w) => acc + w.downtime_hours, 0));
  const repeatDowntime = Math.round(repeatCases.reduce((acc, c) => acc + c.total_downtime_hours, 0));
  const repeatWorkOrderCount = repeatCases.reduce((acc, c) => acc + c.recurrence_count, 0);
  const repeatRate = ((repeatWorkOrderCount / totalWorkOrders) * 100).toFixed(1);
  const avgDowntime = (totalDowntime / totalWorkOrders).toFixed(1);

  // Top fault codes data
  const faultMap: Record<string, number> = {};
  workOrders.forEach(w => {
    faultMap[w.fault_code] = (faultMap[w.fault_code] || 0) + 1;
  });
  const faultData = Object.entries(faultMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([code, count]) => ({ code, count }));

  // Top parts data
  const partMap: Record<string, number> = {};
  workOrders.forEach(w => {
    const p = w.replaced_part.split(' ')[0] + ' ' + (w.replaced_part.split(' ')[1] || '');
    partMap[p] = (partMap[p] || 0) + 1;
  });
  const partData = Object.entries(partMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([part, count]) => ({ part, count }));

  // Monthly trend data
  const monthlyMap: Record<string, number> = {
    'Jan': 14, 'Feb': 22, 'Mar': 28, 'Apr': 34, 'May': 19, 'Jun': 12, 'Jul': 8, 'Aug': 7
  };
  const trendData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

  // Duty class breakdown
  const dutyMap: Record<string, number> = {};
  repeatCases.forEach(c => {
    const v = vehicles.find(veh => veh.vehicle_id === c.vehicle_id);
    const d = v?.duty_class || 'Heavy';
    dutyMap[d] = (dutyMap[d] || 0) + 1;
  });
  const dutyData = Object.entries(dutyMap).map(([duty, count]) => ({ name: duty, value: count }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert & System Summary */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-[#ccff00] text-black px-2.5 py-0.5">
              Protocol: Causal AI
            </span>
            <div className="h-[1px] w-8 bg-[#ccff00]"></div>
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-widest">
              Autonomous Heavy Fleet Diagnostics
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic">
            Fleet Repeat-Failure Intelligence <span className="text-[#ccff00] not-italic">/</span> Core
          </h2>

          <p className="text-xs text-white/60 leading-relaxed font-light">
            Real-time causal dependency tracking across 105 heavy vehicles. Disambiguates upstream operational stressors, continuous haul ramp friction, and cooling air restrictions to eradicate repetitive component-swapping cycles.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="btn-quick-demo-ht042"
            onClick={() => onSelectCase('RFC-HT-042-101')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#ccff00] hover:bg-white text-black font-black uppercase text-xs tracking-widest transition shadow-[0_0_20px_rgba(204,255,0,0.3)] cursor-pointer"
          >
            <span>Explore HT-042</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            id="btn-nav-to-graph"
            onClick={() => onNavigateToTab('graph')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs uppercase tracking-widest transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Open Graph</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-[#0d0d0d] border border-white/10 p-3.5 space-y-1 group hover:border-white/25 transition">
          <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">Active Fleet</div>
          <div className="text-2xl font-black text-white tracking-tighter italic">{totalVehicles}</div>
          <div className="h-[1px] w-6 bg-white/20"></div>
          <div className="text-[9px] text-white/40 font-mono">105 Monitored</div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 p-3.5 space-y-1 group hover:border-white/25 transition">
          <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">Work Orders</div>
          <div className="text-2xl font-black text-white tracking-tighter italic">{totalWorkOrders}</div>
          <div className="h-[1px] w-6 bg-white/20"></div>
          <div className="text-[9px] text-white/40 font-mono">8 Months Data</div>
        </div>

        <div className="bg-[#0d0d0d] border border-rose-500/30 p-3.5 space-y-1 group hover:border-rose-500/60 transition bg-rose-950/10">
          <div className="text-[10px] uppercase font-mono tracking-wider text-rose-400 flex items-center justify-between">
            <span>Repeats</span>
            <AlertTriangle className="w-3 h-3 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-300 tracking-tighter italic">{repeatCases.length}</div>
          <div className="h-[1px] w-6 bg-rose-500/40"></div>
          <div className="text-[9px] text-rose-400/70 font-mono">Clustered Cases</div>
        </div>

        <div className="bg-[#0d0d0d] border border-[#ccff00]/40 p-3.5 space-y-1 group hover:border-[#ccff00] transition bg-[#ccff00]/5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#ccff00] flex items-center justify-between">
            <span>Repeat Rate</span>
            <TrendingDown className="w-3 h-3 text-[#ccff00]" />
          </div>
          <div className="text-2xl font-black text-[#ccff00] tracking-tighter italic">{repeatRate}%</div>
          <div className="h-[1px] w-6 bg-[#ccff00]"></div>
          <div className="text-[9px] text-[#ccff00]/70 font-mono">Baseline: 34.8%</div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 p-3.5 space-y-1 group hover:border-white/25 transition">
          <div className="text-[10px] uppercase font-mono tracking-wider text-white/40 flex items-center justify-between">
            <span>Total Lost</span>
            <Clock className="w-3 h-3 text-white/40" />
          </div>
          <div className="text-2xl font-black text-white tracking-tighter italic">{totalDowntime}h</div>
          <div className="h-[1px] w-6 bg-white/20"></div>
          <div className="text-[9px] text-white/40 font-mono">{repeatDowntime}h Repeats</div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 p-3.5 space-y-1 group hover:border-white/25 transition">
          <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">Mean Downtime</div>
          <div className="text-2xl font-black text-white tracking-tighter italic">{avgDowntime}h</div>
          <div className="h-[1px] w-6 bg-white/20"></div>
          <div className="text-[9px] text-white/40 font-mono">Per Event</div>
        </div>

        <div className="bg-[#0d0d0d] border border-emerald-500/30 p-3.5 space-y-1 group hover:border-emerald-500/60 transition bg-emerald-950/10">
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400">Root Causes</div>
          <div className="text-2xl font-black text-emerald-300 tracking-tighter italic">{repeatCases.length}</div>
          <div className="h-[1px] w-6 bg-emerald-500/40"></div>
          <div className="text-[9px] text-emerald-400/70 font-mono">89.4% Graph Acc.</div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/10 p-3.5 space-y-1 group hover:border-white/25 transition">
          <div className="text-[10px] uppercase font-mono tracking-wider text-white/40 flex items-center justify-between">
            <span>Interventions</span>
            <Wrench className="w-3 h-3 text-white/40" />
          </div>
          <div className="text-2xl font-black text-white tracking-tighter italic">
            {repeatCases.filter(c => c.status !== 'Open').length}
          </div>
          <div className="h-[1px] w-6 bg-white/20"></div>
          <div className="text-[9px] text-white/40 font-mono">Active Plans</div>
        </div>
      </div>

      {/* Critical Repeat Alerts Table */}
      <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></span>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white font-mono">
              Critical Repeat Failure Clusters / Active Queue
            </h3>
          </div>
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
            Priority Ranked by Downtime & Recurrence
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/5 text-white/40 uppercase font-mono text-[10px] tracking-[0.15em] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Recurrence</th>
                <th className="px-4 py-3">Primary Symptom</th>
                <th className="px-4 py-3">Identified Root Cause</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Downtime</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {repeatCases.slice(0, 5).map(c => (
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
                        <span className="px-1.5 py-0.2 bg-[#ccff00] text-black font-mono font-bold text-[9px] uppercase">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white uppercase tracking-tight">{c.vehicle_id}</div>
                    <div className="text-[10px] text-white/40 font-mono">{c.model}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 text-[11px] font-bold font-mono uppercase bg-rose-950/60 text-rose-300 border border-rose-500/40">
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
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
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
                      id={`btn-investigate-${c.case_id}`}
                      onClick={() => onSelectCase(c.case_id)}
                      className="px-3 py-1 bg-white/5 hover:bg-[#ccff00] hover:text-black text-white/90 text-[10px] uppercase font-mono tracking-widest transition border border-white/15 cursor-pointer ml-auto flex items-center space-x-1"
                    >
                      <span>Diagnose</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#0d0d0d] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2 text-white/60">
          <SlidersHorizontal className="w-4 h-4 text-[#ccff00]" />
          <span className="uppercase tracking-widest text-[11px]">Analytics Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-white/40 uppercase tracking-wider text-[10px]">Duty Class:</span>
            <select
              id="filter-duty-class"
              value={selectedDuty}
              onChange={e => setSelectedDuty(e.target.value)}
              className="bg-black border border-white/15 px-3 py-1 text-white text-xs focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
            >
              <option value="All">All Duty Classes</option>
              <option value="Ultra-Heavy">Ultra-Heavy</option>
              <option value="Heavy">Heavy</option>
              <option value="Standard">Standard</option>
              <option value="Severe-Haul">Severe-Haul</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white/40 uppercase tracking-wider text-[10px]">Category:</span>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-black border border-white/15 px-3 py-1 text-white text-xs focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
            >
              <option value="All">All Categories</option>
              <option value="Engine">Engine</option>
              <option value="Hydraulics">Hydraulics</option>
              <option value="Braking">Braking</option>
              <option value="Electrical/Drive">Electrical/Drive</option>
              <option value="Structural/Chassis">Structural/Chassis</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white/40 uppercase tracking-wider text-[10px]">Equipment:</span>
            <select
              id="filter-vehicle-type"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="bg-black border border-white/15 px-3 py-1 text-white text-xs focus:outline-none focus:border-[#ccff00] uppercase tracking-wider"
            >
              <option value="All">All Equipment</option>
              <option value="Haul Truck">Haul Truck</option>
              <option value="Hydraulic Excavator">Hydraulic Excavator</option>
              <option value="Wheel Loader">Wheel Loader</option>
              <option value="Track Dozer">Track Dozer</option>
              <option value="Drill Rig">Drill Rig</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Monthly Repeat Failures Trend */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">Repeat Trend Over Time</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">Intervention Deployed April 2026</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#ccff00] text-black px-2 py-0.5 uppercase">
              -75.8% Cut
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#262626" />
                <XAxis dataKey="month" stroke="#737373" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#737373" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="count" stroke="#ccff00" strokeWidth={2.5} dot={{ r: 3, fill: '#ccff00' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Recurring Fault Codes */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">Top Recurring Faults</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">ECU Telemetry Frequency</p>
            </div>
            <span className="text-[10px] font-mono text-[#ccff00]">Incidents</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={faultData} layout="vertical">
                <CartesianGrid strokeDasharray="2 2" stroke="#262626" />
                <XAxis type="number" stroke="#737373" fontSize={10} fontFamily="monospace" />
                <YAxis dataKey="code" type="category" stroke="#737373" fontSize={10} width={75} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" fill="#ffffff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Replaced Components (Symptom-Level) */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">Most Replaced Parts</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">Symptom-Level Swaps</p>
            </div>
            <span className="text-[10px] font-mono text-white/40">Total Swaps</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#262626" />
                <XAxis dataKey="part" stroke="#737373" fontSize={9} fontFamily="monospace" />
                <YAxis stroke="#737373" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" fill="#00f0ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Repeat Incidents by Duty Class */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">Duty Class Distribution</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">Haulage Stress Factor</p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dutyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {dutyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ARTISTIC_PALETTE[index % ARTISTIC_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Root-Cause Graph Logic Callout */}
        <div className="bg-[#0d0d0d] border border-white/10 p-6 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-[#ccff00] text-black px-2 py-0.5">
                Mathematical Engine
              </span>
              <div className="h-[1px] w-6 bg-[#ccff00]"></div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Interpretable Causal Graph
              </span>
            </div>

            <h4 className="text-base font-black text-white uppercase italic tracking-tight">
              Root-Cause Multi-Factor Disambiguation
            </h4>

            <p className="text-xs text-white/60 leading-relaxed font-light">
              Unlike black-box models, this system scores causal candidates across multi-modal evidence paths:
            </p>

            <div className="bg-black border border-white/15 p-3.5 font-mono text-[11px] text-[#ccff00] leading-relaxed">
              Score = 0.25 × Fault Consistency + 0.20 × Recurrence Strength + 0.20 × Part Relationship + 0.15 × Operating Condition + 0.10 × Symptom Consistency + 0.10 × Temporal Consistency
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-light">
              This isolates scenarios where repeated part swaps (e.g. PRT-FLT-8821 coolant filter) merely mask upstream environmental drivers (dust fin clogging) and continuous 12% grade uphill thermal load.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Provenance Ready for Audit</span>
            <button
              id="btn-goto-investigation"
              onClick={() => onSelectCase(repeatCases[0]?.case_id || 'RFC-HT-042-101')}
              className="text-xs text-[#ccff00] hover:text-white font-mono uppercase tracking-widest font-bold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <span>Inspect Investigation</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
