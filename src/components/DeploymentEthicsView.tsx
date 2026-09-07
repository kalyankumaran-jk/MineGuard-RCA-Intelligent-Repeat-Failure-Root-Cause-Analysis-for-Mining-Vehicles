import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, Users, CheckCircle2, Lock } from 'lucide-react';

export const DeploymentEthicsView: React.FC = () => {
  const [checklist, setChecklist] = useState([
    { id: 1, category: 'Data Ingestion', item: 'Streaming CAN bus & SCADA telemetry ingestion connectors with buffered fallback', checked: true },
    { id: 2, category: 'Data Validation', item: 'Schema validation for work orders, ISO-compliant fault code format enforcement', checked: true },
    { id: 3, category: 'Authentication', item: 'Role-Based Access Control (RBAC) supporting Enterprise Active Directory / SAML', checked: true },
    { id: 4, category: 'Authorization', item: 'Least privilege access: dispatchers can override, technicians can log, auditors view-only', checked: true },
    { id: 5, category: 'Database Backup', item: 'Automated point-in-time recovery (PITR) with geo-redundant storage snapshot', checked: true },
    { id: 6, category: 'Logging', item: 'Structured JSON logging with request tracing correlation IDs', checked: true },
    { id: 7, category: 'Monitoring', item: 'Uptime, latency, and throughput health check telemetry with PagerDuty integration', checked: true },
    { id: 8, category: 'Model Versioning', item: 'Root-cause graph ontology schema versioned with semantic versioning tags', checked: true },
    { id: 9, category: 'Audit Logs', item: 'Cryptographically sealed, append-only ledger for all dispatcher overrides and plan changes', checked: true },
    { id: 10, category: 'Data Retention', item: '7-year statutory equipment failure log retention for mining regulator compliance', checked: true },
    { id: 11, category: 'Security', item: 'TLS 1.3 encryption in transit and AES-256 encryption at rest across all database volumes', checked: true },
    { id: 12, category: 'Privacy', item: 'Operator identifiers pseudonymized; focus is strictly on vehicle telemetry and equipment physics', checked: true },
    { id: 13, category: 'Failure Recovery', item: 'Automatic failover to read-only replica with offline caching on pit mobile tablets', checked: true },
    { id: 14, category: 'Human Approval', item: 'Mandatory human confirmation for all safety-critical mechanical interventions', checked: true },
    { id: 15, category: 'Performance Monitoring', item: 'Graph traversal and inference latency monitored (<250ms p95 query response)', checked: true },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-white/5 text-[#ccff00] border border-white/15 px-2 py-0.5">
              Enterprise Governance & Safety
            </span>
            <div className="h-[1px] w-6 bg-white/20"></div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              ISO 55000 / Mining Safety Standards
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
            Deployment Checklist, Ethics & Usability Validation
          </h2>
          <p className="text-xs text-white/60 font-light max-w-3xl leading-relaxed">
            Operational safety guidelines, human-in-the-loop oversight protocol, deployment readiness, and simulated stakeholder feedback.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#ccff00] bg-black border border-white/15 px-4 py-2.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
          <span className="uppercase text-[11px] tracking-wider font-bold">Safety Standard: Advisory Only</span>
        </div>
      </div>

      {/* Ethics & Responsible AI Declaration (Section 22) */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
          <Lock className="w-4 h-4 text-[#ccff00]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
            Responsible AI & Human-in-the-Loop Governance Protocol
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-light">
          <div className="bg-black p-4 border border-white/10 space-y-2">
            <h4 className="font-black text-white uppercase italic tracking-tight flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-[#ccff00]"></span>
              <span>1. Human-in-the-Loop Authority</span>
            </h4>
            <p className="text-white/70 leading-relaxed">
              The root-cause engine operates strictly as an <strong className="text-white">advisory decision support system</strong>. It is fundamentally barred from automatically scheduling safety-critical mechanical interventions or modifying braking/steering ECU configurations without human authorization.
            </p>
          </div>

          <div className="bg-black p-4 border border-white/10 space-y-2">
            <h4 className="font-black text-white uppercase italic tracking-tight flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-[#ccff00]"></span>
              <span>2. Explainability & Anti-Bias</span>
            </h4>
            <p className="text-white/70 leading-relaxed">
              Black-box neural inferences are rejected. Every recommendation provides a mathematical scoring breakdown, traceable work order IDs, fault telemetry provenance, and clear confidence scores to eliminate automation bias.
            </p>
          </div>

          <div className="bg-black p-4 border border-white/10 space-y-2">
            <h4 className="font-black text-white uppercase italic tracking-tight flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-[#ccff00]"></span>
              <span>3. Worker Safety & Accountability</span>
            </h4>
            <p className="text-white/70 leading-relaxed">
              Dispatcher overrides must record a mandatory justification reason. Records are stored in an append-only, immutable audit trail accessible to mine safety regulators and reliability engineers.
            </p>
          </div>
        </div>
      </div>

      {/* 15-Point Production Deployment Checklist (Section 23) */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <CheckSquare className="w-4 h-4 text-[#ccff00]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
              15-Point Industrial Deployment Checklist
            </h3>
          </div>
          <span className="text-xs font-mono text-[#ccff00] font-black uppercase tracking-wider">
            {checklist.filter(c => c.checked).length} / {checklist.length} Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          {checklist.map(item => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 border transition-all cursor-pointer flex items-start space-x-3 ${
                item.checked
                  ? 'bg-black border-white/15 hover:border-[#ccff00]/60'
                  : 'bg-black/40 border-white/5 opacity-40'
              }`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleCheck(item.id)}
                className="mt-0.5 accent-[#ccff00] cursor-pointer"
              />
              <div>
                <div className="font-mono text-[9px] text-[#ccff00] uppercase font-bold tracking-wider">
                  {item.id}. {item.category}
                </div>
                <div className="text-white/80 text-[11px] mt-1 leading-snug">{item.item}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Stakeholder Validation (Section 20) */}
      <div className="bg-[#0d0d0d] border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-[#ccff00]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
              Simulated Stakeholder Usability Validation Walkthrough
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
            Operator Validation Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Technician */}
          <div className="bg-black p-4 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase">Marcus Thorne</span>
              <span className="text-[9px] font-mono text-white/40 uppercase">Senior Tech</span>
            </div>
            <div className="text-white/70 italic text-[11px] bg-[#0d0d0d] p-3 border border-white/10 leading-relaxed">
              "Being able to see that HT-042 had its coolant filter swapped 3 times in 4 weeks stopped me from blindly doing it a 4th time. The graph timeline made it immediately obvious that external dust clogging was the culprit."
            </div>
            <div className="text-[10px] text-[#ccff00] font-bold flex items-center space-x-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ccff00]" />
              <span>Traceability: Verified</span>
            </div>
          </div>

          {/* Maintenance Planner */}
          <div className="bg-black p-4 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase">Sarah Jenkins</span>
              <span className="text-[9px] font-mono text-white/40 uppercase">Maintenance Planner</span>
            </div>
            <div className="text-white/70 italic text-[11px] bg-[#0d0d0d] p-3 border border-white/10 leading-relaxed">
              "The Permanent Corrective Action tab gives us the engineering justification to order cyclonic pre-cleaner retrofit kits and adjust PM schedules from 500h to 250h for trucks on high-dust haul roads."
            </div>
            <div className="text-[10px] text-[#ccff00] font-bold flex items-center space-x-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ccff00]" />
              <span>Plan Formulation: Verified</span>
            </div>
          </div>

          {/* Dispatcher */}
          <div className="bg-black p-4 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase">Greg Callahan</span>
              <span className="text-[9px] font-mono text-white/40 uppercase">Shift Dispatch Lead</span>
            </div>
            <div className="text-white/70 italic text-[11px] bg-[#0d0d0d] p-3 border border-white/10 leading-relaxed">
              "The override flow is essential. When we have an active blast window, I can defer bay maintenance by 36 hours with a mandatory justification while enforcing speed limits. The audit trail protects everyone."
            </div>
            <div className="text-[10px] text-[#ccff00] font-bold flex items-center space-x-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ccff00]" />
              <span>Override Authority: Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
