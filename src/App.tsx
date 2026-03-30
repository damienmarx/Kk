import React, { useState } from 'react';
import { Chat } from './components/Chat';
import { CorrelationEngine } from './components/CorrelationEngine';
import { Shield, Activity, Terminal, Database, Globe, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F27D26] selection:text-black">
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
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Node: US-EAST-1</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]" />
              <span>Gemini 3.1 Pro Active</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-[#141414]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F27D26] to-orange-800 border border-white/10" />
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className={cn(
          "bg-[#0a0a0a] border-r border-[#141414] transition-all duration-300 overflow-hidden flex flex-col shrink-0",
          isSidebarOpen ? "w-64" : "w-0"
        )}>
          <div className="p-4 space-y-2 flex-1">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4 px-2">Main Operations</p>
            {[
              { id: 'dashboard', icon: Activity, label: 'Intel Dashboard' },
              { id: 'chat', icon: Terminal, label: 'AI Command' },
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
            ) : (
              <div className="p-6 h-full">
                <Chat />
              </div>
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
