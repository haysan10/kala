
import React from 'react';
import { Milestone, Assignment } from '../types';
import { Award, Target, BookOpen } from 'lucide-react';

interface KnowledgeMapProps {
  assignment: Assignment;
  onNodeClick: (milestone: Milestone) => void;
}

const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ assignment, onNodeClick }) => {
  const milestones = assignment.milestones;
  const width = 800;
  const height = 400;
  
  // Calculate node positions in a staggered layout
  const nodes = milestones.map((m, i) => {
    const x = (i + 1) * (width / (milestones.length + 1));
    const y = height / 2 + (i % 2 === 0 ? -60 : 60);
    return { ...m, x, y };
  });

  return (
    <div className="w-full overflow-x-auto bg-navy-50/50 dark:bg-navy-900/20 rounded-[4rem] p-12 border border-navy-100 dark:border-navy-900 shadow-inner relative group">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Target size={16} className="text-navy-300" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-navy-200">Intellectual Topology</span>
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connections */}
        {nodes.map((node, i) => {
          if (i === 0) return null;
          const prev = nodes[i - 1];
          return (
            <line 
              key={`line-${i}`}
              x1={prev.x} y1={prev.y}
              x2={node.x} y2={node.y}
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-all duration-1000 ${node.status === 'completed' ? 'text-emerald-400 opacity-60' : 'text-navy-100 dark:text-navy-800 opacity-40'}`}
              strokeDasharray={node.status === 'completed' ? "0" : "5,5"}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const isMastered = node.miniCourse?.masteryStatus === 'perfected';
          const isCompleted = node.status === 'completed';

          return (
            <g 
              key={node.id} 
              className="cursor-pointer group"
              onClick={() => onNodeClick(node)}
              transform={`translate(${node.x}, ${node.y})`}
            >
              <circle 
                r="30" 
                className={`transition-all duration-500 fill-white dark:fill-navy-950 stroke-[3] ${
                  isMastered ? 'stroke-emerald-400' : isCompleted ? 'stroke-navy-900 dark:stroke-white' : 'stroke-navy-100 dark:stroke-navy-800'
                }`}
                filter={isMastered ? 'url(#glow)' : ''}
              />
              <foreignObject x="-15" y="-15" width="30" height="30">
                <div className="w-full h-full flex items-center justify-center">
                  {isMastered ? <Award size={18} className="text-emerald-400" /> : <BookOpen size={18} className={isCompleted ? 'text-navy-900 dark:text-white' : 'text-navy-100'} />}
                </div>
              </foreignObject>
              
              {/* Tooltip-like label */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                <rect x="-60" y="40" width="120" height="30" rx="15" className="fill-navy-900 text-white" />
                <text y="59" textAnchor="middle" className="fill-white text-[8px] font-black uppercase tracking-widest">{node.title.slice(0, 15)}...</text>
              </g>
            </g>
          );
        })}
      </svg>
      
      <div className="mt-8 flex justify-center gap-12">
        <MapLegend color="bg-emerald-400" label="Conceptual Mastery" glow />
        <MapLegend color="bg-navy-900 dark:bg-white" label="Unit Operational" />
        <MapLegend color="bg-navy-100 dark:bg-navy-800" label="Theoretical Baseline" />
      </div>
    </div>
  );
};

const MapLegend = ({ color, label, glow }: { color: string, label: string, glow?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-full ${color} ${glow ? 'shadow-[0_0_10px_rgba(52,211,153,0.8)]' : ''}`} />
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-navy-300">{label}</span>
  </div>
);

export default KnowledgeMap;
