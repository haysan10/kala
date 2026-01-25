
import React, { useState, useEffect } from 'react';
import { Assignment, DailySynapse as DailySynapseType } from '../types';
import { Sparkles, Loader2, CheckCircle, Send, Award, Brain } from 'lucide-react';
import { generateDailySynapse } from '../services/geminiService';
import MathRenderer from './MathRenderer';

interface DailySynapseProps {
  assignments: Assignment[];
  onComplete: (assignmentId: string, response: string) => void;
}

const DailySynapse: React.FC<DailySynapseProps> = ({ assignments, onComplete }) => {
  const [synapse, setSynapse] = useState<DailySynapseType | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedSynapse = localStorage.getItem('kala_daily_synapse');

    if (savedSynapse) {
      const parsed = JSON.parse(savedSynapse) as DailySynapseType;
      if (parsed.date === today) {
        setSynapse(parsed);
        return;
      }
    }

    // If no synapse for today, try to generate one if there are assignments
    if (assignments.length > 0) {
      // Pick most relevant assignment (e.g., closest deadline or at risk)
      const target = assignments.sort((a, b) => {
        if (a.atRisk && !b.atRisk) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })[0];

      if (target.lastSynapseDate !== today) {
        initSynapse(target);
      }
    }
  }, [assignments]);

  const initSynapse = async (assignment: Assignment) => {
    setLoading(true);
    try {
      const question = await generateDailySynapse(
        assignment.title,
        assignment.description,
        assignment.overallProgress,
        assignment.atRisk
      );
      const newSynapse: DailySynapseType = {
        id: Math.random().toString(36).substr(2, 9),
        question,
        assignmentId: assignment.id,
        date: new Date().toISOString().split('T')[0],
        completed: false,
        clarityAwarded: 15
      };
      setSynapse(newSynapse);
      localStorage.setItem('kala_daily_synapse', JSON.stringify(newSynapse));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (!response.trim() || !synapse || isFinishing) return;
    setIsFinishing(true);

    const updated = { ...synapse, completed: true, response };
    setSynapse(updated);
    localStorage.setItem('kala_daily_synapse', JSON.stringify(updated));

    // Simulate cognitive award
    setTimeout(() => {
      onComplete(synapse.assignmentId, response);
      setIsFinishing(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="p-12 rounded-[3.5rem] border border-navy-50 dark:border-navy-900 bg-navy-50/20 flex items-center justify-center gap-4">
        <Loader2 size={20} className="animate-spin text-navy-400" />
        <span className="academic-label !opacity-100">Calibrating Daily Synapse...</span>
      </div>
    );
  }

  if (!synapse) return null;

  if (synapse.completed && !isFinishing) {
    return (
      <div className="p-10 rounded-[3.5rem] bg-navy-900 dark:bg-white text-white dark:text-navy-900 shadow-2xl flex items-center justify-between animate-in zoom-in duration-700">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white/10 dark:bg-navy-900/10 rounded-2xl flex items-center justify-center"><Award size={32} /></div>
          <div>
            <span className="academic-label !text-white/40 dark:!text-navy-900/40 block">Synapse Calibrated</span>
            <p className="text-xl font-black tracking-tight">Intellectual momentum confirmed for today.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="academic-label !text-white/40 dark:!text-navy-900/40 block">Clarity Index</span>
          <span className="text-2xl font-black">+{synapse.clarityAwarded} pts</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-navy-900 dark:bg-white rounded-[3.5rem] blur opacity-5 group-hover:opacity-10 transition-all"></div>
      <div className="relative p-12 rounded-[3.5rem] border border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-950 shadow-sm hover:shadow-2xl transition-all space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-navy-50 dark:bg-navy-900 rounded-xl flex items-center justify-center text-navy-900 dark:text-white shadow-inner"><Brain size={20} /></div>
            <span className="academic-label !opacity-100">Synapse Calibration {synapse.date.replace(/-/g, '.')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-navy-900 dark:bg-white animate-pulse"></span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Live Inactive Buffer</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-4xl font-black tracking-tighter text-navy-900 dark:text-white leading-none mentor-text italic">
            <MathRenderer content={`"${synapse.question}"`} />
          </div>
          <p className="text-sm text-navy-400 font-medium font-serif italic opacity-60">
            A 60-second intellectual response clears procrastination inertia.
          </p>
        </div>

        <div className="relative flex items-center gap-4">
          <input
            type="text"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={isFinishing}
            onKeyPress={(e) => e.key === 'Enter' && handleFinish()}
            placeholder="Document your cognitive baseline..."
            className="flex-1 bg-navy-50/50 dark:bg-navy-900/50 border border-navy-50 dark:border-navy-800 rounded-2xl px-8 py-4 text-lg font-medium outline-none focus:border-navy-900 transition-all dark:text-white placeholder:opacity-30"
          />
          <button
            onClick={handleFinish}
            disabled={!response.trim() || isFinishing}
            className="w-14 h-14 bg-navy-900 dark:bg-white text-white dark:text-navy-900 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-20"
          >
            {isFinishing ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailySynapse;
