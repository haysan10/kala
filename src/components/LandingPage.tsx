import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Brain,
    Calendar,
    Upload,
    MessageCircle,
    BarChart3,
    Sparkles,
    CheckCircle2,
    Star,
    Zap,
    BookOpen,
    Target,
    ChevronRight,
    Play,
    Sun,
    Moon,
    Menu,
    X,
    FileText,
    Clock,
    Users,
    Layers,
    FolderOpen,
    Settings,
    TrendingUp,
    AlertCircle,
    Send,
    Lightbulb
} from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
    toggleDarkMode: () => void;
    isDarkMode: boolean;
}

// Dashboard Mockup - Shows the main dashboard view
const DashboardMockup: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    return (
        <div className="relative bg-secondary rounded-2xl border border-soft shadow-2xl overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-tertiary border-b border-soft">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 bg-primary rounded text-[10px] text-t-tertiary font-medium">
                        app.kala.ai/dashboard
                    </div>
                </div>
            </div>

            {/* App Content */}
            <div className="flex min-h-[340px]">
                {/* Sidebar */}
                <div className="w-44 bg-primary border-r border-soft p-4 hidden md:block">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 bg-t-primary rounded flex items-center justify-center">
                            <span className="text-primary text-[10px] font-bold">K</span>
                        </div>
                        <span className="text-xs font-bold text-t-primary">KALA Academic</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
                            <Layers size={14} />
                            Dashboard
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-t-secondary text-[11px]">
                            <FolderOpen size={14} />
                            Projects
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-t-secondary text-[11px]">
                            <Calendar size={14} />
                            Calendar
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-t-secondary text-[11px]">
                            <MessageCircle size={14} />
                            AI Tutor
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-5 bg-primary">
                    <div className="mb-4">
                        <p className="text-lg font-bold text-t-primary">Good afternoon, Alex</p>
                        <p className="text-xs text-t-tertiary">3 active projects, 2 deadlines this week</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 bg-tertiary rounded-lg border border-soft">
                            <p className="text-xl font-bold text-t-primary">3</p>
                            <p className="text-[10px] text-t-muted">Active</p>
                        </div>
                        <div className="p-3 bg-tertiary rounded-lg border border-soft">
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">85%</p>
                            <p className="text-[10px] text-t-muted">Avg Progress</p>
                        </div>
                        <div className="p-3 bg-tertiary rounded-lg border border-soft">
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">2</p>
                            <p className="text-[10px] text-t-muted">Due Soon</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-medium text-t-muted uppercase tracking-wider">Recent Projects</p>
                        {[
                            { title: 'Algorithm Analysis', progress: 75 },
                            { title: 'UX Research Paper', progress: 45 },
                        ].map((project, i) => (
                            <div key={i} className="p-3 bg-tertiary rounded-lg border border-soft">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-medium text-t-primary">{project.title}</span>
                                    <span className="text-[10px] text-t-muted">{project.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-primary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// AI Tutor Mockup - Shows the chat interface
const TutorMockup: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    return (
        <div className="relative bg-secondary rounded-2xl border border-soft shadow-2xl overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-tertiary border-b border-soft">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 bg-primary rounded text-[10px] text-t-tertiary font-medium">
                        app.kala.ai/tutor
                    </div>
                </div>
            </div>

            {/* Chat Content */}
            <div className="p-5 bg-primary min-h-[340px] flex flex-col">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-soft">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Brain size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-t-primary">KALA AI Tutor</p>
                        <p className="text-[10px] text-green-600 dark:text-green-400">Online</p>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    {/* AI Message */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                            <Brain size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="bg-tertiary rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                            <p className="text-xs text-t-primary leading-relaxed">
                                I see you're working on Algorithm Analysis. What specific concept would you like to explore deeper?
                            </p>
                        </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-3 justify-end">
                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                            <p className="text-xs leading-relaxed">
                                Can you explain the difference between O(n log n) and O(n²) complexity?
                            </p>
                        </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                            <Brain size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="bg-tertiary rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                            <p className="text-xs text-t-primary leading-relaxed">
                                Great question! Let me help you understand with a practical example...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="mt-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Ask anything about your assignment..."
                        className="flex-1 px-4 py-3 bg-tertiary border border-soft rounded-xl text-xs text-t-primary placeholder:text-t-muted"
                        readOnly
                    />
                    <button className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Calendar Mockup - Shows the calendar view
const CalendarMockup: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const events = [12, 18, 25, 28];

    return (
        <div className="relative bg-secondary rounded-2xl border border-soft shadow-2xl overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-tertiary border-b border-soft">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 bg-primary rounded text-[10px] text-t-tertiary font-medium">
                        app.kala.ai/calendar
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="p-5 bg-primary min-h-[340px]">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-lg font-bold text-t-primary">January 2026</p>
                    <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-tertiary"><ChevronRight size={14} className="rotate-180 text-t-muted" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-tertiary"><ChevronRight size={14} className="text-t-muted" /></button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {days.map((d, i) => (
                        <div key={i} className="text-center text-[10px] text-t-muted font-medium py-2">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => {
                        const day = i - 3;
                        const isValid = day > 0 && day <= 31;
                        const isToday = day === 25;
                        const hasEvent = events.includes(day);

                        return (
                            <div
                                key={i}
                                className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-colors
                                    ${!isValid ? 'text-t-muted/30' : ''}
                                    ${isToday ? 'bg-blue-600 text-white font-bold' : ''}
                                    ${hasEvent && !isToday ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''}
                                    ${isValid && !isToday && !hasEvent ? 'text-t-secondary hover:bg-tertiary' : ''}
                                `}
                            >
                                {isValid ? day : ''}
                            </div>
                        );
                    })}
                </div>

                {/* Upcoming Events */}
                <div className="mt-4 pt-4 border-t border-soft space-y-2">
                    <p className="text-[10px] font-medium text-t-muted uppercase tracking-wider">Upcoming</p>
                    <div className="flex items-center gap-2 p-2 bg-tertiary rounded-lg">
                        <div className="w-1.5 h-6 rounded-full bg-blue-500" />
                        <div>
                            <p className="text-xs font-medium text-t-primary">Algorithm Final</p>
                            <p className="text-[10px] text-t-muted">Jan 25, 2:00 PM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-tertiary rounded-lg">
                        <div className="w-1.5 h-6 rounded-full bg-green-500" />
                        <div>
                            <p className="text-xs font-medium text-t-primary">UX Paper Draft Due</p>
                            <p className="text-[10px] text-t-muted">Jan 28, 11:59 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Upload Mockup - Shows the assignment upload interface
const UploadMockup: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    return (
        <div className="relative bg-secondary rounded-2xl border border-soft shadow-2xl overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-tertiary border-b border-soft">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 bg-primary rounded text-[10px] text-t-tertiary font-medium">
                        app.kala.ai/upload
                    </div>
                </div>
            </div>

            {/* Upload Content */}
            <div className="p-5 bg-primary min-h-[340px]">
                <div className="mb-6">
                    <p className="text-lg font-bold text-t-primary">New Assignment</p>
                    <p className="text-xs text-t-tertiary">Upload your assignment and let AI analyze it</p>
                </div>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-soft rounded-2xl p-8 text-center mb-4 hover:border-blue-500/50 transition-colors">
                    <div className="w-16 h-16 bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload size={28} className="text-t-muted" />
                    </div>
                    <p className="text-sm font-medium text-t-primary mb-1">Drop your file here</p>
                    <p className="text-xs text-t-muted">PDF, DOCX, or images up to 10MB</p>
                </div>

                {/* Or paste text */}
                <div className="space-y-2">
                    <p className="text-xs text-t-muted">Or paste assignment text</p>
                    <textarea
                        className="w-full h-20 p-3 bg-tertiary border border-soft rounded-xl text-xs text-t-primary placeholder:text-t-muted resize-none"
                        placeholder="Paste your assignment instructions here..."
                        readOnly
                    />
                </div>

                <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                    <Sparkles size={16} />
                    Analyze with AI
                </button>
            </div>
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart, toggleDarkMode, isDarkMode }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const features = [
        {
            icon: <Upload size={24} />,
            title: 'Smart Ingestion',
            description: 'Upload any assignment document and watch KALA extract key information, deadlines, and requirements automatically.',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            icon: <Brain size={24} />,
            title: 'AI-Powered Learning',
            description: 'Get personalized guidance through our Socratic tutor that helps you understand, not just complete.',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            icon: <Calendar size={24} />,
            title: 'Intelligent Planning',
            description: 'Auto-generated milestones and smart scheduling that adapts to your pace and energy levels.',
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            icon: <BarChart3 size={24} />,
            title: 'Progress Analytics',
            description: 'Track your academic journey with insights on clarity, momentum, and areas for improvement.',
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-500/10'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Active Students' },
        { value: '50K+', label: 'Projects Managed' },
        { value: '95%', label: 'Completion Rate' },
        { value: '4.9', label: 'User Rating' }
    ];

    const testimonials = [
        {
            quote: "KALA transformed how I approach complex assignments. The AI tutor genuinely helps me understand the material.",
            author: "Sarah Chen",
            role: "Computer Science, Stanford",
            initial: "S"
        },
        {
            quote: "Finally, an app that doesn't just track tasks but actually helps me learn. The milestone generation is incredible.",
            author: "Marcus Rodriguez",
            role: "Engineering, MIT",
            initial: "M"
        },
        {
            quote: "The Socratic questioning method has significantly improved my critical thinking skills.",
            author: "Aisha Patel",
            role: "Medicine, Harvard",
            initial: "A"
        }
    ];

    return (
        <div className="min-h-screen bg-primary text-t-primary transition-colors duration-500">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-soft transition-colors">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-t-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary font-black text-sm">K</span>
                            </div>
                            <span className="font-bold text-t-primary">KALA</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm text-t-secondary hover:text-t-primary transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm text-t-secondary hover:text-t-primary transition-colors">How it works</a>
                            <a href="#testimonials" className="text-sm text-t-secondary hover:text-t-primary transition-colors">Testimonials</a>
                            <a href="#pricing" className="text-sm text-t-secondary hover:text-t-primary transition-colors">Pricing</a>
                        </div>

                        {/* Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 text-t-secondary hover:text-t-primary transition-colors"
                            >
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button
                                onClick={onStart}
                                className="px-4 py-2 text-sm font-medium text-t-secondary hover:text-t-primary transition-colors"
                            >
                                Log in
                            </button>
                            <button
                                onClick={onStart}
                                className="px-4 py-2 bg-t-primary text-primary text-sm font-medium rounded-lg hover:opacity-90 transition-all"
                            >
                                Get KALA free
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-t-secondary"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-soft bg-primary"
                        >
                            <div className="px-6 py-4 space-y-4">
                                <a href="#features" className="block text-sm text-t-secondary hover:text-t-primary">Features</a>
                                <a href="#how-it-works" className="block text-sm text-t-secondary hover:text-t-primary">How it works</a>
                                <a href="#testimonials" className="block text-sm text-t-secondary hover:text-t-primary">Testimonials</a>
                                <button onClick={onStart} className="w-full py-3 bg-t-primary text-primary rounded-lg font-medium">
                                    Get started
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section with Dashboard Mockup */}
            <section className="pt-32 pb-20 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-600 dark:text-blue-400 mb-8"
                        >
                            <Sparkles size={14} />
                            <span className="font-medium">Powered by AI</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight text-t-primary mb-6"
                        >
                            One workspace.
                            <br />
                            <span className="text-t-tertiary">Zero busywork.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-t-secondary max-w-2xl mx-auto mb-10"
                        >
                            KALA is your intelligent academic companion. Upload assignments, get AI-powered guidance,
                            and track your learning journey — all in one beautiful workspace.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <button
                                onClick={onStart}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-medium text-base hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                            >
                                Get KALA free
                                <ArrowRight size={18} />
                            </button>
                            <button className="px-8 py-4 bg-secondary border border-soft rounded-xl font-medium text-base text-t-primary hover:bg-tertiary transition-colors flex items-center justify-center gap-2">
                                <Play size={18} />
                                Watch demo
                            </button>
                        </motion.div>
                    </div>

                    {/* Dashboard Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="relative max-w-4xl mx-auto"
                    >
                        <DashboardMockup isDarkMode={isDarkMode} />
                    </motion.div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-16 border-y border-soft bg-secondary/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <p className="text-center text-sm text-t-tertiary mb-8">Trusted by students at leading universities</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        {['Stanford', 'MIT', 'Harvard', 'Berkeley', 'Princeton'].map((uni) => (
                            <span key={uni} className="text-xl font-bold text-t-muted">{uni}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-t-primary mb-6">
                            Everything you need to succeed
                        </h2>
                        <p className="text-xl text-t-secondary">
                            KALA combines intelligent document processing, AI tutoring, and progress tracking
                            into one seamless academic workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 bg-secondary rounded-2xl border border-soft hover:border-medium transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 ${feature.color}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-t-primary mb-3">{feature.title}</h3>
                                <p className="text-t-secondary leading-relaxed">{feature.description}</p>
                                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Learn more <ChevronRight size={16} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Tutor Section with Mockup */}
            <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-secondary/30 border-y border-soft">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full text-xs text-blue-600 dark:text-blue-400 mb-4">
                                <Brain size={14} />
                                <span className="font-medium">AI-Powered</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-t-primary mb-6">
                                Learn with a personal AI tutor
                            </h2>
                            <p className="text-lg text-t-secondary mb-8">
                                Our Socratic AI tutor doesn't just give you answers — it helps you think through problems,
                                ask better questions, and develop deeper understanding of the material.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Personalized explanations based on your learning style',
                                    'Probing questions that develop critical thinking',
                                    'Context-aware help for your specific assignments'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                        <span className="text-t-secondary">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <TutorMockup isDarkMode={isDarkMode} />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Calendar Section with Mockup */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <CalendarMockup isDarkMode={isDarkMode} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full text-xs text-green-600 dark:text-green-400 mb-4">
                                <Calendar size={14} />
                                <span className="font-medium">Smart Scheduling</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-t-primary mb-6">
                                Never miss a deadline again
                            </h2>
                            <p className="text-lg text-t-secondary mb-8">
                                KALA automatically extracts deadlines from your assignments and creates a smart schedule
                                that adapts to your pace and energy levels throughout the semester.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Auto-generated milestones for every assignment',
                                    'Smart reminders based on your work patterns',
                                    'Visual timeline of all upcoming deadlines'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                        <span className="text-t-secondary">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Upload Section with Mockup */}
            <section className="py-24 px-6 lg:px-8 bg-secondary/30 border-y border-soft">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-full text-xs text-orange-600 dark:text-orange-400 mb-4">
                                <Upload size={14} />
                                <span className="font-medium">Smart Upload</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-t-primary mb-6">
                                Upload anything, we'll handle the rest
                            </h2>
                            <p className="text-lg text-t-secondary mb-8">
                                Just drop your assignment PDF, paste the instructions, or even upload a photo.
                                KALA's AI will analyze it and create a complete study plan with milestones.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Supports PDF, DOCX, and image files',
                                    'Automatically extracts requirements and rubrics',
                                    'Creates intelligent milestone breakdown'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                                        <span className="text-t-secondary">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <UploadMockup isDarkMode={isDarkMode} />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-t-primary mb-6">
                            More productivity.
                            <br />
                            <span className="text-t-tertiary">Fewer tools.</span>
                        </h2>
                        <p className="text-xl text-t-secondary">
                            Join thousands of students who've transformed their academic workflow with KALA.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold text-t-primary mb-2">{stat.value}</div>
                                <div className="text-sm text-t-tertiary">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-6 lg:px-8 bg-secondary/30 border-y border-soft">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-t-primary mb-6">
                            Loved by students
                        </h2>
                        <p className="text-xl text-t-secondary">
                            See what students are saying about their experience with KALA.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.author}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 bg-primary rounded-2xl border border-soft"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-t-primary mb-6 leading-relaxed">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.initial}
                                    </div>
                                    <div>
                                        <p className="font-medium text-t-primary">{testimonial.author}</p>
                                        <p className="text-sm text-t-tertiary">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-12 md:p-16 bg-blue-600 rounded-3xl"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Ready to transform your studies?
                        </h2>
                        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                            Join thousands of students who are already learning smarter with KALA. Get started for free.
                        </p>
                        <button
                            onClick={onStart}
                            className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors shadow-xl"
                        >
                            Get KALA free
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6 lg:px-8 border-t border-soft">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 bg-t-primary rounded-lg flex items-center justify-center">
                                    <span className="text-primary font-bold text-xs">K</span>
                                </div>
                                <span className="font-bold text-t-primary">KALA</span>
                            </div>
                            <p className="text-sm text-t-tertiary">
                                Your intelligent academic companion for smarter learning.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-t-primary mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Features</a></li>
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-t-primary mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">About</a></li>
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Blog</a></li>
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-t-primary mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Contact</a></li>
                                <li><a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-soft flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-t-muted">© 2024 KALA. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Terms</a>
                            <a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Privacy</a>
                            <a href="#" className="text-sm text-t-tertiary hover:text-t-primary transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
