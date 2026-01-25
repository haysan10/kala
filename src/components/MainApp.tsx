'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutDashboard, FileText, Plus, Settings as SettingsIcon, Bell, Search, UserCircle, Sun, Moon, Library, FolderOpen, Calendar as CalendarIcon, LogOut, X, AlertTriangle, MessageSquare, Clock, ChevronRight, User as UserIcon, Menu, BookOpen, Filter, ChevronDown, HardDrive } from 'lucide-react';
import { Assignment, Notification, AssignmentTemplate, User, Course } from '../types';
import Dashboard from './Dashboard';
import AssignmentView from './AssignmentView';
import UploadAssignment from './UploadAssignment';
import LandingPage from './LandingPage';
import CalendarView from './CalendarView';
import Auth from './Auth';
import Settings from './Settings';
import Profile from './Profile';
import CourseManager from './CourseManager';
import FileManager from './FileManager';
import DocumentationPage from './DocumentationPage';
import { ToastProvider } from './ui/Toast';
import { authService } from '../services/authService';
import { assignmentService } from '../services/assignmentService';
import { getCourses } from '../services/coursesApi';

const MainApp: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard' | 'assignment' | 'upload' | 'calendar' | 'settings' | 'profile' | 'courses' | 'files' | 'documentation'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<AssignmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Course filter state
  const [courses, setCourses] = useState<Course[]>([]);
  const [filterCourseId, setFilterCourseId] = useState<string | null>(null);
  const [showCourseFilter, setShowCourseFilter] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kala_dark_mode');
      if (saved !== null) return saved === 'true';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const handleAuth = async () => {
      // Check for OAuth callback with token
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        // OAuth error
        console.error('OAuth Error:', error);
        alert(`Authentication failed: ${error.replace(/_/g, ' ')}`);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        setView('auth');
        setLoading(false);
        return;
      }

      if (token) {
        // OAuth success - save token and redirect
        localStorage.setItem('kala_token', token);
        // Clean URL
        window.history.replaceState({}, '', '/');

        try {
          // Fetch user profile from backend
          const currentUser = await authService.getMe();
          setUser(currentUser);
          setView('dashboard');
        } catch (err) {
          console.error('Failed to fetch user after OAuth:', err);
          setView('auth');
        }
        setLoading(false);
        return;
      }

      // Normal auth check - restore session from localStorage
      if (authService.isAuthenticated()) {
        try {
          // Fetch fresh user data from backend to verify token is still valid
          const currentUser = await authService.getMe();
          setUser(currentUser);
          setView('dashboard');
        } catch (err) {
          // Token is invalid or expired - clear local storage and stay on landing
          console.error('Stored token is invalid or expired:', err);
          authService.logout();
          // Stay on landing page
        }
      }
      setLoading(false);
    };

    handleAuth();

    const savedNotifications = localStorage.getItem('kala_notifications');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    const savedTemplates = localStorage.getItem('kala_templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));

    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  useEffect(() => {
    if (user && view !== 'landing' && view !== 'auth') {
      fetchAssignments();
    }
  }, [user, view]);

  const fetchAssignments = async () => {
    try {
      const data = await assignmentService.getAll();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data.filter(c => !c.isArchived));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  useEffect(() => {
    if (user && view !== 'landing' && view !== 'auth') {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kala_notifications', JSON.stringify(notifications));
    localStorage.setItem('kala_templates', JSON.stringify(templates));
    localStorage.setItem('kala_dark_mode', String(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [notifications, templates, isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleUpdateAssignment = (updated: Assignment) => {
    setAssignments(assignments.map(a => a.id === updated.id ? updated : a));
  };

  const handleSynapseComplete = (assignmentId: string, response: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAssignments(assignments.map(a => {
      if (a.id === assignmentId) {
        return {
          ...a,
          clarityScore: (a.clarityScore || 0) + 15,
          lastSynapseDate: today
        };
      }
      return a;
    }));
  };

  const handleAuthSuccess = () => {
    setUser(authService.getCurrentUser());
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('landing');
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await assignmentService.delete(id);
        setAssignments(assignments.filter(a => a.id !== id));
        if (activeAssignmentId === id) setView('dashboard');
      } catch (error) {
        alert('Failed to delete assignment');
      }
    }
  };

  const handleSaveTemplate = (assignment: Assignment) => {
    const template: AssignmentTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${assignment.course} Structure`,
      course: assignment.course,
      tags: assignment.tags,
      rubrics: assignment.rubrics,
      learningOutcome: assignment.learningOutcome,
      diagnosticQuestions: assignment.diagnosticQuestions,
      milestones: assignment.milestones.map(m => ({ title: m.title, description: m.description, estimatedMinutes: m.estimatedMinutes }))
    };
    setTemplates(prev => [template, ...prev]);
  };

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resizable sidebar state (desktop only)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kala_sidebar_width');
      return saved ? parseInt(saved) : 260;
    }
    return 260;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const MIN_SIDEBAR_WIDTH = 200;
  const MAX_SIDEBAR_WIDTH = 400;

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = e.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
        localStorage.setItem('kala_sidebar_width', String(newWidth));
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResizing]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeAssignment = assignments.find(a => a.id === activeAssignmentId);

  // Filter assignments by course
  const filteredAssignments = filterCourseId
    ? assignments.filter(a => a.courseId === filterCourseId)
    : assignments;
  const filterCourse = courses.find(c => c.id === filterCourseId);

  // Close sidebar when navigating on mobile
  const handleNavigation = (newView: typeof view, assignmentId?: string) => {
    if (assignmentId) {
      setActiveAssignmentId(assignmentId);
    }
    setView(newView);
    setSidebarOpen(false);
  };

  if (view === 'landing') {
    return (
      <ToastProvider position="top-right">
        <LandingPage onStart={() => setView(user ? 'dashboard' : 'auth')} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      </ToastProvider>
    );
  }

  if (view === 'auth') {
    return (
      <ToastProvider position="top-right">
        <Auth onAuthSuccess={handleAuthSuccess} onBack={() => setView('landing')} />
      </ToastProvider>
    );
  }

  if (!user && view !== 'landing') {
    setView('auth');
    return null;
  }

  return (
    <ToastProvider position="top-right">
      <div className={`flex h-screen bg-primary overflow-hidden transition-colors duration-500 ${isResizing ? 'select-none' : ''}`}>
        {/* Mobile Overlay - Darker with blur */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : undefined }}
          className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-[300px]
          bg-white dark:bg-gray-900 lg:bg-primary
          border-r border-soft
          flex flex-col
          shadow-2xl lg:shadow-none
          transform lg:transform-none
          ${isResizing ? '' : 'transition-transform duration-300 ease-out'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        >
          {/* Sidebar Header */}
          <div className="p-5 lg:p-4 flex items-center justify-between border-b border-soft lg:border-none">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNavigation('landing')}>
              <div className="w-10 h-10 lg:w-7 lg:h-7 bg-blue-600 rounded-xl lg:rounded flex items-center justify-center shadow-lg shadow-blue-600/20 lg:shadow-none transition-all duration-500">
                <span className="text-white font-black text-sm lg:text-[10px]">K</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base lg:text-xs font-black uppercase tracking-tight text-t-primary transition-colors duration-500">KALA</span>
                <span className="text-xs lg:hidden text-t-muted font-medium">Academic Workspace</span>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-tertiary text-t-secondary hover:text-t-primary hover:bg-primary transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 lg:px-3 lg:py-2 space-y-1 overflow-y-auto">
            {/* Main Navigation Label for Mobile */}
            <div className="lg:hidden text-[10px] font-bold uppercase tracking-widest text-t-muted px-3 mb-3">Navigation</div>

            <SidebarItem icon={<Library size={20} />} label="Library" active={view === 'dashboard'} onClick={() => handleNavigation('dashboard')} collapsed={sidebarWidth < 220} />
            <SidebarItem icon={<BookOpen size={20} />} label="Courses" active={view === 'courses'} onClick={() => handleNavigation('courses')} collapsed={sidebarWidth < 220} />
            <SidebarItem icon={<HardDrive size={20} />} label="Files" active={view === 'files'} onClick={() => handleNavigation('files')} collapsed={sidebarWidth < 220} />
            <SidebarItem icon={<CalendarIcon size={20} />} label="Calendar" active={view === 'calendar'} onClick={() => handleNavigation('calendar')} collapsed={sidebarWidth < 220} />
            <SidebarItem icon={<Plus size={20} />} label="New Project" active={view === 'upload'} onClick={() => handleNavigation('upload')} collapsed={sidebarWidth < 220} />

            {/* Course Filter */}
            {courses.length > 0 && sidebarWidth >= 220 && (
              <div className="mt-4 px-2">
                <button
                  onClick={() => setShowCourseFilter(!showCourseFilter)}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium transition-all ${filterCourseId ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-t-muted hover:bg-tertiary'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Filter size={14} />
                    <span>{filterCourse ? filterCourse.name : 'Filter by Course'}</span>
                    {filterCourse && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: filterCourse.color }} />
                    )}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${showCourseFilter ? 'rotate-180' : ''}`} />
                </button>
                {showCourseFilter && (
                  <div className="mt-1 bg-secondary rounded-lg border border-soft overflow-hidden shadow-lg">
                    <button
                      onClick={() => { setFilterCourseId(null); setShowCourseFilter(false); }}
                      className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-tertiary ${!filterCourseId ? 'bg-tertiary text-t-primary' : 'text-t-secondary'
                        }`}
                    >
                      All Courses
                    </button>
                    {courses.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setFilterCourseId(c.id); setShowCourseFilter(false); }}
                        className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-tertiary flex items-center gap-2 ${filterCourseId === c.id ? 'bg-tertiary text-t-primary' : 'text-t-secondary'
                          }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filteredAssignments.length > 0 && (
              <>
                {sidebarWidth >= 220 && (
                  <div className="text-[10px] font-bold uppercase tracking-widest text-t-muted px-3 mt-6 mb-2">
                    Projects {filterCourse && <span className="text-blue-500">({filterCourse.name})</span>}
                  </div>
                )}
                <div className="space-y-1 mt-4 lg:mt-0">
                  {filteredAssignments.map(a => {
                    const projectCourse = courses.find(c => c.id === a.courseId);
                    return (
                      <SidebarItem
                        key={a.id}
                        icon={
                          <div className="relative">
                            <FolderOpen size={20} />
                            {projectCourse && (
                              <div
                                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-gray-900"
                                style={{ backgroundColor: projectCourse.color }}
                              />
                            )}
                          </div>
                        }
                        label={a.title}
                        active={view === 'assignment' && activeAssignmentId === a.id}
                        onClick={() => handleNavigation('assignment', a.id)}
                        collapsed={sidebarWidth < 220}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 lg:p-3 mt-auto border-t border-soft space-y-1">
            <SidebarItem icon={<UserIcon size={20} />} label="Profile" active={view === 'profile'} onClick={() => handleNavigation('profile')} collapsed={sidebarWidth < 220} />
            <SidebarItem icon={<SettingsIcon size={20} />} label="Settings" active={view === 'settings'} onClick={() => handleNavigation('settings')} collapsed={sidebarWidth < 220} />
            <SidebarItem icon={<BookOpen size={20} />} label="Documentation" active={view === 'documentation'} onClick={() => handleNavigation('documentation')} collapsed={sidebarWidth < 220} />
            <SidebarItem icon={isDarkMode ? <Sun size={20} /> : <Moon size={20} />} label={isDarkMode ? "Light mode" : "Dark mode"} onClick={toggleDarkMode} collapsed={sidebarWidth < 220} />
            <div className="pt-2 mt-2 border-t border-soft">
              <SidebarItem icon={<LogOut size={20} />} label="Logout" onClick={handleLogout} collapsed={sidebarWidth < 220} />
            </div>
          </div>

          {/* Resize Handle - Desktop only */}
          <div
            onMouseDown={startResizing}
            className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize group z-50"
          >
            <div className={`absolute inset-y-0 right-0 w-1 transition-all duration-150 ${isResizing ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-400/50'}`} />
            <div className={`absolute top-1/2 -translate-y-1/2 right-0 w-1 h-12 rounded-full transition-all duration-150 ${isResizing ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-transparent group-hover:bg-blue-500'}`} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-primary flex flex-col relative transition-colors duration-500 w-full">
          {/* Header */}
          <header className="h-14 lg:h-14 px-4 lg:px-8 flex items-center justify-between border-b border-soft sticky top-0 bg-primary/80 backdrop-blur-md z-30 transition-colors duration-500">
            {/* Left side - mobile menu + breadcrumb */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-t-secondary hover:text-t-primary transition-colors"
              >
                <Menu size={22} />
              </button>

              {/* Breadcrumb - hidden on very small screens */}
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-t-secondary">
                <span className="hover:text-t-primary cursor-pointer transition-colors" onClick={() => handleNavigation('dashboard')}>Library</span>
                <ChevronRight size={12} />
                <span className="text-t-primary truncate max-w-[150px] lg:max-w-[200px] transition-colors">
                  {view === 'dashboard' ? 'Overview' : view === 'upload' ? 'Ingestion' : view === 'calendar' ? 'Schedule' : view === 'settings' ? 'Settings' : view === 'profile' ? 'Profile' : view === 'courses' ? 'Courses' : view === 'files' ? 'Files' : view === 'documentation' ? 'Documentation' : activeAssignment?.title}
                </span>
              </div>

              {/* Mobile title */}
              <span className="sm:hidden text-sm font-bold text-t-primary truncate">
                {view === 'dashboard' ? 'Library' : view === 'upload' ? 'New Project' : view === 'calendar' ? 'Calendar' : view === 'settings' ? 'Settings' : view === 'profile' ? 'Profile' : view === 'courses' ? 'Courses' : view === 'files' ? 'Files' : view === 'documentation' ? 'Documentation' : activeAssignment?.title?.slice(0, 20)}
              </span>
            </div>

            {/* Right side - actions */}
            <div className="flex items-center gap-2 lg:gap-6">
              {/* Search - hidden on mobile */}
              <div className="hidden md:flex relative items-center bg-secondary rounded-full px-4 py-1.5 group transition-colors">
                <Search size={14} className="text-t-secondary" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none text-[11px] font-medium outline-none w-32 focus:w-48 transition-all px-2 text-t-primary placeholder:text-t-muted" />
              </div>

              {/* Search icon for mobile */}
              <button className="md:hidden p-2 text-t-secondary hover:text-t-primary transition-colors">
                <Search size={20} />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 lg:p-0 text-t-secondary hover:text-t-primary relative transition-colors">
                  <Bell size={20} className="lg:w-[18px] lg:h-[18px]" />
                  {unreadCount > 0 && <span className="absolute top-1 lg:top-0 right-1 lg:-right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-secondary border border-soft rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-soft flex justify-between items-center bg-tertiary">
                      <span className="text-[10px] font-black uppercase tracking-widest text-t-primary">Notifications</span>
                      <button onClick={markAllAsRead} className="text-[10px] font-bold text-t-muted hover:text-t-primary transition-colors">Clear all</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto bg-secondary">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-t-muted text-xs font-medium">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-soft hover:bg-tertiary cursor-pointer transition-colors">
                            <h5 className="text-xs font-bold mb-1 text-t-primary">{n.title}</h5>
                            <p className="text-xs text-t-secondary line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar */}
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-soft transition-colors cursor-pointer">
                <UserCircle size={20} className="text-t-muted" />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-12 py-6 lg:py-12">
            <div className={view === 'settings' || view === 'profile' || view === 'courses' || view === 'files' ? 'w-full' : 'max-w-5xl mx-auto'}>
              {view === 'dashboard' && <Dashboard assignments={filteredAssignments} onSelect={(id) => { setActiveAssignmentId(id); setView('assignment'); }} onDelete={handleDeleteAssignment} onSynapseComplete={handleSynapseComplete} />}
              {view === 'courses' && <CourseManager />}
              {view === 'files' && <FileManager />}
              {view === 'calendar' && <CalendarView assignments={filteredAssignments} />}
              {view === 'upload' && <UploadAssignment templates={templates} onCreated={(a) => { setAssignments([a, ...assignments]); fetchCourses(); setActiveAssignmentId(a.id); setView('assignment'); }} />}
              {view === 'assignment' && activeAssignment && <AssignmentView assignment={activeAssignment} onUpdate={handleUpdateAssignment} onSaveTemplate={handleSaveTemplate} />}
              {view === 'settings' && <Settings onNavigate={handleNavigation} />}
              {view === 'profile' && <Profile />}
              {view === 'documentation' && <DocumentationPage />}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`
      w-full flex items-center
      ${collapsed ? 'justify-center gap-0 px-2' : 'gap-4 lg:gap-3 px-4 lg:px-3'}
      py-3.5 lg:py-2
      rounded-xl lg:rounded-md
      text-[15px] lg:text-[12px] font-semibold lg:font-medium
      transition-all text-left
      active:scale-[0.98]
      ${active
        ? 'bg-blue-600 lg:bg-blue-500/10 text-white lg:text-blue-600 dark:lg:text-blue-400 shadow-lg shadow-blue-600/20 lg:shadow-none'
        : 'text-t-primary lg:text-t-secondary hover:bg-tertiary lg:hover:bg-secondary hover:text-t-primary'
      }
    `}
  >
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span className="truncate">{label}</span>}
  </button>
);

export default MainApp;


