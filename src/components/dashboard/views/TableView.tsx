import React from 'react';
import { Assignment } from '../../../types';
import { motion } from 'framer-motion';
import { ArrowUpDown, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TableViewProps {
    assignments: Assignment[];
    onSelect: (id: string) => void;
}

const TableView: React.FC<TableViewProps> = ({ assignments, onSelect }) => {
    return (
        <div className="bg-white dark:bg-navy-900/50 rounded-[3rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                                Project Identity <ArrowUpDown size={12} />
                            </div>
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Course</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Progress</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Timeline</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {assignments.map((assignment) => (
                        <motion.tr
                            key={assignment.id}
                            onClick={() => onSelect(assignment.id)}
                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
                            className="group cursor-pointer transition-colors"
                        >
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{assignment.title}</p>
                                        <p className="text-[10px] font-medium text-gray-400 line-clamp-1">{assignment.learningOutcome || 'No outcome defined'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                    {assignment.course}
                                </span>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3 min-w-[120px]">
                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${assignment.overallProgress}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{assignment.overallProgress}%</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                    {new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </td>
                            <td className="px-8 py-6">
                                {assignment.overallProgress === 100 ? (
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                                        <CheckCircle2 size={14} /> Mastered
                                    </div>
                                ) : assignment.atRisk ? (
                                    <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-widest">
                                        <AlertCircle size={14} /> Alert
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> In Progress
                                    </div>
                                )}
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
            {assignments.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center opacity-20">
                    <ArrowUpDown size={32} className="mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Data Stream Empty</p>
                </div>
            )}
        </div>
    );
};

export default TableView;
