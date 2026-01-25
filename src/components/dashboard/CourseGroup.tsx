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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-soft">
                        <FolderOpen size={18} className="text-t-secondary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-t-primary">
                            {courseName}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-t-tertiary">
                            <span>{assignments.length} project{assignments.length !== 1 ? 's' : ''}</span>
                            <span>·</span>
                            <span>{totalProgress}% complete</span>
                            {atRiskCount > 0 && (
                                <>
                                    <span>·</span>
                                    <span className="text-red-500 font-medium">
                                        {atRiskCount} at risk
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 bg-tertiary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalProgress}%` }}
                            transition={{ delay: 0.3 + (index * 0.1), duration: 0.8 }}
                            className={`h-full rounded-full ${totalProgress === 100
                                    ? 'bg-green-500'
                                    : atRiskCount > 0
                                        ? 'bg-orange-500'
                                        : 'bg-blue-500'
                                }`}
                        />
                    </div>
                    <span className="text-sm font-bold text-t-primary w-10 text-right">
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
