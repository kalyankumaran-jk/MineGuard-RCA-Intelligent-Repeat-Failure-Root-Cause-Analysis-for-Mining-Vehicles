import React, { useState, useMemo } from 'react';
import {
  RepeatFailureCase,
  Vehicle,
  WorkOrder,
  GraphNode
} from '../types';
import { buildCaseGraph } from '../data/rootCauseEngine';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Info,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface RootCauseGraphViewProps {
  selectedCaseId: string;
  repeatCases: RepeatFailureCase[];
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  onSelectCase: (caseId: string) => void;
}

const NODE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Vehicle: { bg: '#121212', border: '#404040', text: '#ffffff', badge: 'Vehicle' },
  WorkOrder: { bg: '#141400', border: '#ccff00', text: '#ccff00', badge: 'Work Order' },
  Symptom: { bg: '#1c080e', border: '#ff3366', text: '#ff99b3', badge: 'Symptom' },
  FaultCode: { bg: '#1c1206', border: '#ff9900', text: '#ffd480', badge: 'Fault Code' },
  Part: { bg: '#06171c', border: '#00f0ff', text: '#99f7ff', badge: 'Replaced Part' },
  OperatingCondition: { bg: '#180c24', border: '#bf5af2', text: '#e6b8ff', badge: 'Condition' },
  RootCause: { bg: '#131f00', border: '#ccff00', text: '#ffffff', badge: 'Root Cause' },
  Action: { bg: '#0b1324', border: '#60a5fa', text: '#bfdbfe', badge: 'Permanent Action' },
};

export const RootCauseGraphView: React.FC<RootCauseGraphViewProps> = ({
  selectedCaseId,
  repeatCases,
  vehicles,
  workOrders,
  onSelectCase,
}) => {
  const currentCase = repeatCases.find(c => c.case_id === selectedCaseId) || repeatCases[0];
  const vehicle = vehicles.find(v => v.vehicle_id === currentCase?.vehicle_id);

  // Graph data
  const graphData = useMemo(() => {
    if (!currentCase) return { nodes: [], edges: [] };
    return buildCaseGraph(currentCase, workOrders, vehicle);
  }, [currentCase, workOrders, vehicle]);

  // Viewport zoom and pan state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Filter states
  const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>({
    Vehicle: true,
    WorkOrder: true,
    Symptom: true,
    FaultCode: true,
    Part: true,
    OperatingCondition: true,
    RootCause: true,
    Action: true,
  });
  const [minConfidence] = useState(0);
  const [highlightFailureChainOnly, setHighlightFailureChainOnly] = useState(false);

  // Selected node for inspection
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Hierarchical layout computation
  const positionedNodes = useMemo(() => {
    const typeOrder = [
      'Vehicle',
      'WorkOrder',
      'Symptom',
      'FaultCode',
      'Part',
      'OperatingCondition',
      'RootCause',
      'Action',
    ];

    // Group nodes by type
    const byType: Record<string, GraphNode[]> = {};
    typeOrder.forEach(t => (byType[t] = []));

    graphData.nodes.forEach(node => {
      if (activeTypes[node.type]) {
        if (!byType[node.type]) byType[node.type] = [];
        byType[node.type].push(node);
      }
    });

    const positions: Record<string, { x: number; y: number; node: GraphNode }> = {};
    const columnWidth = 195;
    const verticalGap = 75;

    typeOrder.forEach((type, colIndex) => {
      const list = byType[type] || [];
      const totalHeight = list.length * verticalGap;
      const startY = Math.max(40, 260 - totalHeight / 2);

      list.forEach((node, rowIndex) => {
        positions[node.id] = {
          x: 40 + colIndex * columnWidth,
          y: startY + rowIndex * verticalGap,
          node,
        };
      });
    });

    return positions;
  }, [graphData.nodes, activeTypes]);

  // Filter visible edges
  const visibleEdges = useMemo(() => {
    return graphData.edges.filter(edge => {
      const src = positionedNodes[edge.source];
      const tgt = positionedNodes[edge.target];
      if (!src || !tgt) return false;
      if (edge.confidence && edge.confidence < minConfidence) return false;

      if (highlightFailureChainOnly) {
        // Only show edges that connect to RootCause, Part, or Condition
        const isCoreChain =
          src.node.type === 'RootCause' ||
          tgt.node.type === 'RootCause' ||
          tgt.node.type === 'Action' ||
          src.node.type === 'Part' ||
          src.node.type === 'OperatingCondition';
        if (!isCoreChain) return false;
      }
      return true;
    });
  }, [graphData.edges, positionedNodes, minConfidence, highlightFailureChainOnly]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-canvas') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const toggleType = (type: string) => {
    setActiveTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Controls Bar */}
      <div className="bg-[#0d0d0d] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-white/5 border border-white/15 flex items-center justify-center text-[#ccff00]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#ccff00] uppercase tracking-[0.25em]">
              Causal Graph Projection / Topological Model
            </div>
            <h2 className="text-base font-black text-white uppercase italic tracking-tight">
              Root-Cause Dependency Graph: {currentCase.case_id}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider">Select Case:</label>
          <select
            id="select-graph-case"
            value={currentCase.case_id}
            onChange={e => onSelectCase(e.target.value)}
            className="bg-black border border-white/15 text-white text-xs px-3 py-1.5 focus:outline-none focus:border-[#ccff00] font-mono uppercase tracking-wider"
          >
            {repeatCases.map(c => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} — {c.vehicle_id} ({c.recurrence_count}x)
              </option>
            ))}
          </select>

          {/* Zoom controls */}
          <div className="flex items-center bg-black border border-white/15 ml-2">
            <button
              id="btn-zoom-in"
              onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono text-[#ccff00]">{Math.round(zoom * 100)}%</span>
            <button
              id="btn-zoom-out"
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-reset-zoom"
              onClick={() => {
                setZoom(1.0);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 border-l border-white/15 cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="bg-[#0d0d0d] border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-white/40 uppercase tracking-widest text-[10px] flex items-center space-x-1 mr-1">
            <Filter className="w-3 h-3 text-[#ccff00]" />
            <span>Node Layers:</span>
          </span>
          {Object.entries(NODE_COLORS).map(([type, colors]) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider border transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTypes[type]
                  ? 'border-white/20'
                  : 'opacity-30 border-white/5 line-through bg-black text-white/30'
              }`}
              style={{
                backgroundColor: activeTypes[type] ? colors.bg : undefined,
                color: activeTypes[type] ? colors.text : undefined,
                borderColor: activeTypes[type] ? colors.border : undefined,
              }}
            >
              <span className="w-1.5 h-1.5" style={{ backgroundColor: colors.border }}></span>
              <span>{colors.badge}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-white/80 cursor-pointer select-none">
            <input
              id="check-failure-chain"
              type="checkbox"
              checked={highlightFailureChainOnly}
              onChange={e => setHighlightFailureChainOnly(e.target.checked)}
              className="accent-[#ccff00] cursor-pointer"
            />
            <span className="text-[11px] uppercase tracking-wider text-[#ccff00] font-bold">Isolate Failure Chain</span>
          </label>
        </div>
      </div>

      {/* Main Interactive Canvas Area + Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Canvas Area */}
        <div
          id="graph-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="lg:col-span-3 bg-black border border-white/10 h-[580px] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          {/* Subtle dot pattern background inside canvas */}
          <div className="absolute inset-0 artistic-grid-bg opacity-30 pointer-events-none"></div>

          {/* Watermark instructions */}
          <div className="absolute bottom-3 left-3 bg-black/90 border border-white/15 px-3 py-1 text-[10px] text-white/50 font-mono tracking-widest uppercase pointer-events-none z-10">
            Click nodes to inspect provenance • Drag to pan • Scroll to zoom
          </div>

          <svg
            className="w-full h-full relative z-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#525252" />
              </marker>
              <marker
                id="arrowhead-highlight"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#ccff00" />
              </marker>
            </defs>

            {/* Edges */}
            {visibleEdges.map(edge => {
              const src = positionedNodes[edge.source];
              const tgt = positionedNodes[edge.target];
              if (!src || !tgt) return null;

              const isConnectedToSelected =
                selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

              const strokeColor = isConnectedToSelected
                ? '#ccff00'
                : edge.relationship.includes('Causes') || edge.relationship.includes('Resolves')
                ? '#ccff00'
                : '#404040';

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x + 80}
                    y1={src.y + 20}
                    x2={tgt.x}
                    y2={tgt.y + 20}
                    stroke={strokeColor}
                    strokeWidth={isConnectedToSelected ? 2.5 : 1.2}
                    strokeDasharray={edge.relationship.includes('Operated Under') ? '4 3' : undefined}
                    markerEnd={isConnectedToSelected ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
                  />
                  {/* Edge label */}
                  <text
                    x={(src.x + 80 + tgt.x) / 2}
                    y={(src.y + 20 + tgt.y + 20) / 2 - 4}
                    fill="#a3a3a3"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {edge.relationship}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {Object.values(positionedNodes).map(({ x, y, node }) => {
              const colors = NODE_COLORS[node.type] || NODE_COLORS.Vehicle;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <rect
                    width="160"
                    height="44"
                    fill={colors.bg}
                    stroke={isSelected ? '#ccff00' : colors.border}
                    strokeWidth={isSelected ? 2.5 : 1}
                    className="transition-all hover:brightness-130"
                  />
                  <text
                    x="9"
                    y="14"
                    fill={colors.border}
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="uppercase tracking-wider"
                  >
                    {colors.badge}
                  </text>
                  <text
                    x="9"
                    y="31"
                    fill="#ffffff"
                    fontSize="10.5"
                    fontWeight="600"
                    className="truncate"
                  >
                    {node.label.length > 22 ? node.label.slice(0, 20) + '…' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Inspector Sidebar */}
        <div className="bg-[#0d0d0d] border border-white/10 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
              <Info className="w-4 h-4 text-[#ccff00]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">Node Inspector</h3>
            </div>

            {selectedNode ? (
              <div className="mt-4 space-y-3.5 text-xs">
                <div>
                  <span
                    className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: NODE_COLORS[selectedNode.type]?.bg,
                      color: NODE_COLORS[selectedNode.type]?.text,
                      borderColor: NODE_COLORS[selectedNode.type]?.border,
                    }}
                  >
                    {selectedNode.type}
                  </span>
                  <div className="text-sm font-black text-white mt-2 uppercase italic tracking-tight">{selectedNode.label}</div>
                  {selectedNode.category && (
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">Subsystem: {selectedNode.category}</div>
                  )}
                </div>

                <div className="bg-black border border-white/10 p-3.5 space-y-2 mt-2">
                  <div className="text-[9px] font-mono uppercase text-[#ccff00] font-bold tracking-wider">
                    Evidence Metadata:
                  </div>
                  {selectedNode.details ? (
                    Object.entries(selectedNode.details).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-start text-[10px] font-mono">
                        <span className="text-white/40 capitalize">{k.replace('_', ' ')}:</span>
                        <span className="text-white/90 text-right max-w-[140px] truncate">{String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/30 italic text-[10px]">Standard telemetry edge.</div>
                  )}
                </div>

                {selectedNode.type === 'RootCause' && (
                  <div className="bg-[#ccff00]/10 border border-[#ccff00]/40 p-3.5 space-y-1.5 text-white text-xs font-mono">
                    <div className="font-bold text-[#ccff00] flex items-center space-x-1.5 uppercase text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>Permanent Resolution Node</span>
                    </div>
                    <div className="text-[10px] text-white/70 leading-relaxed font-light">
                      Discovered by correlating external airflow restriction with high-dust ramp duty over multiple repeated filter swaps.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-white/30 space-y-3 font-mono">
                <Layers className="w-8 h-8 mx-auto text-white/20" />
                <p className="text-[11px] uppercase tracking-wider">Select a node to inspect evidence attributes.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 font-mono text-[10px] text-white/40 uppercase tracking-wider">
            Entities: {graphData.nodes.length} Nodes • {graphData.edges.length} Edges
          </div>
        </div>
      </div>
    </div>
  );
};
