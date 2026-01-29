import React from 'react';
import { Assignment } from '../../types';
import { motion } from 'framer-motion';
import { Clock, Trash2, AlertCircle } from 'lucide-react';

interface ProjectCardProps {
    assignment: Assignment;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ assignment, onSelect, onDelete, index }) => {
    const { id, title, course = 'General', overallProgress = 0, atRisk, deadline, courseColor } = assignment;

    // Calculate days until deadline
    const daysUntil = deadline ? Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            onClick={() => onSelect(id)}
            className={`group relative bg-white dark:bg-navy-900/40 rounded-3xl border border-gray-100 dark:border-white/5 transition-all cursor-pointer p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 overflow-hidden`}
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: courseColor || '#3B82F6' }}
                            />
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest truncate">
                                {course}
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {title}
                        </h3>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 hover:text-red-500 transition-all active:scale-95"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                {/* Info & Progress */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Clock size={12} className="opacity-50" />
                            <span className={daysUntil !== null && daysUntil <= 2 ? 'text-orange-500' : ''}>
                                {daysUntil === null 
                                    ? 'No deadline' 
                                    : daysUntil < 0 
                                        ? 'Overdue' 
                                        : daysUntil === 0 
                                            ? 'Today' 
                                            : daysUntil === 1 
                                                ? 'Tomorrow' 
                                                : `${daysUntil}d left`
                                }
                            </span>
                        </div>
                        <span className="text-gray-900 dark:text-white tabular-nums">{overallProgress}%</span>
                    </div>

                    <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ delay: 0.2 + (index * 0.05), duration: 0.8, ease: 'circOut' }}
                            className={`h-full rounded-full ${
                                atRisk ? 'bg-red-500' : overallProgress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                        />
                    </div>
                </div>
            </div>

            {/* Subtle Risk Indicator */}
            {atRisk && (
                <div className="absolute top-4 right-4 animate-pulse">
                    <AlertCircle size={14} className="text-red-500" />
                </div>
            )}
        </motion.div>
    );
};

export default ProjectCard;
