import React from 'react';
import { Assignment } from '../../types';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';

interface CourseGroupProps {
    courseName: string;
    assignments: Assignment[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    index: number;
}

const CourseGroup: React.FC<CourseGroupProps> = ({
    courseName,
    assignments,
    onSelect,
    onDelete,
    index
}) => {
    const totalProgress = Math.round(
        assignments.reduce((sum, a) => sum + a.overallProgress, 0) / assignments.length
    );
    const atRiskCount = assignments.filter(a => a.atRisk).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="space-y-6 pt-4"
        >
            {/* Minimalist Course Header */}
            <div className="flex items-end justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {courseName}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>{assignments.length} Projects</span>
                        <span>·</span>
                        <span className="text-blue-500">{totalProgress}% Average</span>
                        {atRiskCount > 0 && (
                            <>
                                <span>·</span>
                                <span className="text-red-500">{atRiskCount} at risk</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:block w-24 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalProgress}%` }}
                            transition={{ delay: 0.3 + (index * 0.1), duration: 0.8 }}
                            className={`h-full rounded-full ${totalProgress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">
                        {totalProgress}%
                    </span>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment, idx) => (
                    <ProjectCard
                        key={assignment.id}
                        assignment={assignment}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        index={idx}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default CourseGroup;
