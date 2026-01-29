import React from 'react';
import { Assignment } from '../../types';
import { motion } from 'framer-motion';
import { Clock, Trash2, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

interface ProjectCardProps {
    assignment: Assignment;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ assignment, onSelect, onDelete, index }) => {
    const { id, title, description, course, overallProgress, atRisk, deadline, courseColor } = assignment;

    // Calculate days until deadline
    const daysUntil = deadline ? Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            onClick={() => onSelect(id)}
            className={`group relative bg-secondary rounded-xl border transition-all cursor-pointer p-4 sm:p-5 hover:shadow-lg ${atRisk
                ? 'border-red-500/30 hover:border-red-500/50 bg-red-50/5 dark:bg-red-500/5'
                : 'border-soft hover:border-medium shadow-sm hover:shadow-md'
                }`}
            style={!atRisk ? { borderLeft: `3px solid ${courseColor || '#3B82F6'}` } : {}}
        >
            {/* Risk indicator */}
            {atRisk && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 bg-red-500 text-white rounded-lg shadow-lg shadow-red-500/20">
                        <AlertCircle size={10} className="sm:w-[12px] sm:h-[12px]" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">At Risk</span>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between pr-14 sm:pr-20">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-t-tertiary uppercase tracking-wider truncate">
                                {course}
                            </span>
                            {overallProgress === 100 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                                    <Sparkles size={10} className="text-green-600 dark:text-green-400" />
                                    <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase">Done</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-t-primary leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-xs text-t-secondary line-clamp-2 leading-relaxed opacity-80">
                        {description}
                    </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-[11px] font-medium text-t-muted">
                    {daysUntil !== null && (
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            <span className={`${daysUntil < 0 ? 'text-red-500 font-bold' : daysUntil <= 2 ? 'text-orange-500 font-bold' : ''}`}>
                                {daysUntil < 0
                                    ? 'Overdue'
                                    : daysUntil === 0
                                        ? 'Due Today'
                                        : daysUntil === 1
                                            ? 'Due Tomorrow'
                                            : `${daysUntil}d remaining`
                                }
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                    <div className="h-1.5 bg-tertiary/50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ delay: 0.2 + (index * 0.05), duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full transition-all duration-1000 ${atRisk
                                ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                : overallProgress === 100
                                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                    : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                                }`}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-t-muted uppercase tracking-wider">{overallProgress}% Complete</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-t-muted hover:text-red-500 transition-all active:scale-90"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectCard;
