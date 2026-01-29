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
        <div className="min-h-screen pb-20 sm:pb-32 space-y-8 sm:space-y-16">
            {/* Greeting Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 py-4 sm:py-8"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                        <Quote size={16} className="opacity-70 shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em]">Academic Intelligence OS</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-tight sm:leading-none">
                        {greeting}
                    </h1>
                </div>

                {/* View Switcher - Scrollable on Mobile */}
                <div className="overflow-x-auto pb-4 sm:pb-0 scrollbar-hide">
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl sm:rounded-[2rem] border border-gray-200/50 dark:border-white/5 shadow-inner w-max min-w-full sm:min-w-0">
                        {[
                            { id: 'grid', icon: LayoutGrid, label: 'Grid' },
                            { id: 'table', icon: LayoutList, label: 'Index' },
                            { id: 'board', icon: Kanban, label: 'Clusters' },
                            { id: 'timeline', icon: GanttChart, label: 'Temporal' },
                            { id: 'gallery', icon: Monitor, label: 'Gallery' },
                            { id: 'stats', icon: PieChart, label: 'Insights' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setView(btn.id as any)}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === btn.id ? 'bg-white dark:bg-navy-700 shadow-lg text-blue-600 dark:text-blue-400 scale-[1.02]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                <btn.icon size={14} className="sm:w-4 sm:h-4" /> 
                                <span className={view === btn.id ? 'block' : 'hidden sm:block'}>{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.header>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search academic assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 sm:pl-14 pr-6 py-4 sm:py-5 bg-white dark:bg-navy-900/50 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-[2.5rem] text-sm font-medium focus:border-blue-500 outline-none transition-all shadow-sm text-t-primary placeholder:text-gray-400"
                    />
                </div>

                <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
                    <div className="flex-1 md:w-48 relative">
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="w-full pl-4 sm:pl-6 pr-8 sm:pr-10 py-4 sm:py-5 bg-white dark:bg-navy-900/50 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer text-t-secondary"
                        >
                            <option value="all">All Disciplines</option>
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="flex-1 md:w-48 relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-4 sm:pl-6 pr-8 sm:pr-10 py-4 sm:py-5 bg-white dark:bg-navy-900/50 border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer text-t-secondary"
                        >
                            <option value="all">Every Status</option>
                            <option value="mastered">Mastered</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="todo">Not Started</option>
                            <option value="risk">At Risk</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Productivity Insights */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6"
            >
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 sm:p-8 bg-blue-500/5 rounded-2xl sm:rounded-[2.5rem] border border-blue-500/10 flex flex-col justify-between group hover:bg-blue-500/10 transition-all">
                        <div className="flex items-center justify-between">
                            <Activity size={18} className="text-blue-600 dark:text-blue-500" />
                            <span className="text-[9px] sm:text-[10px] font-black text-blue-600/50 dark:text-blue-500/40 uppercase tracking-widest">Pulse</span>
                        </div>
                        <div className="mt-4 sm:mt-6">
                            <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tabular-nums">{totalProjects}</span>
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Total Assets</p>
                        </div>
                    </div>
                    <div className="p-5 sm:p-8 bg-emerald-500/5 rounded-2xl sm:rounded-[2.5rem] border border-emerald-500/10 flex flex-col justify-between group hover:bg-emerald-500/10 transition-all">
                        <div className="flex items-center justify-between">
                            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-500" />
                            <span className="text-[9px] sm:text-[10px] font-black text-emerald-600/50 dark:text-emerald-500/40 uppercase tracking-widest">Mastered</span>
                        </div>
                        <div className="mt-4 sm:mt-6">
                            <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tabular-nums">{completedProjects}</span>
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Verified</p>
                        </div>
                    </div>
                    <div className="p-5 sm:p-8 bg-blue-600 rounded-2xl sm:rounded-[2.5rem] border border-blue-500/10 flex flex-col justify-between shadow-xl sm:shadow-2xl shadow-blue-500/20 group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between">
                            <TrendingUp size={18} className="text-white" />
                            <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Velocity</span>
                        </div>
                        <div className="mt-4 sm:mt-6">
                            <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">{learningVelocity}%</span>
                            <p className="text-[9px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">Throughput</p>
                        </div>
                    </div>
                    <div className="p-5 sm:p-8 bg-gray-900 dark:bg-navy-900 rounded-2xl sm:rounded-[2.5rem] border border-white/5 flex flex-col justify-between group hover:bg-gray-800 dark:hover:bg-navy-800 transition-all">
                        <div className="flex items-center justify-between">
                            <BrainCircuit size={18} className="text-blue-400" />
                            <span className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest">Load</span>
                        </div>
                        <div className="mt-4 sm:mt-6">
                            <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">{cognitiveLoad}</span>
                            <p className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Parallel</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 p-6 sm:p-8 bg-gray-50 dark:bg-white/[0.02] rounded-2xl sm:rounded-[2.5rem] border border-gray-200 dark:border-white/5 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <Quote size={20} className="text-blue-600 dark:text-blue-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Mastery Quote</h4>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight italic opacity-90">
                        "Education is not the learning of facts, but the training of the mind to think."
                    </p>
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mt-4">— Albert Einstein</p>
                </div>
            </motion.section>

            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    {view === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredAssignments.map((assignment, index) => (
                                <ProjectCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    onSelect={onSelect}
                                    onDelete={onDelete}
                                    index={index}
                                />
                            ))}
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 bg-white/50 dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5 hover:border-blue-500 group transition-all flex flex-col items-center justify-center text-center space-y-4 min-h-[250px]"
                            >
                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-xl">
                                    <Plus size={32} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">New Project</h3>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">Expand Horizon</p>
                                </div>
                            </motion.button>
                        </div>
                    )}

                    {view === 'table' && <TableView assignments={filteredAssignments} onSelect={onSelect} />}
                    {view === 'board' && <BoardView assignments={filteredAssignments} onSelect={onSelect} />}
                    {view === 'timeline' && <TimelineView assignments={filteredAssignments} onSelect={onSelect} />}
                    {view === 'gallery' && <GalleryView assignments={filteredAssignments} onSelect={onSelect} />}
                    {view === 'stats' && <StatsInsights assignments={assignments} />}
                </motion.div>
            </AnimatePresence>

            {/* Learn Section */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-2 text-t-tertiary text-sm mb-4">
                    <BookOpen size={14} />
                    <span className="font-medium">Learn</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {learningResources.map((resource, index) => (
                        <motion.div
                            key={resource.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="group p-4 bg-secondary rounded-xl border border-soft hover:border-medium transition-all cursor-pointer"
                        >
                            <div className="aspect-video bg-tertiary rounded-lg mb-4 flex items-center justify-center">
                                {resource.icon}
                            </div>
                            <h3 className="font-medium text-t-primary text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {resource.title}
                            </h3>
                            <p className="text-xs text-t-tertiary line-clamp-2 mb-2">{resource.description}</p>
                            <div className="flex items-center gap-1 text-xs text-t-muted">
                                <Clock size={12} />
                                <span>{resource.readTime}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Empty State */}
            {assignments.length === 0 && (
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                >
                    <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-soft">
                        <Plus size={32} className="text-t-muted" />
                    </div>
                    <h2 className="text-2xl font-bold text-t-primary mb-2">No projects yet</h2>
                    <p className="text-t-secondary mb-8 max-w-md mx-auto">
                        Upload your first assignment and let KALA help you break it down into
                        manageable milestones with AI-powered guidance.
                    </p>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Upload your first project
                    </button>
                </motion.section>
            )}
        </div>
    );
};

export default Dashboard;
