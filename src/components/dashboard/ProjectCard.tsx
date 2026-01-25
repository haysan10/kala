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
            className={`group relative bg-secondary rounded-xl border transition-all cursor-pointer p-5 hover:shadow-lg ${atRisk
                ? 'border-red-500/30 hover:border-red-500/50'
                : 'border-soft hover:border-medium'
                }`}
            style={!atRisk ? { borderLeft: `4px solid ${courseColor || '#3B82F6'}` } : {}}
        >
            {/* Risk indicator */}
            {atRisk && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                        <AlertCircle size={12} className="text-red-500" />
                        <span className="text-[10px] font-bold text-red-500 uppercase">At Risk</span>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between pr-20">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-t-tertiary">
                                {course}
                            </span>
                            {overallProgress === 100 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                                    <Sparkles size={10} className="text-green-600 dark:text-green-400" />
                                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Done</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-sm font-bold text-t-primary leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-xs text-t-tertiary line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-t-muted">
                    {daysUntil !== null && (
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span className={`${daysUntil < 0 ? 'text-red-500 font-bold' : daysUntil <= 2 ? 'text-orange-500 font-medium' : ''}`}>
                                {daysUntil < 0
                                    ? 'Overdue'
                                    : daysUntil === 0
                                        ? 'Due today'
                                        : daysUntil === 1
                                            ? 'Due tomorrow'
                                            : `${daysUntil}d left`
                                }
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <div className="h-1.5 bg-tertiary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ delay: 0.2 + (index * 0.05), duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${atRisk
                                ? 'bg-red-500'
                                : overallProgress === 100
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                                }`}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-t-muted">{overallProgress}% complete</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50/10 text-t-muted hover:text-red-500 transition-all"
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
