import React, { useState, useEffect } from 'react';
import { Assignment, DailySynapse as DailySynapseType } from '../../types';
import { Sparkles, Loader2, CheckCircle, Send, Award, Brain } from 'lucide-react';
import { generateDailySynapse } from '../../services/geminiService';

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
      <div className="p-8 rounded-2xl border border-soft bg-secondary flex items-center justify-center gap-4">
        <Loader2 size={18} className="animate-spin text-t-muted" />
        <span className="text-sm font-medium text-t-secondary">Preparing daily synapse...</span>
      </div>
    );
  }

  if (!synapse) return null;

  if (synapse.completed && !isFinishing) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Award size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-t-tertiary mb-1">Synapse Complete</p>
            <p className="text-sm font-bold text-t-primary">Great work! Your daily reflection is logged.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-t-tertiary mb-1">Clarity Points</p>
          <span className="text-xl font-bold text-green-600 dark:text-green-400">+{synapse.clarityAwarded}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-t-tertiary">Daily Synapse · {synapse.date.replace(/-/g, '.')}</p>
            <p className="text-sm font-bold text-t-primary">Quick reflection to start your day</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] font-medium text-t-muted uppercase tracking-wider">Active</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-medium text-t-primary leading-relaxed">
          "{synapse.question}"
        </p>
        <p className="text-xs text-t-muted">
          Take 60 seconds to reflect on this question.
        </p>
      </div>

      <div className="relative flex items-center gap-3">
        <input
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={isFinishing}
          onKeyPress={(e) => e.key === 'Enter' && handleFinish()}
          placeholder="Type your reflection..."
          className="flex-1 bg-primary border border-soft rounded-xl px-4 py-3 text-sm text-t-primary placeholder:text-t-muted outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
        />
        <button
          onClick={handleFinish}
          disabled={!response.trim() || isFinishing}
          className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isFinishing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default DailySynapse;
