import React from 'react';
import { Assignment } from '../../types';
import { motion } from 'framer-motion';
import { Folder, FolderOpen } from 'lucide-react';
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="space-y-4"
        >
            {/* Course Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-soft shadow-sm">
                        <FolderOpen size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-t-primary uppercase tracking-tight">
                            {courseName}
                        </h2>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-t-secondary">
                            <span className="bg-tertiary/50 px-2 py-0.5 rounded uppercase tracking-wider">{assignments.length} project{assignments.length !== 1 ? 's' : ''}</span>
                            <span>·</span>
                            <span className="text-blue-600 dark:text-blue-400">{totalProgress}% avg. complete</span>
                            {atRiskCount > 0 && (
                                <>
                                    <span>·</span>
                                    <span className="text-red-500 font-black uppercase tracking-wider">
                                        {atRiskCount} at risk
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="hidden sm:block w-32 h-1.5 bg-tertiary rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalProgress}%` }}
                            transition={{ delay: 0.3 + (index * 0.1), duration: 0.8 }}
                            className={`h-full rounded-full ${totalProgress === 100
                                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                    : atRiskCount > 0
                                        ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                                        : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                                }`}
                        />
                    </div>
                    <span className="text-sm font-black text-t-primary w-10 text-right sm:text-left">
                        {totalProgress}%
                    </span>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
