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
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [obfuscate, setObfuscate] = useState(true);
  const [polymorphic, setPolymorphic] = useState(true);
  const [results, setResults] = useState<PayloadResult[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleExecute = async () => {
    setShowConfirm(true);
  };

  const confirmAndFire = async () => {
    setShowConfirm(false);
    setIsExecuting(true);
    
    const targets = url.split(/[\n,]+/).map(t => t.trim()).filter(t => t);
    
    toast.info(`Executing payload against ${targets.length} target(s)...`, {
      description: `Concurrency: ${concurrency} per target | Method: ${method}`,
      duration: 3000,
    });

    try {
      const allNewResults: PayloadResult[] = [];
      
      for (const targetUrl of targets) {
        const newResults = await executePayload({
          url: targetUrl,
          method,
          headers,
          body,
          concurrency,
          obfuscate,
          polymorphic
        });
        allNewResults.push(...newResults);
      }
      
      setResults(prev => [...allNewResults, ...prev].slice(0, 500));
      
      const successCount = allNewResults.filter(r => typeof r.status === 'number' && r.status < 400).length;
      if (successCount > 0) {
        toast.success(`Payload delivered: ${successCount}/${targets.length * concurrency} successful hits.`, {
          description: `Targets: ${targets.length} processed.`,
          duration: 5000,
        });
      } else {
        toast.error(`Payload failed: All requests returned errors.`, {
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

  const exportData = (format: 'json' | 'csv') => {
    if (results.length === 0) {
      toast.error("No data to export.");
      return;
    }

    let content = '';
    let fileName = `aegis_payload_export_${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      fileName += '.json';
    } else {
      const headers = ['Timestamp', 'Target', 'Hostname', 'Method', 'Status', 'Latency', 'Response'];
      const rows = results.map(r => [
        new Date(r.timestamp).toISOString(),
        r.target,
        r.hostname,
        r.method,
        r.status,
        r.latency,
        r.response.replace(/"/g, '""')
      ]);
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      fileName += '.csv';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${results.length} records to ${format.toUpperCase()}`);
  };

  const exportVitalData = () => {
    if (results.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const headers = ['Timestamp', 'Hostname', 'Status', 'Latency'];
    const rows = results.map(r => [
      new Date(r.timestamp).toISOString(),
      r.hostname,
      r.status,
      r.latency
    ]);
    const content = [headers, ...rows].map(row => row.join(',')).join('\n');
    const fileName = `aegis_vital_intel_${Date.now()}.csv`;

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported vital intel for ${results.length} records`);
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
    setHeaders(preset.headers || {});
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
          <div className="flex items-center gap-1 bg-[#1a1b1e] border border-[#141414] rounded p-1">
            <button 
              onClick={() => exportData('json')}
              className="px-2 py-1 hover:bg-white/5 rounded text-[9px] font-mono text-white/40 hover:text-[#F27D26] transition-all uppercase"
              title="Export Full JSON"
            >
              JSON
            </button>
            <button 
              onClick={() => exportData('csv')}
              className="px-2 py-1 hover:bg-white/5 rounded text-[9px] font-mono text-white/40 hover:text-[#F27D26] transition-all uppercase"
              title="Export Full CSV"
            >
              CSV
            </button>
            <button 
              onClick={() => exportVitalData()}
              className="px-2 py-1 hover:bg-white/5 rounded text-[9px] font-mono text-[#F27D26] hover:bg-[#F27D26]/10 transition-all uppercase font-bold"
              title="Export Vital Info Only"
            >
              Vital
            </button>
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
              <label className="text-[9px] font-mono text-white/40 uppercase">Target Endpoints (One per line or comma-separated)</label>
              <div className="flex items-start gap-2 bg-black border border-white/10 rounded px-2 py-1.5 focus-within:border-[#F27D26] transition-all">
                <Globe size={14} className="text-white/20 mt-1" />
                <textarea 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  rows={3}
                  className="bg-transparent border-none text-xs font-mono w-full focus:outline-none text-white/80 resize-none"
                  placeholder="https://target1.com/api&#10;https://target2.com/api"
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

            {Object.keys(headers).length > 0 && (
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-white/40 uppercase">Active Headers</label>
                <div className="p-2 bg-black border border-white/5 rounded space-y-1">
                  {Object.entries(headers).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[8px] font-mono">
                      <span className="text-white/20">{k}:</span>
                      <span className="text-white/60 truncate max-w-[150px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {method !== 'GET' && (
              <div className="space-y-3">
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

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={obfuscate}
                      onChange={(e) => setObfuscate(e.target.checked)}
                      className="hidden"
                    />
                    <div className={cn(
                      "w-3 h-3 border rounded-[2px] transition-all",
                      obfuscate ? "bg-[#F27D26] border-[#F27D26]" : "border-white/20 group-hover:border-white/40"
                    )} />
                    <span className="text-[9px] font-mono text-white/60 uppercase group-hover:text-white transition-all">Obfuscate</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={polymorphic}
                      onChange={(e) => setPolymorphic(e.target.checked)}
                      className="hidden"
                    />
                    <div className={cn(
                      "w-3 h-3 border rounded-[2px] transition-all",
                      polymorphic ? "bg-[#F27D26] border-[#F27D26]" : "border-white/20 group-hover:border-white/40"
                    )} />
                    <span className="text-[9px] font-mono text-white/60 uppercase group-hover:text-white transition-all">Polymorphic</span>
                  </label>
                </div>
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
      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmAndFire}
        config={{ url, method, concurrency, obfuscate, polymorphic }}
      />
    </div>
  );
}

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  config 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  config: { url: string; method: string; concurrency: number; obfuscate: boolean; polymorphic: boolean } 
}) {
  if (!isOpen) return null;

  const targets = config.url.split(/[\n,]+/).map(t => t.trim()).filter(t => t);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1b1e] border border-[#F27D26]/30 rounded-lg max-w-md w-full shadow-[0_0_50px_rgba(242,125,38,0.1)] overflow-hidden">
        <div className="p-4 border-b border-[#141414] bg-[#151619] flex items-center gap-2">
          <ShieldAlert className="text-[#F27D26]" size={18} />
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest">Confirm Payload Execution</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Target Summary</p>
            <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-mono text-white/40">Method:</span>
                <span className="text-[10px] font-mono text-[#F27D26] font-bold">{config.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-mono text-white/40">Concurrency:</span>
                <span className="text-[10px] font-mono text-white">{config.concurrency} per target</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-mono text-white/40">Total Targets:</span>
                <span className="text-[10px] font-mono text-white">{targets.length}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                <span className="text-[10px] font-mono text-white/40">Evasion:</span>
                <div className="flex gap-2">
                  {config.obfuscate && <span className="text-[8px] font-mono bg-blue-500/20 text-blue-400 px-1 rounded">OBFUSCATED</span>}
                  {config.polymorphic && <span className="text-[8px] font-mono bg-purple-500/20 text-purple-400 px-1 rounded">POLYMORPHIC</span>}
                  {!config.obfuscate && !config.polymorphic && <span className="text-[8px] font-mono text-white/20">NONE</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Target List</p>
            <div className="max-h-32 overflow-y-auto p-2 bg-black/40 rounded border border-white/5 custom-scrollbar">
              {targets.map((t, i) => (
                <div key={i} className="text-[9px] font-mono text-white/60 truncate py-0.5 border-b border-white/5 last:border-0">
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
            <p className="text-[9px] font-mono text-red-500 leading-tight italic">
              Warning: This action will initiate real-time offensive operations against the specified endpoints. Ensure you have authorization.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#151619] border-t border-[#141414] flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 rounded border border-white/10 text-[10px] font-mono uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Abort
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2 rounded bg-[#F27D26] text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-orange-600 transition-all"
          >
            Confirm & Fire
          </button>
        </div>
      </div>
    </div>
  );
}
