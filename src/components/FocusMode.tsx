
import React, { useState, useEffect } from 'react';
import { Milestone, TaskStatus } from '../types';
import { X, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

interface FocusModeProps {
  milestone: Milestone | null;
  onClose: () => void;
  onComplete: (id: string) => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ milestone, onClose, onComplete }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-navy-950 text-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
      <button 
        onClick={onClose}
        className="absolute top-12 left-12 p-4 rounded-2xl hover:bg-white/5 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white"
      >
        <X size={16} /> Exit Deep Work
      </button>

      <div className="max-w-4xl w-full flex flex-col items-center gap-16 text-center">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
            Active Target
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            {milestone?.title || "Quiet your mind."}
          </h2>
          <p className="text-xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">
            {milestone?.description || "Focus on the present moment. Deep academic work starts now."}
          </p>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
          <div className="text-[12rem] md:text-[16rem] font-black tracking-tighter tabular-nums leading-none select-none">
            {formatTime(seconds)}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 bg-white text-navy-950 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
          >
            {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
          </button>
          <button 
            onClick={resetTimer}
            className="w-20 h-20 bg-white/5 border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <RotateCcw size={28} />
          </button>
          {milestone && (
            <button 
              onClick={() => onComplete(milestone.id)}
              className="px-10 h-20 bg-white/5 border border-white/10 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white/10 transition-all"
            >
              <CheckCircle2 size={24} /> Mark as Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
