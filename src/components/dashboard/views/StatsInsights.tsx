import React from 'react';
import { Assignment } from '../../../types';
import { motion } from 'framer-motion';
import {
    Zap,
    Brain,
    Target,
    Timer,
    TrendingUp,
    Calendar,
    Award,
    Activity
} from 'lucide-react';

interface StatsInsightsProps {
    assignments: Assignment[];
}

const StatsInsights: React.FC<StatsInsightsProps> = ({ assignments }) => {
    // 1. Heatmap Data Generation (Mocking based on assignments created/updated dates)
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const weeks = Array(12).fill(0); // 12 weeks of data

    // Calculate cognitive load (weighted progress across all active assignments)
    const totalProgress = assignments.reduce((sum, a) => sum + a.overallProgress, 0);
    const cognitiveEfficiency = assignments.length > 0 ? Math.round(totalProgress / assignments.length) : 0;

    // Peak productive hours (mock data)
    const peakHours = "09:00 - 11:30 AM";

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Cognitive Intelligence</h3>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mt-2">Neural Efficiency & Engagement Metrics</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mastery Level:</span>
                        <span className="ml-3 font-black text-emerald-500 uppercase">Scholar</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cognitive Map (Heatmap) */}
                <div className="lg:col-span-8 p-10 bg-white dark:bg-navy-800 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                <Activity size={20} />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest">Cognitive Continuity</h4>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(v => (
                                <div key={v} className={`w-3 h-3 rounded-sm ${v === 1 ? 'bg-gray-100 dark:bg-white/5' :
                                        v === 2 ? 'bg-blue-200' :
                                            v === 3 ? 'bg-blue-400' :
                                                'bg-blue-600'
                                    }`} />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 justify-between">
                        <div className="flex flex-col justify-between py-2 text-[8px] font-black text-gray-300 uppercase h-32">
                            {days.map(d => <span key={d}>{d}</span>)}
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-2">
                            {weeks.map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    {Array(7).fill(0).map((_, j) => {
                                        const intensity = Math.floor(Math.random() * 4);
                                        const colors = ['bg-gray-50 dark:bg-white/[0.02]', 'bg-blue-100 dark:bg-blue-900/30', 'bg-blue-400/50', 'bg-blue-600'];
                                        return (
                                            <motion.div
                                                key={j}
                                                whileHover={{ scale: 1.2, zIndex: 20 }}
                                                className={`w-full aspect-square rounded-md shadow-sm transition-all cursor-crosshair ${colors[intensity]}`}
                                                title={`Continuity Index: ${intensity}`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between pt-8 border-t border-gray-50 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last 90 Days Perspective</span>
                        </div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                            Consistency: 84% Stable
                        </div>
                    </div>
                </div>

                {/* Vertical Deep Insights */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 bg-navy-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 p-20 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Brain size={20} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Neural Capacity</span>
                            </div>
                            <div className="text-5xl font-black tracking-tighter">{cognitiveEfficiency}%</div>
                            <p className="text-xs font-medium mentor-text italic opacity-60">Average structural retention across active learning clusters.</p>
                        </div>
                    </div>

                    <div className="p-8 bg-blue-600 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group shadow-blue-500/20">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Timer size={20} className="text-white/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Peak Performance</span>
                            </div>
                            <div className="text-2xl font-black tracking-tighter uppercase">{peakHours}</div>
                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '75%' }}
                                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white dark:bg-navy-800 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <Award size={20} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mastery Milestone</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">12</div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-emerald-500 uppercase">+2 This Week</div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Clusters</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsInsights;
