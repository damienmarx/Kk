import React, { useState } from 'react';
import { Upload, FileText, Search, Link as LinkIcon, Shield, Database, Globe, Hash, AlertTriangle, Loader2, BrainCircuit, Download, FileJson, Target } from 'lucide-react';
import { analyzeImage, complexReasoning, generateIntel, models } from '../lib/gemini';
import { cn } from '../lib/utils';
import { exportToText, exportToPDF } from '../lib/export';
import ReactMarkdown from 'react-markdown';

export function CorrelationEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [intelReport, setIntelReport] = useState<string | null>(null);
  const [isGeneratingIntel, setIsGeneratingIntel] = useState(false);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const runOCRAnalysis = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    try {
      const base64 = preview.split(',')[1];
      const result = await analyzeImage(base64, "Analyze this image for OSINT purposes. Look for usernames, IP addresses, transaction hashes, or any metadata related to OSRS, Runehall, or underground forums.");
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setAnalysis("Error analyzing image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runCrossCorrelation = async () => {
    if (!targetId.trim()) return;
    setIsGeneratingIntel(true);
    try {
      const prompt = `Perform a deep cross-correlation analysis for the target: "${targetId}". 
      Search across:
      - Google (using search grounding)
      - OSRS Highscores / Wise Old Man
      - Runehall betting logs
      - Twitter/Twitch/Discord mentions
      - Web Archives (Wayback Machine)
      - Underground forums (Sythe, Powerbot, etc.)
      - .onion site dorks
      
      Structure the report with:
      1. Executive Summary
      2. Identified Platforms
      3. Cross-Platform Correlations
      4. Activity Timeline
      5. Risk Assessment`;

      const response = await generateIntel(prompt, models.flash, [{ googleSearch: {} }]);
      setIntelReport(response.text || "No intel found.");
      
      // Auto-track if not already tracked
      if ((window as any).trackTarget) {
        (window as any).trackTarget(targetId);
      }
    } catch (error) {
      console.error(error);
      setIntelReport("Error generating intel report.");
    } finally {
      setIsGeneratingIntel(false);
    }
  };

  const runDeepAnalysis = async () => {
    if (!targetId.trim()) return;
    setIsDeepThinking(true);
    try {
      const result = await complexReasoning(`Perform an exhaustive, high-thinking cross-correlation for: "${targetId}". 
      Focus on hidden connections, potential aliases, and technical footprints across OSRS, Runehall, and underground forums. 
      Analyze the provided context about Runehall's logic flaws and see if this target exhibits patterns of exploitation.`);
      setIntelReport(result);
    } catch (error) {
      console.error(error);
      setIntelReport("Error during deep analysis.");
    } finally {
      setIsDeepThinking(false);
    }
  };

  const runToolAction = async (toolId: string) => {
    if (!targetId.trim()) return;
    setIsGeneratingIntel(true);
    setActiveTool(toolId);
    try {
      let prompt = "";
      let tools: any[] = [];
      
      switch (toolId) {
        case 'web-archive':
          prompt = `Find archived versions of ${targetId}'s digital presence using the Wayback Machine or Google Cache. 
          Look for deleted tweets, old forum posts (Sythe, RuneScape), or archived profile pages. 
          Provide specific links or dorks to find this evidence.`;
          tools = [{ googleSearch: {} }];
          break;
        case 'osrs':
          prompt = `Retrieve OSRS Highscores and Wise Old Man data for the player: "${targetId}". 
          Include combat level, total level, and any recent XP gains or boss kills.`;
          tools = [{ googleSearch: {} }];
          break;
        case 'crypto':
          prompt = `Search for cryptocurrency wallet addresses or transaction hashes associated with the alias "${targetId}" on OSRS gambling platforms like Runehall. 
          Check for mentions in leaked logs or forum threads.`;
          tools = [{ googleSearch: {} }];
          break;
        case 'onion':
          prompt = `Generate specific .onion dorks and search patterns to find mentions of "${targetId}" on underground marketplaces or forums. 
          Do not provide live links to illegal content, only the search methodology.`;
          break;
      }

      const response = await generateIntel(prompt, models.flash, tools);
      const toolOutput = `\n\n---\n## [${toolId.toUpperCase()} INTEL REPORT]\n${response.text}`;
      setIntelReport(prev => (prev ? prev + toolOutput : response.text || ""));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingIntel(false);
      setActiveTool(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* OCR & Upload Module */}
      <div className="space-y-6">
        <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#F27D26]/10 rounded border border-[#F27D26]/20">
              <Upload size={20} className="text-[#F27D26]" />
            </div>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-white">Evidence Upload</h2>
              <p className="text-[10px] text-white/40 font-mono">OCR / IMAGE ANALYSIS MODULE</p>
            </div>
          </div>

          <div 
            className={cn(
              "border-2 border-dashed border-[#141414] rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer hover:border-[#F27D26]/50",
              preview && "border-none p-0"
            )}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full rounded-lg object-contain max-h-[300px]" />
            ) : (
              <>
                <Upload size={32} className="text-white/20 mb-4" />
                <p className="text-xs text-white/40 font-mono">DRAG & DROP OR CLICK TO UPLOAD EVIDENCE</p>
              </>
            )}
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </div>

          {preview && (
            <button
              onClick={runOCRAnalysis}
              disabled={isAnalyzing}
              className="w-full mt-4 bg-[#F27D26] text-black font-mono text-xs py-3 rounded uppercase font-bold hover:bg-[#F27D26]/90 transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Run OCR Intelligence Scan
            </button>
          )}

          {analysis && (
            <div className="mt-6 p-4 bg-[#151619] border border-[#141414] rounded text-xs font-mono text-white/70 leading-relaxed max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2 text-[#F27D26]">
                <AlertTriangle size={14} />
                <span className="uppercase tracking-tighter">Analysis Results</span>
              </div>
              <div className="prose prose-invert prose-xs max-w-none">
                <ReactMarkdown>
                  {analysis}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Quick Dorking / Tools */}
        <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-6 shadow-xl">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/70 mb-4">Intelligence Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'web-archive', icon: Globe, label: "Web Archives", color: "text-blue-400" },
              { id: 'osrs', icon: Database, label: "OSRS Highscores", color: "text-green-400" },
              { id: 'crypto', icon: Hash, label: "Crypto Explorer", color: "text-yellow-400" },
              { id: 'onion', icon: Shield, label: "Onion Dorks", color: "text-purple-400" },
            ].map((tool, i) => (
              <button 
                key={i} 
                onClick={() => runToolAction(tool.id)}
                disabled={isGeneratingIntel || !targetId}
                className={cn(
                  "flex items-center gap-3 p-3 bg-[#151619] border border-[#141414] rounded hover:border-white/20 transition-colors text-left group disabled:opacity-50",
                  activeTool === tool.id && "border-[#F27D26] bg-[#F27D26]/5"
                )}
              >
                {activeTool === tool.id ? (
                  <Loader2 size={16} className="text-[#F27D26] animate-spin" />
                ) : (
                  <tool.icon size={16} className={cn(tool.color, "group-hover:scale-110 transition-transform")} />
                )}
                <span className="text-[10px] font-mono text-white/60 uppercase">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cross Correlation Module */}
      <div className="bg-[#1a1b1e] border border-[#141414] rounded-lg p-6 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F27D26]/10 rounded border border-[#F27D26]/20">
              <Search size={20} className="text-[#F27D26]" />
            </div>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-white">Cross-Correlation Engine</h2>
              <p className="text-[10px] text-white/40 font-mono">MULTI-SOURCE INTEL SYNC</p>
            </div>
          </div>
          
          {intelReport && (
            <div className="flex gap-2">
              <button 
                onClick={() => exportToText(`intel_report_${targetId}`, intelReport)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-white/60 hover:text-white"
                title="Export as Text"
              >
                <FileText size={14} />
              </button>
              <button 
                onClick={() => exportToPDF('intel-report-content', `intel_report_${targetId}`)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-white/60 hover:text-white"
                title="Export as PDF"
              >
                <Download size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="Enter Username, Wallet, or Alias..."
            className="flex-1 bg-[#151619] border border-[#141414] rounded p-3 text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors font-mono placeholder:text-white/20"
          />
          <div className="flex gap-2">
            <button
              onClick={runCrossCorrelation}
              disabled={isGeneratingIntel || isDeepThinking || !targetId}
              className="bg-[#F27D26] text-black px-4 rounded font-mono text-xs uppercase font-bold hover:bg-[#F27D26]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isGeneratingIntel ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Sync
            </button>
            <button
              onClick={runDeepAnalysis}
              disabled={isGeneratingIntel || isDeepThinking || !targetId}
              className="bg-purple-600 text-white px-4 rounded font-mono text-xs uppercase font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isDeepThinking ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
              Deep
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#151619] border border-[#141414] rounded p-4 overflow-y-auto font-mono text-[11px] text-white/80 leading-relaxed scrollbar-hide">
          {intelReport ? (
            <div id="intel-report-content" className="prose prose-invert prose-xs max-w-none p-4 bg-[#050505] rounded border border-white/5">
              <div className="mb-4 pb-4 border-b border-white/10 flex justify-between items-center">
                <span className="text-[10px] text-[#F27D26] font-bold uppercase tracking-widest">Aegis Intelligence Report</span>
                <span className="text-[8px] text-white/20 uppercase">{new Date().toLocaleString()}</span>
              </div>
              <ReactMarkdown>
                {intelReport}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Database size={48} className="mb-4" />
              <p className="uppercase tracking-widest">Awaiting Target Input</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
