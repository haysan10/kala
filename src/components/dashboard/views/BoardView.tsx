import React from 'react';
import { Assignment } from '../../../types';
import { motion } from 'framer-motion';
import { MoreVertical, Calendar, ChevronRight } from 'lucide-react';

interface BoardViewProps {
    assignments: Assignment[];
    onSelect: (id: string) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ assignments, onSelect }) => {
    const columns = [
        { id: 'todo', title: 'Initiating', status: 0 },
        { id: 'in_progress', title: 'Developing', status: 1 }, // progress > 0 and < 100
        { id: 'completed', title: 'Mastered', status: 100 },
    ];

    const getColumnAssignments = (colId: string) => {
        if (colId === 'todo') return assignments.filter(a => a.overallProgress === 0);
        if (colId === 'in_progress') return assignments.filter(a => a.overallProgress > 0 && a.overallProgress < 100);
        if (colId === 'completed') return assignments.filter(a => a.overallProgress === 100);
        return [];
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[600px]">
            {columns.map((column) => (
                <div key={column.id} className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${column.id === 'todo' ? 'bg-navy-400' :
                                    column.id === 'in_progress' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                                        'bg-emerald-500'
                                }`} />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                                {column.title}
                            </h3>
                            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                {getColumnAssignments(column.id).length}
                            </span>
                        </div>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors">
                            <MoreVertical size={14} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 p-2 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.02] border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all min-h-full">
                        {getColumnAssignments(column.id).map((assignment) => (
                            <motion.div
                                layoutId={assignment.id}
                                key={assignment.id}
                                onClick={() => onSelect(assignment.id)}
                                className="group p-6 bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">
                                        {assignment.course}
                                    </span>
                                    {assignment.atRisk && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-blue-500 transition-colors">
                                    {assignment.title}
                                </h4>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-medium text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} />
                                            {new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                        <span>{assignment.overallProgress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${assignment.overallProgress}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {getColumnAssignments(column.id).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <ChevronRight size={32} className="rotate-90 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Empty Space</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BoardView;
