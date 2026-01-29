import React, { useState, useEffect } from 'react';
import { Assignment } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    BookOpen,
    Calendar,
    ChevronRight,
    Plus,
    FileText,
    Sparkles,
    Brain,
    Target,
    TrendingUp,
    AlertCircle,
    Layers,
    FolderOpen,
    LayoutGrid,
    LayoutList,
    Kanban,
    GanttChart,
    BarChart3,
    Activity,
    BrainCircuit,
    Quote,
    CheckCircle2
} from 'lucide-react';
import BoardView from './views/BoardView';
import TableView from './views/TableView';
import TimelineView from './views/TimelineView';
import GalleryView from './views/GalleryView';
import StatsInsights from './views/StatsInsights';
import ProjectCard from './ProjectCard';
import { Filter, Search, X as XIcon, ChevronDown, Monitor, PieChart } from 'lucide-react';

interface DashboardProps {
    assignments: Assignment[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onSynapseComplete: (assignmentId: string, response: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    assignments,
    onSelect,
    onDelete,
    onSynapseComplete
}) => {
    const [greeting, setGreeting] = useState('');
    const [view, setView] = useState<'grid' | 'table' | 'board' | 'timeline' | 'gallery' | 'stats'>('grid');
    const [statsVisible, setStatsVisible] = useState(true);

    // Filtering & Sorting State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Get unique courses for filter
    const courses = Array.from(new Set(assignments.map(a => a.course)));

    // Apply filtering logic
    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.course.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = filterCourse === 'all' || a.course === filterCourse;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'mastered' && a.overallProgress === 100) ||
            (filterStatus === 'ongoing' && a.overallProgress < 100 && a.overallProgress > 0) ||
            (filterStatus === 'todo' && a.overallProgress === 0) ||
            (filterStatus === 'risk' && a.atRisk);

        return matchesSearch && matchesCourse && matchesStatus;
    });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    // Get recent assignments (last 4)
    const recentAssignments = [...assignments]
        .sort((a, b) => {
            const dateA = new Date((a as any).updatedAt || (a as any).createdAt).getTime();
            const dateB = new Date((b as any).updatedAt || (b as any).createdAt).getTime();
            return dateB - dateA;
        })
        .slice(0, 4);

    // Get upcoming deadlines (next 7 days)
    const now = new Date();
    const upcomingDeadlines = assignments
        .filter(a => {
            const deadline = new Date(a.deadline);
            const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        })
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 3);

    // At risk assignments
    const atRiskAssignments = assignments.filter(a => a.atRisk).slice(0, 2);

    // Calculate stats
    const totalProjects = assignments.length;
    const completedProjects = assignments.filter(a => a.overallProgress === 100).length;

    // Calculate Velocity (Average progress per total weight)
    const learningVelocity = totalProjects > 0
        ? Math.round((assignments.reduce((sum, a) => sum + a.overallProgress, 0) / (totalProjects * 100)) * 100)
        : 0;

    const cognitiveLoad = assignments.filter(a => a.overallProgress > 0 && a.overallProgress < 100).length;

    const learningResources = [
        {
            title: 'Getting started with KALA',
            description: 'Learn the basics of managing your academic projects',
            readTime: '5 min read',
            icon: <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
        },
        {
            title: 'Using the AI Tutor effectively',
            description: 'Tips for getting the most out of Socratic questioning',
            readTime: '8 min read',
            icon: <Brain size={24} className="text-blue-600 dark:text-blue-400" />
        },
        {
            title: 'Mastering milestones',
            description: 'Break down complex assignments into manageable steps',
            readTime: '6 min read',
            icon: <Target size={24} className="text-green-600 dark:text-green-400" />
        },
        {
            title: 'Smart study scheduling',
            description: 'Optimize your study sessions for maximum retention',
            readTime: '4 min read',
            icon: <Calendar size={24} className="text-orange-600 dark:text-orange-400" />
        }
    ];

    return (
        <div className="min-h-screen pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6">
            {/* Minimalist Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-12 pb-6"
            >
                <div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Library</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        {greeting}
                    </h1>
                </div>

                {/* Compact View Switcher */}
                <div className="flex bg-gray-50 dark:bg-white/[0.03] p-1 rounded-xl border border-gray-100 dark:border-white/5">
                    {[
                        { id: 'grid', icon: LayoutGrid },
                        { id: 'table', icon: LayoutList },
                        { id: 'board', icon: Kanban },
                        { id: 'stats', icon: BarChart3 }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setView(btn.id as any)}
                            className={`p-2.5 rounded-lg transition-all ${view === btn.id ? 'bg-white dark:bg-navy-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                            title={btn.id}
                        >
                            <btn.icon size={18} />
                        </button>
                    ))}
                </div>
            </motion.header>

            {/* Minimalist Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:bg-white dark:focus:bg-navy-900 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3.5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl text-xs font-semibold outline-none cursor-pointer appearance-none min-w-[140px]"
                    >
                        <option value="all">Status</option>
                        <option value="ongoing">Active</option>
                        <option value="mastered">Mastered</option>
                        <option value="risk">At Risk</option>
                    </select>
                </div>
            </div>

            {/* Subtle Metrics Row */}
            <div className="flex flex-wrap gap-8 py-2 border-y border-gray-100 dark:border-white/5">
                {[
                    { label: 'Total Assets', value: totalProjects, icon: Layers },
                    { label: 'Mastered', value: completedProjects, icon: CheckCircle2 },
                    { label: 'Velocity', value: `${learningVelocity}%`, icon: TrendingUp },
                    { label: 'Load', value: cognitiveLoad, icon: BrainCircuit }
                ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <stat.icon size={14} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{stat.value}</span>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {view === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAssignments.map((assignment, index) => (
                                <ProjectCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    onSelect={onSelect}
                                    onDelete={onDelete}
                                    index={index}
                                />
                            ))}
                            <button
                                className="group p-8 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500 hover:bg-blue-50/10 dark:hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]"
                            >
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <Plus size={24} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 uppercase tracking-widest">New Project</span>
                            </button>
                        </div>
                    )}

                    {view === 'table' && <TableView assignments={filteredAssignments} onSelect={onSelect} />}
                    {view === 'board' && <BoardView assignments={filteredAssignments} onSelect={onSelect} />}
                    {view === 'stats' && <StatsInsights assignments={assignments} />}
                </motion.div>
            </AnimatePresence>

            {/* Empty State */}
            {assignments.length === 0 && (
                <div className="text-center py-32 space-y-6">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border border-gray-100 dark:border-white/5">
                        <FolderOpen size={24} className="text-gray-300" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Your vault is empty</h2>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto">
                            Upload your first assignment to begin your cognitive journey.
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                        Add Assignment
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
