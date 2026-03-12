import React from 'react';
import { Solution } from '../types';

interface Props {
  solution: Solution;
  serverCount: number;
}

const ServerIcon: React.FC = () => (
  <div className="w-10 h-12 bg-slate-900 rounded border border-slate-700 flex items-center justify-center shadow-sm relative group">
    <div className="w-full h-full flex flex-col justify-evenly items-center">
      <div className="w-6 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
      <div className="w-6 h-0.5 bg-slate-700 rounded-full"></div>
      <div className="w-6 h-0.5 bg-slate-700 rounded-full"></div>
    </div>
    {/* Tooltipish label */}
    <div className="absolute -bottom-4 text-[9px] text-slate-500 font-mono tracking-tighter">910B</div>
  </div>
);

interface SwitchIconProps {
  type: 'spine' | 'leaf';
  model: string;
  width?: string;
}

const SwitchIcon: React.FC<SwitchIconProps> = ({ type, model, width = "w-24" }) => (
  <div className={`${width} h-10 rounded-md flex items-center justify-center text-xs font-bold shadow-lg z-10 relative font-mono tracking-wider
    ${type === 'spine' 
        ? 'bg-indigo-950 border border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
        : 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'} 
    `}
    title={model}
  >
    <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-white/50 animate-pulse"></div>
    {type === 'spine' ? 'SPINE' : 'LEAF'}
  </div>
);

const TopologyDiagram: React.FC<Props> = ({ solution, serverCount }) => {
  const isDirect = solution.leafCount === 0;
  
  // Visual limits to prevent crashing the browser with too many divs
  const MAX_VISUAL_LEAVES = 8;
  const MAX_VISUAL_SPINES = 4;
  
  const displayLeafCount = Math.min(solution.leafCount, MAX_VISUAL_LEAVES);
  const displaySpineCount = Math.min(solution.spineCount, MAX_VISUAL_SPINES);
  
  const renderLeafGroup = (leafIndex: number) => {
    // Determine how many servers are on this specific leaf
    // If it's a single leaf solution, all servers are on this leaf
    const maxServersPerLeaf = solution.spineCount === 0 ? serverCount : 4;
    const serversOnThisLeaf = Math.min(maxServersPerLeaf, Math.max(0, serverCount - (leafIndex * maxServersPerLeaf)));
    
    if (serversOnThisLeaf <= 0) return null;

    return (
      <div key={`leaf-group-${leafIndex}`} className="flex flex-col items-center mx-2 md:mx-4">
        {/* Connection Line to Servers */}
        <div className="h-6 w-px bg-slate-700"></div>
        
        {/* Leaf Switch */}
        <SwitchIcon type="leaf" model={solution.leafModel} />
        
        {/* Connection Line Down */}
        <div className="h-6 w-px bg-slate-700"></div>
        
        {/* Servers Grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
            {Array.from({ length: serversOnThisLeaf }).map((_, i) => (
                <ServerIcon key={`server-${leafIndex}-${i}`} />
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-900/40 p-8 rounded-xl border border-slate-800 shadow-inner overflow-hidden flex flex-col items-center min-h-[500px] justify-center relative">
      
      {/* DIRECT CONNECTION SCENARIO */}
      {isDirect && (
        <div className="flex flex-col items-center animate-fade-in-up">
           <div className="text-xl font-bold text-cyan-500 mb-8 font-mono tracking-widest">DIRECT_CONNECT_MODE</div>
           <div className="flex space-x-12 items-center relative">
               <ServerIcon />
               {/* Direct Cable */}
               <div className="h-1.5 w-32 bg-cyan-500 rounded-full relative shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                 <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-cyan-400 font-bold text-xs whitespace-nowrap font-mono">
                   100G/200G
                 </span>
               </div>
               {serverCount > 1 && <ServerIcon />}
           </div>
           <div className="mt-8 text-slate-500 text-sm font-mono">// 仅限2台以内服务器</div>
        </div>
      )}

      {/* SWITCHED SCENARIO */}
      {!isDirect && (
        <>
            {/* 1. SPINE LAYER */}
            {solution.spineCount > 0 && (
                <div className="w-full flex justify-center mb-0 relative z-20">
                    <div className="flex space-x-12 items-center px-8 py-4 bg-indigo-950/20 rounded-2xl border border-indigo-900/30">
                        {Array.from({ length: displaySpineCount }).map((_, i) => (
                            <SwitchIcon key={`spine-${i}`} type="spine" model={solution.spineModel || 'Spine'} width="w-28" />
                        ))}
                        {solution.spineCount > displaySpineCount && (
                             <div className="text-indigo-400 font-bold text-lg font-mono">+{solution.spineCount - displaySpineCount}</div>
                        )}
                    </div>
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 translate-x-full w-32">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-800/50 px-2 py-1 rounded font-mono uppercase tracking-wider">核心层 (Spine)</span>
                    </div>
                </div>
            )}

            {/* 2. MESH CONNECTION LAYER (SVG) */}
            {solution.spineCount > 0 && (
                <div className="w-full h-24 relative my-2">
                     <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                         <defs>
                            <linearGradient id="cable-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                            </linearGradient>
                         </defs>
                         <rect x="10%" y="10%" width="80%" height="80%" fill="url(#cable-gradient)" rx="4" />
                         <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="10" fontWeight="bold" className="font-mono tracking-widest">
                            FULL_MESH_INTERCONNECT
                         </text>
                     </svg>
                </div>
            )}

            {/* 3. LEAF LAYER & SERVERS */}
            <div className="w-full flex justify-center items-start flex-wrap mt-2 relative z-20">
                {Array.from({ length: displayLeafCount }).map((_, i) => renderLeafGroup(i))}
                
                {solution.leafCount > displayLeafCount && (
                    <div className="flex flex-col items-center justify-center h-40 ml-4">
                         <div className="text-2xl text-slate-600 font-bold tracking-widest">...</div>
                         <div className="text-slate-500 font-medium text-xs font-mono mt-2">+{solution.leafCount - displayLeafCount} GROUPS</div>
                    </div>
                )}
                 <div className="absolute top-10 -right-4 translate-x-full w-32 hidden lg:block">
                     <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-2 py-1 rounded font-mono uppercase tracking-wider">接入层 (Leaf)</span>
                </div>
            </div>
            
            <div className="mt-10 text-center">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-widest font-mono flex items-center justify-center">
                    <span className="w-8 h-px bg-slate-700 mr-3"></span>
                    计算节点层 ({serverCount} NODES)
                    <span className="w-8 h-px bg-slate-700 ml-3"></span>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default TopologyDiagram;
