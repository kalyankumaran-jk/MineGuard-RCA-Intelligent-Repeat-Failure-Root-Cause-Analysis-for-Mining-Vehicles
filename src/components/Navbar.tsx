import React from 'react';
import {
  Activity,
  Truck,
  AlertTriangle,
  Search,
  Network,
  History,
  FileCheck,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'vehicles'
  | 'repeat-failures'
  | 'investigation'
  | 'graph'
  | 'history'
  | 'audit-export'
  | 'test-harness'
  | 'experiment'
  | 'deployment-ethics';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  repeatCount?: number;
  repeatCasesCount?: number;
  criticalCasesCount?: number;
  onRegenerateData?: () => void;
  isRegenerating?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  repeatCount = 0,
  repeatCasesCount,
  criticalCasesCount = 12,
  onRegenerateData,
  isRegenerating,
}) => {
  const totalRepeats = repeatCasesCount ?? repeatCount;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'investigation', label: 'Investigation', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'graph', label: 'Causal Graph', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'repeat-failures', label: 'Repeats', icon: <AlertTriangle className="w-3.5 h-3.5" />, badge: totalRepeats },
    { id: 'vehicles', label: 'Fleet Asset', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Audit Trail', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'audit-export', label: 'Dossier Export', icon: <FileCheck className="w-3.5 h-3.5" /> },
    { id: 'test-harness', label: 'Test Suite', icon: <CheckCircle2 className="w-3.5 h-3.5" />, badge: 6 },
    { id: 'experiment', label: 'Benchmark', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'deployment-ethics', label: 'Governance', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="bg-[#0a0a0a] border-b border-white/10 text-white sticky top-0 z-50 selection:bg-[#ccff00] selection:text-black">
      {/* Top Brand & Telemetry Status Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 bg-white/5 border border-white/15 flex items-center justify-center text-[#ccff00]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#ccff00] font-semibold">
                Reliability<span className="text-white">.</span>OS
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium bg-[#ccff00] text-black px-1.5 py-0.2 font-mono">
                Artistic Engine
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black tracking-tight uppercase italic text-white flex items-center gap-1.5">
              Repeat-Failure Root-Cause Graph
              <span className="text-[#ccff00] not-italic text-xs font-mono font-normal">/ 01</span>
            </h1>
          </div>
        </div>

        {/* Live operational badges & dataset control */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1 border border-white/10 text-[11px] font-mono uppercase tracking-wider">
            <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></span>
            <span className="text-white/80">Telemetry: 105 Heavy Units</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 text-rose-300 font-mono text-[11px] uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{criticalCasesCount} Critical</span>
          </div>

          {onRegenerateData && (
            <button
              id="btn-regenerate-dataset"
              onClick={onRegenerateData}
              disabled={isRegenerating}
              className="px-3 py-1 bg-white/5 hover:bg-[#ccff00] hover:text-black text-white/80 border border-white/15 transition text-[10px] uppercase font-mono tracking-widest disabled:opacity-50 cursor-pointer"
            >
              {isRegenerating ? 'Syncing...' : 'Reseed 42'}
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-1 border-t border-white/10 no-scrollbar">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#ccff00] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                    isActive ? 'bg-black text-[#ccff00]' : 'bg-white/10 text-white/80'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
