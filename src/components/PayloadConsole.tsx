import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Zap, Play, Trash2, AlertCircle, CheckCircle, Loader2, Globe, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { executePayload, PRESET_PAYLOADS, PayloadResult } from '../lib/payloads';
import { toast } from 'sonner';

export function PayloadConsole() {
  const [url, setUrl] = useState('https://runehall.com/api/bet');
  const [method, setMethod] = useState('POST');
  const [body, setBody] = useState('{"amount": 1000, "game": "crash", "multiplier": 1.01}');
  const [concurrency, setConcurrency] = useState(10);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<PayloadResult[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    toast.info(`Executing payload against ${url}...`, {
      description: `Concurrency: ${concurrency} | Method: ${method}`,
      duration: 3000,
    });

    try {
      const newResults = await executePayload({
        url,
        method,
        headers: {},
        body,
        concurrency
      });
      
      setResults(prev => [...newResults, ...prev].slice(0, 100));
      
      const successCount = newResults.filter(r => typeof r.status === 'number' && r.status < 400).length;
      if (successCount > 0) {
        toast.success(`Payload delivered: ${successCount}/${concurrency} successful hits.`, {
          description: `Target: ${url}`,
          duration: 5000,
        });
      } else {
        toast.error(`Payload failed: All ${concurrency} requests returned errors.`, {
          description: `Check target connectivity or CORS restrictions.`,
          duration: 5000,
        });
      }
    } catch (error: any) {
      toast.error(`Execution error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const clearConsole = () => {
    setResults([]);
    toast.info("Console cleared.");
  };

  const applyPreset = (preset: typeof PRESET_PAYLOADS[0]) => {
    setUrl(preset.url);
    setMethod(preset.method);
    setBody(preset.body || '');
    setConcurrency(preset.concurrency);
    toast.info(`Applied preset: ${preset.name}`);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="text-[#F27D26]" size={24} />
          <div>
            <h2 className="text-xl font-mono font-bold tracking-tighter uppercase">Payload Console</h2>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Real-time exploit delivery engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] font-mono text-green-500 uppercase font-bold">OSINT Proxy Active</span>
          </div>
          <button 
            onClick={clearConsole}
            className="p-2 hover:bg-white/5 rounded text-white/40 hover:text-red-500 transition-all"
            title="Clear Console"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="p-4 bg-[#0a0a0a] border border-[#141414] rounded-lg space-y-4">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Target Configuration</p>
            
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-white/40 uppercase">Endpoint URL</label>
              <div className="flex items-center gap-2 bg-black border border-white/10 rounded px-2 py-1.5 focus-within:border-[#F27D26] transition-all">
                <Globe size={14} className="text-white/20" />
                <input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-transparent border-none text-xs font-mono w-full focus:outline-none text-white/80"
                  placeholder="https://target.com/api/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-white/40 uppercase">Method</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded text-xs font-mono text-white/80 px-2 py-1.5 focus:outline-none focus:border-[#F27D26]"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-white/40 uppercase">Concurrency</label>
                <input 
                  type="number"
                  value={concurrency}
                  onChange={(e) => setConcurrency(parseInt(e.target.value) || 1)}
                  className="w-full bg-black border border-white/10 rounded text-xs font-mono text-white/80 px-2 py-1.5 focus:outline-none focus:border-[#F27D26]"
                />
              </div>
            </div>

            {method !== 'GET' && (
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-white/40 uppercase">Payload Body (JSON)</label>
                <textarea 
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="w-full bg-black border border-white/10 rounded text-[10px] font-mono text-white/80 p-2 focus:outline-none focus:border-[#F27D26] resize-none"
                  placeholder='{"key": "value"}'
                />
              </div>
            )}

            <button 
              onClick={handleExecute}
              disabled={isExecuting}
              className={cn(
                "w-full py-3 rounded font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all",
                isExecuting 
                  ? "bg-white/5 text-white/20 cursor-not-allowed" 
                  : "bg-[#F27D26] text-black hover:bg-orange-600 active:scale-95 shadow-[0_0_15px_rgba(242,125,38,0.3)]"
              )}
            >
              {isExecuting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  Fire Payload
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-[#141414] rounded-lg">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4">Preset Payloads</p>
            <div className="space-y-2">
              {PRESET_PAYLOADS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="w-full text-left p-2 rounded border border-white/5 hover:border-[#F27D26]/40 hover:bg-[#F27D26]/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-white/80 font-bold group-hover:text-[#F27D26]">{preset.name}</span>
                    <span className="text-[8px] font-mono text-white/20 uppercase">{preset.method}</span>
                  </div>
                  <p className="text-[9px] font-mono text-white/40 leading-tight">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terminal Console */}
        <div className="lg:col-span-2 bg-black border border-[#141414] rounded-lg flex flex-col overflow-hidden relative">
          <div className="p-2 bg-[#0a0a0a] border-b border-[#141414] flex items-center gap-2">
            <Terminal size={14} className="text-[#F27D26]" />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Execution Stream</span>
          </div>
          
          <div 
            ref={consoleRef}
            className="flex-1 p-4 font-mono text-[11px] space-y-1 overflow-y-auto custom-scrollbar bg-[#050505]"
          >
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <Terminal size={48} className="mb-4" />
                <p className="text-xs uppercase tracking-widest">Console Idle</p>
              </div>
            ) : (
              results.map((result) => (
                <div key={result.id} className="border-b border-white/5 pb-1 mb-1 last:border-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white/20">[{new Date(result.timestamp).toLocaleTimeString()}]</span>
                    <span className={cn(
                      "px-1 rounded-[2px] text-[9px] font-bold",
                      typeof result.status === 'number' && result.status < 400 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {result.status}
                    </span>
                    <span className="text-[#F27D26] font-bold">{result.method}</span>
                    <span className="text-white/40 truncate flex-1">{result.target}</span>
                    <span className="text-white/20">{result.latency}ms</span>
                  </div>
                  <div className="pl-4 text-white/60 break-all opacity-80">
                    {result.response}
                  </div>
                </div>
              ))
            )}
          </div>

          {isExecuting && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-[#F27D26] animate-spin" />
                <p className="text-[10px] font-mono text-[#F27D26] uppercase tracking-[0.3em] animate-pulse">Delivering Payloads...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-[#F27D26]/5 border border-[#F27D26]/20 rounded flex items-center gap-3">
        <ShieldAlert className="text-[#F27D26]" size={16} />
        <p className="text-[10px] font-mono text-[#F27D26]/80 leading-tight">
          <span className="font-bold uppercase">Operational Warning:</span> Payloads are executed directly from the client browser. Target domains must have permissive CORS policies or be accessed via a proxy if blocked. Real-time race conditions depend on network latency and server-side logic flaws.
        </p>
      </div>
    </div>
  );
}
