import React, { useState, useEffect } from 'react';
import { FileText, Shield, Target, Globe, Zap, Download, Share2, Trash2, Search } from 'lucide-react';
import { generateDossier, Dossier } from '../lib/dossier';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export function DossierView() {
  const [targetName, setTargetName] = useState('SouthernG');
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateDossier(targetName);
      setDossier(result);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F27D26]/10 rounded border border-[#F27D26]/20">
            <FileText className="text-[#F27D26]" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold uppercase tracking-tighter">Target Dossier Engine</h2>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Comprehensive Digital Footprint Analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input 
              type="text" 
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Target Identifier..."
              className="bg-[#1a1b1e] border border-[#141414] rounded px-3 py-2 pl-9 text-xs font-mono text-white focus:outline-none focus:border-[#F27D26] w-64"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-[#F27D26] text-black px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-widest hover:bg-[#F27D26]/90 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Analyzing...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {!dossier ? (
          <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <div className="text-center opacity-20">
              <Target size={48} className="mx-auto mb-4" />
              <p className="font-mono uppercase tracking-widest">No Dossier Generated</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Summary */}
            <div className="space-y-6">
              <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <Shield size={40} className="text-[#F27D26]/5" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded bg-gradient-to-br from-[#F27D26] to-orange-900 border border-white/10 flex items-center justify-center text-2xl font-mono font-bold">
                    {dossier.target[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-mono font-bold text-[#F27D26]">{dossier.target}</h3>
                    <p className="text-[10px] font-mono text-white/40 uppercase">Verified Identity</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-1">Known Aliases</p>
                    <div className="flex flex-wrap gap-2">
                      {dossier.profile.variants.map(v => (
                        <span key={v} className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-white/60">{v}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-1">Contact Vectors</p>
                    <div className="space-y-1">
                      {dossier.profile.emails.map(e => (
                        <div key={e} className="text-[10px] font-mono text-white/80">{e}</div>
                      ))}
                      {dossier.profile.phoneNumbers.map(p => (
                        <div key={p} className="text-[10px] font-mono text-white/80">{p}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-6">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Globe size={14} className="text-[#F27D26]" />
                  Network Footprint
                </h4>
                <div className="space-y-3">
                  {dossier.networkFootprint.map((n, i) => (
                    <div key={i} className="p-3 bg-black/20 rounded border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-[#F27D26]">{n.ip}</span>
                        <span className="text-[8px] font-mono text-white/20 uppercase">{n.location}</span>
                      </div>
                      <p className="text-[9px] font-mono text-white/40 uppercase">{n.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle & Right Column: Detailed Intel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#141414] bg-[#151619] flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">Intelligence Report</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-white/5 rounded text-white/40 transition-colors">
                      <Download size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-white/5 rounded text-white/40 transition-colors">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-6 prose prose-invert prose-sm max-w-none font-sans leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[#F27D26] font-mono uppercase text-xs tracking-widest mb-4 border-b border-[#F27D26]/20 pb-2">Forum Activity</h4>
                      <div className="space-y-4">
                        {dossier.forumActivity.map((f, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white/90">{f.platform}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded border border-green-500/20">{f.status}</span>
                            </div>
                            <p className="text-xs text-white/60 mb-1">User: <span className="text-[#F27D26]">{f.username}</span></p>
                            <p className="text-[11px] text-white/40 italic">{f.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[#F27D26] font-mono uppercase text-xs tracking-widest mb-4 border-b border-[#F27D26]/20 pb-2">Gaming History</h4>
                      <div className="space-y-4">
                        {dossier.gamingHistory.map((g, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white/90">{g.game}</span>
                              <span className="text-[9px] font-mono text-white/40">{g.level}</span>
                            </div>
                            <p className="text-xs text-white/60">{g.activity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-[#F27D26] font-mono uppercase text-xs tracking-widest mb-4 border-b border-[#F27D26]/20 pb-2">Operational Notes</h4>
                    <div className="p-4 bg-black/20 rounded border border-white/5 text-xs text-white/70 italic leading-relaxed">
                      {dossier.profile.notes}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-4">
                <Zap className="text-red-500 shrink-0" size={20} />
                <div>
                  <h5 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest mb-1">Critical Vulnerability Detected</h5>
                  <p className="text-[11px] text-red-500/70 leading-relaxed font-mono">
                    Target's residential ingress (108.95.121.60) shows an open port on 8080. 
                    Correlation with OSRS session data suggests a potential for session hijacking via the 'Runehall Cookie Dork' payload.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
