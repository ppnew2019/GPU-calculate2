import React, { useState, useEffect } from 'react';
import { calculateNetwork } from './utils/logic';
import { Solution } from './types';
import TopologyDiagram from './components/TopologyDiagram';
import { Server, Network, ShieldCheck, Cpu, ChevronRight, Calculator } from 'lucide-react';

export default function App() {
  const [serverCount, setServerCount] = useState<number | ''>('');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Recalculate when input changes
  useEffect(() => {
    if (typeof serverCount === 'number' && serverCount > 0) {
      const results = calculateNetwork(serverCount);
      setSolutions(results);
      // Auto-select the last option (usually the most robust) or the first if simple
      if (results.length > 0) {
        setSelectedSolution(results[results.length - 1]);
      }
    } else {
      setSolutions([]);
      setSelectedSolution(null);
    }
  }, [serverCount]);

  return (
    <div className="min-h-screen pb-20 font-sans bg-grid">
      {/* Header */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Network className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">GPU算力网络计算器</h1>
              <p className="text-sm text-slate-400 hidden sm:block font-medium font-mono mt-0.5">910B_CLUSTER_TOPOLOGY_GENERATOR</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="px-3 py-1 bg-cyan-950/30 text-cyan-400 rounded-full text-xs font-bold border border-cyan-800/50 font-mono">v1.2.0_PRO</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Input & Results List */}
          <div className="lg:col-span-4 space-y-8">
            {/* Input Card */}
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-800 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50"></div>
              <label className="block text-lg font-bold text-slate-200 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-cyan-400" />
                输入 910B 服务器数量
              </label>
              <div className="relative group">
                <input
                  type="number"
                  min="1"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-950 border-2 border-slate-800 rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 text-3xl font-bold text-cyan-400 font-mono shadow-inner outline-none transition-all placeholder:text-slate-700 placeholder:font-sans"
                  placeholder="例如: 128"
                  value={serverCount}
                  onChange={(e) => setServerCount(e.target.value ? parseInt(e.target.value) : '')}
                />
                <Server className="w-7 h-7 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-500 transition-colors" />
              </div>
              <p className="mt-5 text-sm text-slate-400 leading-relaxed">
                输入集群规模，系统将自动测算建议的 Leaf/Spine 交换机配比，并生成符合规则的拓扑架构。
              </p>
            </div>

            {/* Solution Options List */}
            {solutions.length > 0 && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 font-mono flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                  推荐方案 ({solutions.length})
                </h3>
                {solutions.map((sol) => (
                  <div
                    key={sol.id}
                    onClick={() => {
                        setSelectedSolution(sol);
                    }}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden group
                      ${selectedSolution?.id === sol.id 
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)] scale-[1.02]' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-lg font-bold ${selectedSolution?.id === sol.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                          {sol.name}
                        </h4>
                        <p className="text-sm text-slate-400 mt-2 leading-snug">{sol.description}</p>
                      </div>
                      {selectedSolution?.id === sol.id && (
                        <div className="bg-cyan-500/20 rounded-full p-1.5 border border-cyan-500/30">
                             <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-5 flex items-center space-x-6 text-sm font-semibold text-slate-300 font-mono">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></span>
                            <span>LEAF:{sol.leafCount}</span>
                        </div>
                        {sol.spineCount > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.8)]"></span>
                                <span>SPINE:{sol.spineCount}</span>
                            </div>
                        )}
                         {sol.spineCount === 0 && (
                            <div className="flex items-center space-x-2 opacity-40">
                                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                <span>SPINE:0</span>
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Visualization & Details */}
          <div className="lg:col-span-8 space-y-8">
            {selectedSolution && typeof serverCount === 'number' ? (
              <>
                {/* Visualizer */}
                <div className="relative">
                     <div className="absolute -top-3 left-4 z-10">
                        <span className="bg-slate-950 border border-slate-700 text-cyan-400 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase font-mono shadow-sm">
                            // 拓扑架构预览
                        </span>
                     </div>
                    <TopologyDiagram solution={selectedSolution} serverCount={serverCount} />
                </div>

                {/* Detailed Specs Card */}
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
                  <div className="bg-slate-800/50 px-8 py-5 border-b border-slate-700/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-lg flex items-center">
                      <Cpu className="w-5 h-5 mr-3 text-cyan-500" />
                      硬件配置详情
                    </h3>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Hardware Stats */}
                    <div className="space-y-6">
                      <div className="bg-cyan-950/10 p-5 rounded-xl border border-cyan-900/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                        <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest font-mono">Leaf 接入层</span>
                        <div className="flex items-baseline mt-2 space-x-2">
                            <div className="text-4xl font-extrabold text-slate-100 font-mono">
                            {selectedSolution.leafCount} <span className="text-sm font-medium text-slate-500 font-sans">台</span>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-slate-400 mt-3 font-mono bg-slate-950/50 inline-block px-2 py-1 rounded">
                          {selectedSolution.leafModel}
                        </div>
                      </div>
                      
                      <div className={`p-5 rounded-xl border relative overflow-hidden ${selectedSolution.spineCount > 0 ? 'bg-indigo-950/10 border-indigo-900/30' : 'bg-slate-900/30 border-slate-800'}`}>
                        {selectedSolution.spineCount > 0 && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>}
                        <span className={`text-xs font-bold uppercase tracking-widest font-mono ${selectedSolution.spineCount > 0 ? 'text-indigo-400' : 'text-slate-500'}`}>Spine 核心层</span>
                        
                        <div className="flex items-baseline mt-2 space-x-2">
                             <div className={`text-4xl font-extrabold font-mono ${selectedSolution.spineCount > 0 ? 'text-slate-100' : 'text-slate-600'}`}>
                                {selectedSolution.spineCount} <span className="text-sm font-medium text-slate-500 font-sans">台</span>
                            </div>
                        </div>
                        
                        {selectedSolution.spineModel ? (
                             <div className="text-sm font-medium text-slate-400 mt-3 font-mono bg-slate-950/50 inline-block px-2 py-1 rounded">
                             {selectedSolution.spineModel}
                           </div>
                        ) : (
                            <span className="text-sm text-slate-600 italic mt-3 block">当前架构不需要配置核心交换机</span>
                        )}
                      </div>
                    </div>

                    {/* Rules List */}
                    <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800">
                      <h4 className="font-bold text-slate-300 mb-5 text-sm flex items-center font-mono uppercase tracking-wider">
                          <Calculator className="w-4 h-4 mr-2 text-slate-500" />
                          测算逻辑说明
                      </h4>
                      <ul className="space-y-4">
                        {selectedSolution.notes.map((note, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-400 leading-relaxed">
                            <ChevronRight className="w-4 h-4 text-cyan-500 mr-2 shrink-0 mt-0.5" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 backdrop-blur-sm">
                <Server className="w-20 h-20 mb-6 opacity-20 text-cyan-500" />
                <p className="text-xl font-bold text-slate-500 font-mono">AWAITING_INPUT...</p>
                <p className="text-sm text-slate-600 mt-3">请在左侧输入服务器数量以开始测算</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}