import React from 'react';
import { Assignment } from '../../../types';
import { motion } from 'framer-motion';
import { MoreVertical, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';

interface GalleryViewProps {
    assignments: Assignment[];
    onSelect: (id: string) => void;
}

const GalleryView: React.FC<GalleryViewProps> = ({ assignments, onSelect }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignments.map((assignment, index) => {
                const isCompleted = assignment.overallProgress === 100;

                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelect(assignment.id)}
                        className="group relative bg-white dark:bg-navy-800 rounded-[3rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer"
                    >
                        {/* Status Overlay */}
                        <div className="absolute top-6 left-6 z-10 flex gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 px-3 py-1.5 rounded-full shadow-lg">
                                {assignment.course}
                            </span>
                            {isCompleted && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-white bg-emerald-500 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                    <Sparkles size={10} /> Mastered
                                </span>
                            )}
                            {assignment.atRisk && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-white bg-red-500 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                                    <AlertCircle size={10} /> Alert
                                </span>
                            )}
                        </div>

                        {/* Abstract Background/Cover Placeholder */}
                        <div className="aspect-[16/9] bg-gray-50 dark:bg-white/[0.02] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10 opacity-40" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                                <span className="text-[12rem] font-black tracking-tighter uppercase select-none">KALA</span>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white items-center gap-2 tracking-tight uppercase leading-[1.1] group-hover:text-blue-500 transition-colors">
                                    {assignment.title}
                                </h4>
                                <p className="text-sm font-medium text-gray-400 mentor-text italic opacity-80 line-clamp-2">
                                    {assignment.learningOutcome || "Synthesizing core academic parameters into structural drafs."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mastery Index</div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">{assignment.overallProgress}%</div>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${assignment.overallProgress}%` }}
                                        className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-navy-800 flex items-center justify-center text-[10px] font-bold">AI</div>
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-white dark:border-navy-800 flex items-center justify-center text-[10px] font-bold">DR</div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-500 transition-all">
                                    Open Workspace <ExternalLink size={12} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default GalleryView;
