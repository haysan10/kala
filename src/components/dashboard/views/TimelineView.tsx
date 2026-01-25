import React from 'react';
import { Assignment } from '../../../types';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';

interface TimelineViewProps {
    assignments: Assignment[];
    onSelect: (id: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ assignments, onSelect }) => {
    // Sort assignments by deadline
    const sortedAssignments = [...assignments].sort((a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    return (
        <div className="relative py-10">
            {/* Center Line */}
            <div className="absolute left-[39px] top-0 bottom-0 w-px bg-gray-100 dark:bg-white/5" />

            <div className="space-y-12">
                {sortedAssignments.map((assignment, index) => {
                    const deadline = new Date(assignment.deadline);
                    const isOverdue = deadline < new Date() && assignment.overallProgress < 100;

                    return (
                        <div key={assignment.id} className="relative flex gap-12 group">
                            {/* Dot */}
                            <div className={`relative z-10 w-20 flex flex-col items-center justify-start pt-2`}>
                                <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-navy-950 shadow-xl transition-all group-hover:scale-150 ${assignment.overallProgress === 100 ? 'bg-emerald-500' :
                                        isOverdue ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                                            'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                    }`} />
                                <div className="mt-4 text-[10px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-blue-500 transition-colors">
                                    {deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Content Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => onSelect(assignment.id)}
                                className={`flex-1 p-8 rounded-[3rem] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 ${isOverdue ? 'bg-red-500/5 border-red-500/20' :
                                        'bg-white dark:bg-navy-800 border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl'
                                    }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                                            {assignment.course}
                                        </span>
                                        {isOverdue && (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse">
                                                Overdue System Warning
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase group-hover:text-blue-500 transition-colors">
                                        {assignment.title}
                                    </h4>
                                    <p className="text-sm font-medium text-gray-400 mentor-text italic opacity-80">
                                        {assignment.learningOutcome}
                                    </p>
                                </div>

                                <div className="flex items-center gap-8 shrink-0">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Structural Completion</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-32 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${assignment.overallProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                                        }`}
                                                    style={{ width: `${assignment.overallProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-xl font-black text-gray-900 dark:text-white tabular-nums">{assignment.overallProgress}%</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}

                {sortedAssignments.length === 0 && (
                    <div className="py-24 text-center flex flex-col items-center justify-center opacity-20">
                        <Calendar size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.5em]">Temporal Void</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineView;
