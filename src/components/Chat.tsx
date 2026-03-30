import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2, Volume2 } from 'lucide-react';
import { models, textToSpeech } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = ai.chats.create({
        model: models.pro,
        config: {
          systemInstruction: "You are the Aegis OSINT Chatbot. You assist in cross-correlating data, generating dorks, and analyzing underground forum activity. Be concise, technical, and professional.",
        },
      });
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "No response." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Failed to process intelligence request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async (text: string) => {
    setIsSpeaking(true);
    try {
      const base64Audio = await textToSpeech(text);
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#151619] border border-[#141414] rounded-lg overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#141414] bg-[#1a1b1e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-[#F27D26]" />
          <span className="text-xs font-mono uppercase tracking-widest text-white/70">Intelligence Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-500 uppercase">System Online</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded bg-[#F27D26]/10 flex items-center justify-center border border-[#F27D26]/20 shrink-0">
                <Bot size={14} className="text-[#F27D26]" />
              </div>
            )}
            <div className={cn(
              "max-w-[85%] p-3 rounded text-sm font-sans leading-relaxed",
              msg.role === 'user' 
                ? "bg-[#F27D26] text-black font-medium" 
                : "bg-[#1a1b1e] text-white/90 border border-[#141414]"
            )}>
              <div className="prose prose-invert prose-xs max-w-none">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
              {msg.role === 'model' && (
                <button 
                  onClick={() => playTTS(msg.text)}
                  disabled={isSpeaking}
                  className="mt-2 text-[#F27D26] hover:text-[#F27D26]/80 transition-colors"
                >
                  <Volume2 size={14} />
                </button>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <User size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded bg-[#F27D26]/10 flex items-center justify-center border border-[#F27D26]/20 shrink-0">
              <Loader2 size={14} className="text-[#F27D26] animate-spin" />
            </div>
            <div className="bg-[#1a1b1e] p-3 rounded border border-[#141414]">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-[#F27D26] rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-[#F27D26] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-[#F27D26] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#1a1b1e] border-t border-[#141414]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter query or target identifier..."
            className="w-full bg-[#151619] border border-[#141414] rounded p-3 pr-12 text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors font-mono placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#F27D26] hover:bg-[#F27D26]/10 rounded transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
