import React, { useState, useEffect } from 'react';
import { Chat } from './components/Chat';
import { CorrelationEngine } from './components/CorrelationEngine';
import { CaseManagement } from './components/CaseManagement';
import { HolographicView } from './components/HolographicView';
import { PayloadConsole } from './components/PayloadConsole';
import { Shield, Activity, Terminal, Database, Globe, Menu, X, Bell, Target, Trash2, Briefcase, CheckCircle2, Box, Zap } from 'lucide-react';
import { cn } from './lib/utils';
import { useTracking } from './lib/tracking';
import { useCases } from './lib/cases';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'cases' | 'holographic' | 'payloads'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  
  const { trackedTargets, alerts, trackTarget, untrackTarget, updateTargetInterval, setAlerts, isOfflineMode } = useTracking();
  const { activeCase, addTargetToCase } = useCases();

  useEffect(() => {
    // Expose trackTarget to window for cross-component access
    (window as any).trackTarget = (name: string) => {
      const targetId = trackTarget(name);
      if (targetId) {
        setLastAddedId(targetId);
        toast.success(`Target "${name}" added to tracking`, {
          description: activeCase ? `Linked to case: ${activeCase.name}` : "Not linked to any case",
          duration: 4000,
        });
        if (activeCase) {
          addTargetToCase(activeCase.id, targetId);
        }
        // Auto-scroll to target in sidebar if it's open
        setTimeout(() => {
          const el = document.getElementById(`target-input-${targetId}`);
          el?.focus();
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      return targetId;
    };
  }, [trackTarget, activeCase, addTargetToCase]);

  // Clear highlight after a few seconds
  useEffect(() => {
    if (lastAddedId) {
      const timer = setTimeout(() => setLastAddedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedId]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F27D26] selection:text-black">
      <Toaster position="top-right" theme="dark" richColors />
      {/* Top Navigation Rail */}
      <nav className="h-14 border-b border-[#141414] bg-[#0a0a0a] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded transition-colors"
          >
            <Menu size={20} className="text-[#F27D26]" />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={24} className="text-[#F27D26]" />
            <h1 className="text-lg font-mono font-bold tracking-tighter uppercase">
              Aegis <span className="text-[#F27D26]">OSINT</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {activeCase && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#F27D26]/10 border border-[#F27D26]/20 rounded-full">
              <Briefcase size={12} className="text-[#F27D26]" />
              <span className="text-[10px] font-mono text-[#F27D26] uppercase tracking-widest font-bold">Active Case: {activeCase.name}</span>
            </div>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-white/5 rounded transition-colors relative"
            >
              <Bell size={20} className={cn(alerts.length > 0 ? "text-[#F27D26]" : "text-white/40")} />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a0a]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#1a1b1e] border border-[#141414] rounded-lg shadow-2xl z-[60] overflow-hidden">
                <div className="p-3 border-b border-[#141414] flex items-center justify-between bg-[#151619]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">Live Alerts</span>
                  <button onClick={() => setAlerts([])} className="text-[9px] font-mono text-[#F27D26] hover:underline">Clear All</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-8 text-center opacity-20">
                      <Bell size={24} className="mx-auto mb-2" />
                      <p className="text-[10px] font-mono uppercase">No Active Alerts</p>
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <div key={alert.id} className="p-3 border-b border-[#141414] hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-[#F27D26] font-bold">[{alert.targetName}]</span>
                          <span className="text-[8px] font-mono text-white/20">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] font-sans text-white/80 leading-tight">{alert.finding}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Node: US-EAST-1</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", isOfflineMode ? "bg-yellow-500 animate-pulse" : "bg-[#F27D26]")} />
              <span>{isOfflineMode ? "Offline Heuristics Active" : "Gemini 3.1 Pro Active"}</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-[#141414]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F27D26] to-orange-800 border border-white/10" />
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-3.5rem)] relative">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "bg-[#0a0a0a] border-r border-[#141414] transition-all duration-300 overflow-hidden flex flex-col shrink-0 z-50",
          isSidebarOpen ? "w-64 fixed md:relative h-full" : "w-0"
        )}>
          <div className="p-4 space-y-2 flex-1">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4 px-2">Main Operations</p>
            {[
              { id: 'dashboard', icon: Activity, label: 'Intel Dashboard' },
              { id: 'holographic', icon: Box, label: 'Holographic View' },
              { id: 'chat', icon: Terminal, label: 'AI Command' },
              { id: 'payloads', icon: Zap, label: 'Payload Console' },
              { id: 'cases', icon: Briefcase, label: 'Case Files' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded text-xs font-mono uppercase tracking-tight transition-all",
                  activeTab === item.id 
                    ? "bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}

            <div className="pt-8">
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4 px-2">Tracked Targets</p>
              <div className="space-y-2 px-2">
                {trackedTargets.length === 0 ? (
                  <p className="text-[9px] font-mono text-white/10 italic px-2">No targets tracked</p>
                ) : (
                  trackedTargets.map(target => (
                    <div 
                      key={target.id} 
                      className={cn(
                        "p-2 bg-white/5 rounded border transition-all group",
                        lastAddedId === target.id ? "border-[#F27D26] bg-[#F27D26]/10 scale-[1.02]" : "border-white/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Target size={12} className={cn("shrink-0", lastAddedId === target.id ? "text-white" : "text-[#F27D26]")} />
                          <span className={cn("text-[10px] font-mono truncate font-bold", lastAddedId === target.id ? "text-white" : "text-white/60")}>{target.name}</span>
                        </div>
                        <button 
                          onClick={() => untrackTarget(target.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-white/30 uppercase">Interval (min):</span>
                        <input 
                          id={`target-input-${target.id}`}
                          type="number" 
                          min="1"
                          value={target.interval}
                          onChange={(e) => updateTargetInterval(target.id, parseInt(e.target.value) || 1)}
                          className="w-12 bg-black border border-white/10 rounded text-[9px] font-mono text-[#F27D26] px-1 focus:outline-none focus:border-[#F27D26]"
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[7px] font-mono text-white/20 uppercase">
                          Next scan in: {Math.max(0, Math.ceil((target.interval * 60 * 1000 - (Date.now() - target.lastChecked)) / 60000))}m
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-8">
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4 px-2">Data Sources</p>
              <div className="space-y-1">
                {['Runehall Logs', 'OSRS Highscores', 'Web Archives', 'Underground Forums', '.Onion Dorks'].map((source) => (
                  <div key={source} className="flex items-center gap-3 p-2 px-4 text-[10px] font-mono text-white/30 uppercase">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    {source}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#141414] bg-[#050505]">
            <div className="p-3 bg-[#1a1b1e] rounded border border-[#141414]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-white/40 uppercase">System Load</span>
                <span className="text-[9px] font-mono text-green-500">12%</span>
              </div>
              <div className="h-1 bg-[#141414] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[12%]" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#050505] relative">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
          
          <div className="relative z-10 h-full">
            {activeTab === 'dashboard' ? (
              <CorrelationEngine />
            ) : activeTab === 'holographic' ? (
              <HolographicView />
            ) : activeTab === 'chat' ? (
              <div className="p-6 h-full">
                <Chat />
              </div>
            ) : activeTab === 'payloads' ? (
              <PayloadConsole />
            ) : (
              <CaseManagement />
            )}
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-6 bg-[#F27D26] text-black flex items-center justify-between px-4 text-[9px] font-mono font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span>Status: Operational</span>
          <span>Encrypted: AES-256</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Lat: 37.7749 N</span>
          <span>Lon: 122.4194 W</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
}
