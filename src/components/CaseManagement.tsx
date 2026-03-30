import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, Archive, CheckCircle2, Clock, Target, FileText, Activity, ChevronRight, Search, AlertTriangle } from 'lucide-react';
import { useCases, Case } from '../lib/cases';
import { cn } from '../lib/utils';

export function CaseManagement() {
  const { cases, activeCaseId, setActiveCaseId, createCase, deleteCase, updateCase } = useCases();
  const [isCreating, setIsCreating] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseName.trim()) return;
    const newCase = createCase(newCaseName, newCaseDesc);
    setActiveCaseId(newCase.id);
    setNewCaseName('');
    setNewCaseDesc('');
    setIsCreating(false);
  };

  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCase = cases.find(c => c.id === activeCaseId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full">
      {/* Case List Sidebar */}
      <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
        <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-6 shadow-xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F27D26]/10 rounded border border-[#F27D26]/20">
                <Briefcase size={20} className="text-[#F27D26]" />
              </div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-white">Case Files</h2>
            </div>
            <button 
              onClick={() => setIsCreating(true)}
              className="p-1.5 bg-[#F27D26] text-black rounded hover:bg-[#F27D26]/90 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151619] border border-[#141414] rounded p-2 pl-9 text-[10px] font-mono text-white focus:outline-none focus:border-[#F27D26] transition-colors uppercase tracking-widest"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12 opacity-20">
                <Briefcase size={32} className="mx-auto mb-2" />
                <p className="text-[10px] font-mono uppercase">No Cases Found</p>
              </div>
            ) : (
              filteredCases.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={cn(
                    "w-full text-left p-3 rounded border transition-all group",
                    activeCaseId === c.id 
                      ? "bg-[#F27D26]/10 border-[#F27D26]/30" 
                      : "bg-[#151619] border-[#141414] hover:border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[10px] font-mono font-bold uppercase tracking-widest truncate",
                      activeCaseId === c.id ? "text-[#F27D26]" : "text-white/60"
                    )}>
                      {c.name}
                    </span>
                    <span className={cn(
                      "text-[8px] font-mono px-1.5 py-0.5 rounded uppercase",
                      c.status === 'active' ? "bg-green-500/10 text-green-500" : 
                      c.status === 'closed' ? "bg-red-500/10 text-red-500" : "bg-white/10 text-white/40"
                    )}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/30 line-clamp-1 mb-2">{c.description}</p>
                  <div className="flex items-center gap-3 text-[8px] font-mono text-white/20 uppercase">
                    <span className="flex items-center gap-1"><Target size={10} /> {c.targetIds.length}</span>
                    <span className="flex items-center gap-1"><Activity size={10} /> {c.investigationIds.length}</span>
                    <span className="flex items-center gap-1"><FileText size={10} /> {c.reportIds.length}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Case Detail View */}
      <div className="lg:col-span-2 space-y-6">
        {activeCase ? (
          <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-6 shadow-xl h-full flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-mono font-bold uppercase tracking-tighter text-white">
                    Case: <span className="text-[#F27D26]">{activeCase.name}</span>
                  </h2>
                  <div className="px-2 py-0.5 bg-[#F27D26]/10 border border-[#F27D26]/20 rounded text-[10px] font-mono text-[#F27D26] uppercase">
                    ID: {activeCase.id}
                  </div>
                </div>
                <p className="text-xs text-white/40 font-sans max-w-xl">{activeCase.description}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateCase(activeCase.id, { status: activeCase.status === 'active' ? 'closed' : 'active' })}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-white/60 hover:text-white"
                  title={activeCase.status === 'active' ? "Close Case" : "Reopen Case"}
                >
                  {activeCase.status === 'active' ? <Archive size={16} /> : <CheckCircle2 size={16} />}
                </button>
                <button 
                  onClick={() => deleteCase(activeCase.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors text-red-500/60 hover:text-red-500"
                  title="Delete Case"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#151619] border border-[#141414] rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Status</span>
                  <Activity size={14} className="text-[#F27D26]" />
                </div>
                <div className="text-lg font-mono font-bold uppercase text-white">{activeCase.status}</div>
              </div>
              <div className="bg-[#151619] border border-[#141414] rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Created</span>
                  <Clock size={14} className="text-[#F27D26]" />
                </div>
                <div className="text-lg font-mono font-bold text-white">{new Date(activeCase.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="bg-[#151619] border border-[#141414] rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Priority</span>
                  <AlertTriangle size={14} className="text-yellow-500" />
                </div>
                <div className="text-lg font-mono font-bold text-white">HIGH</div>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
              {/* Linked Targets */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-mono text-white/60 uppercase tracking-widest flex items-center gap-2">
                    <Target size={14} className="text-[#F27D26]" /> Linked Targets
                  </h3>
                  <span className="text-[10px] font-mono text-white/20">{activeCase.targetIds.length} Detected</span>
                </div>
                <div className="space-y-2">
                  {activeCase.targetIds.length === 0 ? (
                    <div className="p-4 bg-white/5 rounded border border-dashed border-white/10 text-[10px] font-mono text-white/20 text-center">
                      No targets associated with this case
                    </div>
                  ) : (
                    activeCase.targetIds.map(id => (
                      <div key={id} className="p-3 bg-[#151619] border border-[#141414] rounded flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-xs font-mono text-white/80">{id}</span>
                        </div>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-[#F27D26] transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Linked Investigations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-mono text-white/60 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-[#F27D26]" /> Investigations
                  </h3>
                  <span className="text-[10px] font-mono text-white/20">{activeCase.investigationIds.length} Active</span>
                </div>
                <div className="space-y-2">
                  {activeCase.investigationIds.length === 0 ? (
                    <div className="p-4 bg-white/5 rounded border border-dashed border-white/10 text-[10px] font-mono text-white/20 text-center">
                      No investigations linked to this case
                    </div>
                  ) : (
                    activeCase.investigationIds.map(id => (
                      <div key={id} className="p-3 bg-[#151619] border border-[#141414] rounded flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <FileText size={14} className="text-white/20" />
                          <span className="text-xs font-mono text-white/80">{id}</span>
                        </div>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-[#F27D26] transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-6 shadow-xl h-full flex flex-col items-center justify-center text-center opacity-20">
            <Briefcase size={64} className="mb-4" />
            <h2 className="text-xl font-mono font-bold uppercase tracking-widest mb-2">No Case Selected</h2>
            <p className="text-xs font-mono max-w-xs">Select an existing case from the sidebar or create a new one to begin organizing intelligence.</p>
          </div>
        )}
      </div>

      {/* Create Case Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#F27D26]/10 rounded border border-[#F27D26]/20">
                <Briefcase size={20} className="text-[#F27D26]" />
              </div>
              <h2 className="text-lg font-mono uppercase tracking-widest text-white">Initialize New Case</h2>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Case Designation</label>
                <input 
                  type="text"
                  required
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                  placeholder="e.g. OPERATION_GOLD_SINK"
                  className="w-full bg-[#151619] border border-[#141414] rounded p-3 text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Mission Description</label>
                <textarea 
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  placeholder="Define the scope and objectives of this intelligence operation..."
                  className="w-full bg-[#151619] border border-[#141414] rounded p-3 text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors font-mono min-h-[100px] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 bg-white/5 text-white/60 font-mono text-xs uppercase font-bold rounded hover:bg-white/10 transition-colors"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#F27D26] text-black font-mono text-xs uppercase font-bold rounded hover:bg-[#F27D26]/90 transition-colors"
                >
                  Initialize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
