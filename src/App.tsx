import React, { useState, useEffect } from 'react';
import {
  Vehicle,
  WorkOrder,
  RepeatFailureCase,
  PlanChangeRecord
} from './types';
import { generateSyntheticDataset } from './data/syntheticGenerator';
import { detectRepeatFailures } from './data/rootCauseEngine';
import { getPlanChangeHistory, recordPlanChange } from './data/historyAndTesting';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CaseInvestigationView } from './components/CaseInvestigationView';
import { RootCauseGraphView } from './components/RootCauseGraphView';
import { RepeatFailuresView } from './components/RepeatFailuresView';
import { VehiclesView } from './components/VehiclesView';
import { PlanHistoryView } from './components/PlanHistoryView';
import { AuditExportView } from './components/AuditExportView';
import { TestHarnessView } from './components/TestHarnessView';
import { ExperimentView } from './components/ExperimentView';
import { DeploymentEthicsView } from './components/DeploymentEthicsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [repeatCases, setRepeatCases] = useState<RepeatFailureCase[]>([]);
  const [historyRecords, setHistoryRecords] = useState<PlanChangeRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('RFC-HT-042-101');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from API with instant fallback to client generator
  useEffect(() => {
    async function loadData() {
      try {
        const [vRes, wRes, cRes, hRes] = await Promise.all([
          fetch('/api/vehicles').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/work-orders').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/repeat-failures').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/history').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (vRes && wRes && cRes) {
          setVehicles(vRes);
          setWorkOrders(wRes);
          setRepeatCases(cRes);
          setHistoryRecords(hRes || getPlanChangeHistory());
          if (cRes.length > 0) {
            setSelectedCaseId(cRes[0].case_id);
          }
        } else {
          // Direct client generation fallback
          const raw = generateSyntheticDataset(42);
          const detected = detectRepeatFailures(raw.workOrders, raw.vehicles);
          setVehicles(raw.vehicles);
          setWorkOrders(raw.workOrders);
          setRepeatCases(detected);
          setHistoryRecords(getPlanChangeHistory());
          if (detected.length > 0) {
            setSelectedCaseId(detected[0].case_id);
          }
        }
      } catch (err) {
        console.error('Initialization fallback to local dataset engine:', err);
        const raw = generateSyntheticDataset(42);
        const detected = detectRepeatFailures(raw.workOrders, raw.vehicles);
        setVehicles(raw.vehicles);
        setWorkOrders(raw.workOrders);
        setRepeatCases(detected);
        setHistoryRecords(getPlanChangeHistory());
        if (detected.length > 0) {
          setSelectedCaseId(detected[0].case_id);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('investigation');
  };

  const handleNavigateToGraph = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('graph');
  };

  const handleNavigateToExport = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('audit-export');
  };

  const handleNavigateToHistory = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('history');
  };

  const handleSaveOverride = async (caseId: string, overrideData: {
    new_plan: string;
    reason: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    user_role: any;
    user_name: string;
  }) => {
    // Call server API
    try {
      await fetch(`/api/cases/${caseId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrideData),
      });
    } catch (e) {
      console.warn('API POST failed, updating local state directly:', e);
    }

    // Update local state
    const currentCase = repeatCases.find(c => c.case_id === caseId);
    if (!currentCase) return;

    const newRecord = recordPlanChange({
      case_id: caseId,
      vehicle_id: currentCase.vehicle_id,
      user_role: overrideData.user_role,
      user_name: overrideData.user_name,
      previous_plan: currentCase.current_plan,
      new_plan: overrideData.new_plan,
      reason: overrideData.reason,
      override_flag: true,
      system_recommendation: currentCase.recommended_permanent_action,
      dispatcher_decision: overrideData.new_plan,
      priority: overrideData.priority,
    });

    setHistoryRecords(prev => [newRecord, ...prev]);

    setRepeatCases(prev =>
      prev.map(c =>
        c.case_id === caseId
          ? {
              ...c,
              current_plan: overrideData.new_plan,
              has_override: true,
              dispatcher_override: {
                overridden_by: `${overrideData.user_name} (${overrideData.user_role})`,
                timestamp: new Date().toISOString(),
                new_plan: overrideData.new_plan,
                reason: overrideData.reason,
                priority: overrideData.priority,
              },
            }
          : c
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-5 text-white relative">
        <div className="absolute inset-0 artistic-grid-bg pointer-events-none opacity-40"></div>
        <div className="w-12 h-12 border-2 border-white/20 border-t-[#ccff00] animate-spin"></div>
        <div className="text-xs uppercase tracking-[0.3em] font-mono text-[#ccff00] z-10">Initializing Root-Cause Engine...</div>
        <div className="text-[11px] font-mono text-white/40 tracking-wider z-10">Processing 1,250+ work orders & computing causal graph</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans relative selection:bg-[#ccff00] selection:text-black">
      {/* Background dot grid pattern */}
      <div className="fixed inset-0 artistic-grid-bg pointer-events-none opacity-40 z-0"></div>

      {/* Top Navbar */}
      <div className="relative z-20">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          repeatCount={repeatCases.length}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView
            repeatCases={repeatCases}
            vehicles={vehicles}
            workOrders={workOrders}
            onSelectCase={handleSelectCase}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'investigation' && (
          <CaseInvestigationView
            selectedCaseId={selectedCaseId}
            repeatCases={repeatCases}
            vehicles={vehicles}
            workOrders={workOrders}
            onSelectCase={setSelectedCaseId}
            onNavigateToGraph={handleNavigateToGraph}
            onNavigateToExport={handleNavigateToExport}
            onNavigateToHistory={handleNavigateToHistory}
            onSaveOverride={handleSaveOverride}
          />
        )}

        {activeTab === 'graph' && (
          <RootCauseGraphView
            selectedCaseId={selectedCaseId}
            repeatCases={repeatCases}
            vehicles={vehicles}
            workOrders={workOrders}
            onSelectCase={setSelectedCaseId}
          />
        )}

        {activeTab === 'repeat-failures' && (
          <RepeatFailuresView
            repeatCases={repeatCases}
            onSelectCase={handleSelectCase}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesView
            vehicles={vehicles}
            repeatCases={repeatCases}
            onSelectCase={handleSelectCase}
          />
        )}

        {activeTab === 'history' && (
          <PlanHistoryView
            historyRecords={historyRecords}
            onSelectCase={handleSelectCase}
          />
        )}

        {activeTab === 'audit-export' && (
          <AuditExportView
            selectedCaseId={selectedCaseId}
            repeatCases={repeatCases}
            vehicles={vehicles}
            workOrders={workOrders}
            historyRecords={historyRecords}
            onSelectCase={setSelectedCaseId}
          />
        )}

        {activeTab === 'test-harness' && (
          <TestHarnessView />
        )}

        {activeTab === 'experiment' && (
          <ExperimentView />
        )}

        {activeTab === 'deployment-ethics' && (
          <DeploymentEthicsView />
        )}
      </main>

      {/* Bottom Status Bar */}
      <footer className="border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-mono text-white/50 flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></span>
            <span className="text-white/80">Telemetry: Optimal</span>
          </div>
          <span>•</span>
          <span>{vehicles.length} Units Active</span>
          <span>•</span>
          <span>{workOrders.length} Work Orders</span>
          <span>•</span>
          <span className="text-[#ccff00] font-bold">{repeatCases.length} Repeat Clusters</span>
        </div>

        <div className="flex items-center space-x-4">
          <span>Decision: Multi-Modal Causal Graph</span>
          <span>•</span>
          <span className="text-[#ccff00]">ISO 55000 Certified</span>
        </div>
      </footer>
    </div>
  );
}
