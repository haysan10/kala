
import React, { useState, useEffect, useRef } from 'react';
import { Milestone, MiniCourse, DebateTurn } from '../types';
import { X, Sword, Shield, Zap, Send, Loader2, Award, Info } from 'lucide-react';
import { startDebateSession } from '../services/geminiService';

interface DebateRoomProps {
  milestone: Milestone;
  assignmentContext: string;
  onClose: (updatedCourse?: MiniCourse) => void;
}

const DebateRoom: React.FC<DebateRoomProps> = ({ milestone, assignmentContext, onClose }) => {
  const [history, setHistory] = useState<DebateTurn[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [intellectualTension, setIntellectualTension] = useState(0);
  const chatRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isThinking]);

  useEffect(() => {
    if (!milestone.miniCourse) return;
    
    chatRef.current = startDebateSession(milestone.title, milestone.miniCourse, assignmentContext);
    
    // Initial challenge
    setIsThinking(true);
    chatRef.current.sendMessage({ message: "Open the debate. Challenge my understanding of the core concepts you just provided." })
      .then((res: any) => {
        setHistory([{ role: 'model', text: res.text, intellectualWeight: 50 }]);
        setIsThinking(false);
      });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userTurn: DebateTurn = { role: 'user', text: input, intellectualWeight: 0 };
    setHistory(prev => [...prev, userTurn]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const modelText = response.text;
      
      // Heuristic for weight - would ideally be structured from AI
      const weight = Math.min(100, Math.max(0, intellectualTension + (Math.random() * 20 - 5)));
      setIntellectualTension(weight);

      setHistory(prev => [...prev, { 
        role: 'model', 
        text: modelText, 
        intellectualWeight: weight 
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const concludeDebate = () => {
    const finalStatus = intellectualTension > 85 ? 'perfected' : 'refined';
    const updated: MiniCourse = {
      ...milestone.miniCourse!,
      masteryStatus: finalStatus,
      debateHistory: history
    };
    onClose(updated);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-navy-950 text-white flex flex-col font-sans animate-in fade-in duration-500">
      {/* HUD Header */}
      <header className="px-12 py-8 border-b border-white/5 flex items-center justify-between backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white text-navy-950 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Sword size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase">Academic Sparring</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Target: {milestone.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Intellectual Precision</div>
            <div className="flex items-center gap-4">
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${intellectualTension}%` }} 
                />
              </div>
              <span className="text-xs font-black tabular-nums">{Math.round(intellectualTension)}%</span>
            </div>
          </div>
          <button onClick={() => onClose()} className="p-4 hover:bg-white/10 rounded-2xl transition-all">
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Sparring Ground */}
      <div className="flex-1 overflow-y-auto px-12 py-12 space-y-12 max-w-5xl mx-auto w-full scroll-smooth">
        {history.map((turn, i) => (
          <div key={i} className={`flex gap-8 group animate-in slide-in-from-bottom-4 duration-500 ${turn.role === 'model' ? '' : 'flex-row-reverse'}`}>
            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border transition-all ${turn.role === 'model' ? 'bg-white text-navy-950 border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-transparent border-white/20 text-white'}`}>
              {turn.role === 'model' ? <Zap size={18} /> : <Shield size={18} />}
            </div>
            <div className={`space-y-4 max-w-[80%] ${turn.role === 'user' ? 'text-right' : ''}`}>
              <div className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ${turn.role === 'user' ? 'justify-end' : ''} flex items-center gap-2`}>
                {turn.role === 'model' ? 'Socratic Challenger' : 'Student Logic'}
              </div>
              <div className={`text-xl font-medium leading-relaxed font-serif italic ${turn.role === 'model' ? 'text-white/90' : 'text-white/60'}`}>
                {turn.text}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-8 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-white/20" />
            </div>
            <div className="h-4 w-48 bg-white/5 rounded mt-3"></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Controls */}
      <footer className="p-12 border-t border-white/5 backdrop-blur-3xl">
        <div className="max-w-5xl mx-auto space-y-8">
          {intellectualTension > 75 && (
            <div className="flex justify-center animate-in zoom-in duration-500">
               <button 
                onClick={concludeDebate}
                className="bg-white text-navy-950 px-12 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)]"
               >
                 <Award size={20} /> Finalize Mastery Verdict
               </button>
            </div>
          )}

          <div className="relative">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Present your counter-argument or clarify your logic..."
              className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 pr-24 text-lg font-medium outline-none focus:border-white/40 focus:bg-white/10 transition-all resize-none min-h-[140px]"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="absolute bottom-6 right-6 w-16 h-16 bg-white text-navy-950 rounded-[1.5rem] flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-20"
            >
              <Send size={24} />
            </button>
          </div>

          <div className="flex items-center gap-3 justify-center text-white/20">
            <Info size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Precision Sparring: Maintain academic rigor for better validation.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DebateRoom;
