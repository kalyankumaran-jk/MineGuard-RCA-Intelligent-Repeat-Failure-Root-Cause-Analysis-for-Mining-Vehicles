import React, { useState } from 'react';
import { EdgeTestCaseResult } from '../types';
import { runEdgeCaseTests } from '../data/historyAndTesting';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCw
} from 'lucide-react';

export const TestHarnessView: React.FC = () => {
  const [testResults, setTestResults] = useState<EdgeTestCaseResult[]>(runEdgeCaseTests());
  const [isRunning, setIsRunning] = useState(false);
  const [lastRanTime, setLastRanTime] = useState<string>(new Date().toLocaleTimeString());

  const handleRunAllTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runEdgeCaseTests();
      setTestResults(results);
      setLastRanTime(new Date().toLocaleTimeString());
      setIsRunning(false);
    }, 400);
  };

  const passCount = testResults.filter(t => t.status === 'PASS').length;
  const failCount = testResults.filter(t => t.status === 'FAIL').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-white/5 text-[#ccff00] border border-white/15 px-2 py-0.5">
              Automated Verification Suite
            </span>
            <div className="h-[1px] w-6 bg-white/20"></div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Last Executed: {lastRanTime}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
            Edge & Failure-Case Test Harness
          </h2>
          <p className="text-xs text-white/60 font-light max-w-3xl leading-relaxed">
            Automated regression suite verifying causal graph behavior under cold starts, sensor dropouts, ambiguous telemetry, and operational dispatcher overrides.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 font-mono">
          <div className="flex items-center space-x-2.5 bg-black px-4 py-2 border border-white/15 text-xs">
            <span className="text-[#ccff00] font-black">{passCount} PASS</span>
            <span className="text-white/20">|</span>
            <span className="text-rose-400 font-black">{failCount} FAIL</span>
          </div>

          <button
            id="btn-run-all-tests"
            onClick={handleRunAllTests}
            disabled={isRunning}
            className="px-5 py-2.5 bg-[#ccff00] hover:bg-white text-black font-black uppercase text-xs tracking-widest transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            {isRunning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Running...' : 'Execute Suite'}</span>
          </button>
        </div>
      </div>

      {/* Test Cases Grid */}
      <div className="space-y-4">
        {testResults.map(tc => (
          <div
            key={tc.id}
            className={`bg-[#0d0d0d] border p-5 transition-all shadow-lg ${
              tc.status === 'PASS' ? 'border-white/10 hover:border-white/25' : 'border-rose-500/50 bg-rose-950/20'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-bold text-[#ccff00] bg-black px-2.5 py-1 border border-white/15">
                  {tc.id}
                </span>
                <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{tc.name}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                    tc.status === 'PASS'
                      ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {tc.status === 'PASS' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#ccff00]" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{tc.status}</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-white/70 mt-3 leading-relaxed font-light">{tc.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/10 text-xs font-mono">
              <div className="bg-black p-3.5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Input Scenario:</div>
                <div className="text-white mt-1 text-[11px]">{tc.input_scenario}</div>
              </div>

              <div className="bg-black p-3.5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Expected Outcome:</div>
                <div className="text-white/90 mt-1 text-[11px]">{tc.expected_outcome}</div>
              </div>
            </div>

            <div className="mt-3 bg-black p-3.5 border border-white/10 text-xs font-mono">
              <div className="text-[10px] text-[#ccff00] uppercase tracking-wider font-bold">Actual Engine Result:</div>
              <div className="text-white font-mono text-[11px] mt-0.5">{tc.actual_outcome}</div>
              <div className="text-[10px] text-white/40 mt-1.5 italic">{tc.details}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
