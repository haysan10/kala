
import React, { useState, useEffect, useCallback } from 'react';
import { Assignment, TaskStatus, ValidationResult, FileEntry, Milestone, MiniCourse, RubricScore, ScaffoldingTask } from '../types';
import { Calendar, Layers, MessageSquare, BookCheck, Circle, Play, ShieldCheck, FolderOpen, FileUp, Trash2, Edit3, Plus, Save, Sparkles, BookOpen, Clock, Loader2, ArrowRight, X, Sword, Award, Tag, Filter, FileText, CheckCircle, Search, Download, ExternalLink, Info, ClipboardCheck, MessageCircle, BarChart4, Target, GraduationCap, ChevronRight, Book, Eye, Map, List, Zap, Timer, Layout } from 'lucide-react';
import TutorChat from './TutorChat';
import FocusMode from './FocusMode';
import DebateRoom from './DebateRoom';
import KnowledgeMap from './KnowledgeMap';
import EnhancedMiniCourse from './EnhancedMiniCourse';
import BlockEditor from './BlockEditor';
import { validateWork, generateMiniCourse, generateScaffoldingTask } from '../services/geminiService';

interface AssignmentViewProps {
  assignment: Assignment;
  onUpdate: (updated: Assignment) => void;
  onSaveTemplate: (assignment: Assignment) => void;
}

interface PendingFile {
  file: File;
  previewUrl: string;
  type: FileEntry['type'];
}

const AssignmentView: React.FC<AssignmentViewProps> = ({ assignment, onUpdate, onSaveTemplate }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'draft' | 'tutor' | 'assessment' | 'validation' | 'vault'>('roadmap');
  const [roadmapView, setRoadmapView] = useState<'list' | 'map'>('list');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusTarget, setFocusTarget] = useState<Milestone | null>(null);
  const [isDebateMode, setIsDebateMode] = useState(false);
  const [debateTarget, setDebateTarget] = useState<Milestone | null>(null);
  const [validating, setValidating] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Milestone | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(false);

  const [generatingScaffold, setGeneratingScaffold] = useState(false);
  const [scaffoldTimeLeft, setScaffoldTimeLeft] = useState(0);

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const [fileFilter, setFileFilter] = useState<'all' | FileEntry['type']>('all');
  const [vaultSearch, setVaultSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const timeToDeadline = new Date(assignment.deadline).getTime() - Date.now();
  const isEmergency = assignment.overallProgress === 0 && timeToDeadline < (48 * 60 * 60 * 1000) && timeToDeadline > 0;

  useEffect(() => {
    let timer: any;
    if (scaffoldTimeLeft > 0) {
      timer = setInterval(() => setScaffoldTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [scaffoldTimeLeft]);

  const handleStartScaffold = async () => {
    setGeneratingScaffold(true);
    try {
      const task = await generateScaffoldingTask(`${assignment.title}: ${assignment.description}`);
      onUpdate({ ...assignment, currentScaffoldingTask: task });
      setScaffoldTimeLeft(task.durationSeconds);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingScaffold(false);
    }
  };

  const completeScaffold = () => {
    if (assignment.currentScaffoldingTask) {
      onUpdate({ ...assignment, currentScaffoldingTask: { ...assignment.currentScaffoldingTask, completed: true } });
      setScaffoldTimeLeft(0);
    }
  };

  const filteredFiles = assignment.files.filter(file => {
    const matchesFilter = fileFilter === 'all' || file.type === fileFilter;
    const matchesSearch = file.name.toLowerCase().includes(vaultSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const addTag = () => {
    if (newTagInput.trim() && !assignment.tags.includes(newTagInput.trim())) {
      onUpdate({ ...assignment, tags: [...assignment.tags, newTagInput.trim()] });
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const removeTag = (tag: string) => {
    onUpdate({ ...assignment, tags: assignment.tags.filter(t => t !== tag) });
  };

  const deleteFile = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this file?')) {
      onUpdate({ ...assignment, files: assignment.files.filter(f => f.id !== id) });
    }
  };

  const processFiles = (files: FileList) => {
    const newPending: PendingFile[] = Array.from(files).map(f => ({
      file: f,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
      type: 'draft'
    }));
    setPendingFiles(prev => [...prev, ...newPending]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const commitPendingFiles = () => {
    const newFileEntries: FileEntry[] = pendingFiles.map(pf => ({
      id: Math.random().toString(36).substr(2, 9),
      name: pf.file.name,
      type: pf.type,
      timestamp: new Date().toISOString(),
      size: `${(pf.file.size / 1024).toFixed(1)} KB`
    }));
    onUpdate({ ...assignment, files: [...assignment.files, ...newFileEntries] });
    setPendingFiles([]);
  };

  const loadMiniCourse = async (m: Milestone) => {
    if (m.miniCourse) { setSelectedCourse(m); return; }
    setLoadingCourse(true);
    try {
      const fullRoadmapStr = assignment.milestones.map((ms, i) => `${i + 1}. ${ms.title}`).join(' -> ');
      const course = await generateMiniCourse(
        m.title,
        m.description,
        `${assignment.title}: ${assignment.description}`,
        fullRoadmapStr
      );
      const updatedMilestones = assignment.milestones.map(ms => ms.id === m.id ? { ...ms, miniCourse: course } : ms);
      onUpdate({ ...assignment, milestones: updatedMilestones });
      setSelectedCourse({ ...m, miniCourse: course });
    } catch (err) { console.error(err); } finally { setLoadingCourse(false); }
  }

  const completeFormativeAction = (milestoneId: string) => {
    const updatedMilestones = assignment.milestones.map(m => {
      if (m.id === milestoneId && m.miniCourse) {
        return { ...m, miniCourse: { ...m.miniCourse, formativeTaskCompleted: true } };
      }
      return m;
    });
    onUpdate({ ...assignment, milestones: updatedMilestones });
    if (selectedCourse?.id === milestoneId) {
      setSelectedCourse({ ...selectedCourse, miniCourse: { ...selectedCourse.miniCourse!, formativeTaskCompleted: true } });
    }
  };

  const toggleMilestone = (id: string) => {
    const updated = assignment.milestones.map(m => m.id === id ? { ...m, status: m.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED } : m);
    const completed = updated.filter(m => m.status === TaskStatus.COMPLETED).length;
    onUpdate({ ...assignment, milestones: updated, overallProgress: Math.round((completed / updated.length) * 100) });
  };

  if (isFocusMode) return <FocusMode milestone={focusTarget} onClose={() => setIsFocusMode(false)} onComplete={(id) => { toggleMilestone(id); setIsFocusMode(false); }} />;
  if (isDebateMode && debateTarget) return <DebateRoom milestone={debateTarget} assignmentContext={`${assignment.title}: ${assignment.description}`} onClose={(u) => { if (u && debateTarget) onUpdate({ ...assignment, milestones: assignment.milestones.map(m => m.id === debateTarget.id ? { ...m, miniCourse: u } : m) }); setIsDebateMode(false); setDebateTarget(null); }} />;

  return (
    <div className="animate-fade-in-up space-y-8 sm:space-y-16 pb-24 dark:text-white relative font-sans">
      {isEmergency && !assignment.currentScaffoldingTask?.completed && (
        <div className="bg-rose-500 text-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[4rem] flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 shadow-[0_25px_60px_rgba(244,63,94,0.4)] animate-float relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/30" />
          <div className="flex items-center gap-4 sm:gap-8 relative z-10">
            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white/20 rounded-2xl sm:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner">
              <Zap size={24} className="sm:w-10 sm:h-10 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Pedagogical Intervention</span>
              <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tighter leading-none">Freeze Detected</h3>
              <p className="text-sm sm:text-lg font-medium opacity-90 mt-1 sm:mt-2 text-white">Let's break the cognitive wall with a burst.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end gap-4 lg:gap-6 relative z-10 w-full lg:min-w-[300px]">
            {assignment.currentScaffoldingTask ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Burst Duration</span>
                  <div className="text-xl sm:text-2xl font-black tabular-nums">{Math.floor(scaffoldTimeLeft / 60)}:{(scaffoldTimeLeft % 60).toString().padStart(2, '0')}</div>
                </div>
                <div className="p-4 sm:p-6 bg-white/10 rounded-xl sm:rounded-2xl border border-white/20 w-full">
                  <p className="font-bold text-base sm:text-lg leading-tight">"{assignment.currentScaffoldingTask.instruction}"</p>
                </div>
                <button onClick={completeScaffold} className="w-full lg:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-white text-rose-600 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:scale-105 active:scale-95 transition-all">Mark as Completed</button>
              </>
            ) : (
              <button
                onClick={handleStartScaffold}
                disabled={generatingScaffold}
                className="w-full lg:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-white text-rose-600 rounded-2xl sm:rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl"
              >
                {generatingScaffold ? <Loader2 size={24} className="animate-spin" /> : <Play size={20} className="sm:w-6 sm:h-6" fill="currentColor" />}
                Initialize Burst
              </button>
            )}
          </div>
        </div>
      )}

      <header className="space-y-8 sm:space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <span className="w-fit bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 sm:px-6 py-2 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] shadow-lg">{assignment.course}</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Terminal Deadline</span>
              <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <button onClick={() => onSaveTemplate(assignment)} className="w-fit px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
            <Layout size={14} /> <span className="hidden sm:inline">Save Structure as Template</span><span className="sm:hidden">Save Template</span>
          </button>
        </div>

        <div className="space-y-6 sm:space-y-10 max-w-6xl">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-tight">
            {assignment.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 py-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mr-2">Index Tags</span>
            {assignment.tags.map(tag => (
              <span key={tag} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg sm:rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-3 group shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
              </span>
            ))}
            {isAddingTag ? (
              <input autoFocus value={newTagInput} onChange={e => setNewTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} onBlur={() => setIsAddingTag(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-900 dark:border-white rounded-xl text-[9px] font-black uppercase outline-none w-32 shadow-xl" placeholder="Tag Name..." />
            ) : (
              <button onClick={() => setIsAddingTag(true)} className="px-3 sm:px-4 py-1.5 sm:py-2 border border-dashed border-gray-300 dark:border-white/20 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><Plus size={14} /> Attach Label</button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-12 p-8 sm:p-16 bg-gray-100/50 dark:bg-white/[0.02] rounded-3xl sm:rounded-[5rem] border border-gray-200/50 dark:border-white/5 shadow-inner group">
            <div className="p-4 sm:p-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl sm:rounded-[2rem] shrink-0 shadow-xl group-hover:scale-105 transition-transform duration-500"><Target size={32} className="sm:w-10 sm:h-10" /></div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Central Learning Outcome</span>
              <p className="text-xl sm:text-2xl md:text-4xl text-gray-900 dark:text-white font-black tracking-tight leading-[1.2] italic opacity-90">"{assignment.learningOutcome}"</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-white/5 sticky top-[56px] lg:top-[64px] bg-white/80 dark:bg-gray-950/80 z-40 py-4 sm:py-8 backdrop-blur-xl">
        <div className="flex gap-8 sm:gap-16 overflow-x-auto pb-4 md:pb-0 scrollbar-hide px-2 sm:px-0">
          <TabItem active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} icon={<Layers size={18} />} label="Roadmap" />
          <TabItem active={activeTab === 'draft'} onClick={() => setActiveTab('draft')} icon={<Edit3 size={18} />} label="Draft" />
          <TabItem active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={<FolderOpen size={18} />} label="Vault" />
          <TabItem active={activeTab === 'validation'} onClick={() => setActiveTab('validation')} icon={<ClipboardCheck size={18} />} label="Assessment" />
          <TabItem active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<MessageSquare size={18} />} label="Mentor" />
        </div>
        <button onClick={() => { setFocusTarget(null); setIsFocusMode(true); }} className="w-full md:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 sm:px-12 py-3 sm:py-5 rounded-xl sm:rounded-[3rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl mt-4 md:mt-0">
          <Play size={20} className="sm:w-6 sm:h-6" fill="currentColor" /> Active Engagement
        </button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8">
          {activeTab === 'draft' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-900 pb-10">
                <div className="space-y-1">
                  <span className="academic-label block">Content Construction</span>
                  <h3 className="text-2xl font-black text-navy-900 dark:text-white uppercase tracking-tight">Assignment Drafting</h3>
                </div>
              </div>
              <BlockEditor assignmentId={assignment.id} />
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-700">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-6 sm:pb-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Unit Pipeline</span>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Conceptual Sequence</h3>
                </div>
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/10">
                  <button onClick={() => setRoadmapView('list')} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${roadmapView === 'list' ? 'bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white' : 'text-gray-400'}`}><List size={18} /></button>
                  <button onClick={() => setRoadmapView('map')} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${roadmapView === 'map' ? 'bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white' : 'text-gray-400'}`}><Map size={18} /></button>
                </div>
              </div>

              {roadmapView === 'map' ? (
                <KnowledgeMap assignment={assignment} onNodeClick={(m) => loadMiniCourse(m)} />
              ) : (
                <div className="space-y-8 sm:space-y-12">
                  {assignment.milestones.map((m, idx) => (
                    <div key={m.id} className="group relative">
                      <div className={`flex flex-col sm:flex-row items-start gap-6 sm:gap-12 p-8 sm:p-14 rounded-3xl sm:rounded-[4rem] border transition-all shadow-sm hover:shadow-xl ${m.miniCourse?.masteryStatus === 'perfected' ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-navy-950'}`}>
                        <button onClick={() => toggleMilestone(m.id)} className="transition-all hover:scale-110 shrink-0">
                          {m.status === TaskStatus.COMPLETED ? <ShieldCheck size={48} className="sm:w-16 sm:h-16 text-gray-900 dark:text-white" /> : <Circle size={48} className="sm:w-16 sm:h-16 text-gray-200 dark:text-gray-700" strokeWidth={1} />}
                        </button>
                        <div className="flex-1 space-y-4 sm:space-y-6 w-full">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">Module 0{idx + 1}</span>
                              <h4 className={`text-2xl sm:text-4xl font-black tracking-tighter uppercase leading-none ${m.status === TaskStatus.COMPLETED ? 'line-through opacity-20' : ''}`}>{m.title}</h4>
                            </div>
                            <button onClick={() => loadMiniCourse(m)} className={`flex items-center justify-center gap-4 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shrink-0 shadow-lg ${m.miniCourse?.masteryStatus === 'perfected' ? 'bg-emerald-500 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'}`}>
                              {loadingCourse ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                              {m.miniCourse?.masteryStatus === 'perfected' ? 'Mastered' : 'Engage'}
                            </button>
                          </div>
                          <p className="text-base sm:text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic pr-4">
                            {m.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-6 sm:gap-12 pt-4 sm:pt-6">
                            <div className="flex items-center gap-3">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{m.estimatedMinutes}m Load</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Due {new Date(m.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tutor' && <TutorChat assignment={assignment} />}

          {activeTab === 'vault' && (
            <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-500">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative group p-8 sm:p-16 rounded-3xl sm:rounded-[5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 ${isDragging ? 'border-gray-900 bg-gray-100/50 dark:bg-white/5' : 'border-gray-200 dark:border-white/10'}`}
              >
                <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center transition-all shadow-xl ${isDragging ? 'bg-gray-900 text-white scale-110' : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-700'}`}><FileUp size={32} className="sm:w-12 sm:h-12" /></div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Academic Repository</span>
                  <h4 className="text-2xl sm:text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none">Evidence Injection</h4>
                  <p className="text-sm sm:text-xl text-gray-500 font-medium italic opacity-80 mt-2 pr-4 sm:pr-0">Drag and drop academic assets to initialize the vault.</p>
                </div>
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && processFiles(e.target.files)} />
              </div>

              {pendingFiles.length > 0 && (
                <div className="p-8 sm:p-12 bg-gray-50 dark:bg-white/[0.02] rounded-3xl sm:rounded-[4rem] border border-gray-200 dark:border-white/10 space-y-8 sm:space-y-10 animate-in slide-in-from-bottom-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Staging area ({pendingFiles.length})</span>
                    <button onClick={commitPendingFiles} className="px-6 sm:px-10 py-3 sm:py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl sm:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all">Commit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                    {pendingFiles.map((pf, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl sm:rounded-[3rem] bg-white dark:bg-navy-950 overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg group">
                        {pf.previewUrl ? <img src={pf.previewUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-300"><FileText size={32} /></div>}
                        <button onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"><X size={14} /></button>
                        <div className="absolute bottom-2 left-2 right-2 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[7px] font-black text-white uppercase tracking-widest truncate">{pf.file.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                {filteredFiles.map(file => (
                  <div key={file.id} className="p-6 sm:p-10 rounded-3xl sm:rounded-[4rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-navy-950 flex items-center justify-between group hover:border-gray-900 dark:hover:border-white hover:shadow-xl transition-all shadow-sm">
                    <div className="flex items-center gap-4 sm:gap-8 min-w-0">
                      <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-lg ${file.type === 'instruction' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}><FileText size={24} className="sm:w-8 sm:h-8" /></div>
                      <div className="min-w-0 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">{file.type}</span>
                        <h4 className="text-lg sm:text-xl font-black pr-4 tracking-tight uppercase leading-none truncate overflow-hidden">{file.name}</h4>
                      </div>
                    </div>
                    <button onClick={() => deleteFile(file.id)} className="p-3 sm:p-4 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all bg-gray-100 dark:bg-white/5 rounded-xl sm:rounded-2xl"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-500">
              <div className="space-y-8 sm:space-y-10">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block">Synthesis Protocol</span>
                  <h3 className="text-3xl sm:text-5xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none">Summative Verdict</h3>
                  <p className="text-lg sm:text-xl text-gray-500 font-medium italic pr-4 sm:pr-0">Final verification of conceptual mastery across all units.</p>
                </div>
                <textarea value={draftText} onChange={(e) => setDraftText(e.target.value)} placeholder="Final academic output..." className="w-full h-[400px] sm:h-[600px] p-8 sm:p-16 rounded-3xl sm:rounded-[4rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-navy-950 outline-none font-medium leading-relaxed shadow-inner text-base sm:text-lg focus:border-gray-900 transition-all text-t-primary" />
                <button onClick={() => validateWork(`${assignment.title}: ${assignment.description}`, draftText, reflectionText).then(r => onUpdate({ ...assignment, validationHistory: [r, ...assignment.validationHistory] }))} className="w-full py-8 sm:py-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] sm:rounded-[3.5rem] font-black text-xs sm:text-sm uppercase tracking-[0.4em] sm:tracking-[0.5em] shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all">Initialize Assessment</button>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-12 sm:space-y-16">
          <div className="p-10 sm:p-14 bg-gray-900 dark:bg-navy-900 text-white rounded-[3rem] sm:rounded-[5rem] space-y-10 sm:space-y-20 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
            <div className="space-y-4 sm:space-y-6 relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Maturity Index</span>
              <div className="text-6xl sm:text-8xl lg:text-[7rem] font-black tracking-tighter leading-none">{assignment.overallProgress}<span className="text-xl sm:text-2xl opacity-30 text-white/50">%</span></div>
            </div>
            <div className="w-full h-4 sm:h-6 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
              <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.8)]" style={{ width: `${assignment.overallProgress}%` }} />
            </div>

            <div className="pt-8 sm:pt-12 border-t border-white/5 space-y-6 sm:space-y-8 relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block">Core Requirements</span>
              <div className="space-y-4 sm:space-y-6">
                {assignment.rubrics.map((r, i) => (
                  <div key={i} className="flex gap-4 text-xs sm:text-sm font-bold leading-relaxed text-white/60 italic">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mt-1.5 sm:mt-2 shrink-0 opacity-20" /> {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {selectedCourse && selectedCourse.miniCourse && (
        <div className="fixed inset-0 z-[60] bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[95vh] rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                  <Book size={20} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Learning Module</span>
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedCourse.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <EnhancedMiniCourse
                course={selectedCourse.miniCourse}
                milestoneTitle={selectedCourse.title}
                isFormativeCompleted={selectedCourse.miniCourse.formativeTaskCompleted}
                onFormativeComplete={() => completeFormativeAction(selectedCourse.id)}
                onStartDebate={() => {
                  setDebateTarget(selectedCourse);
                  setSelectedCourse(null);
                  setIsDebateMode(true);
                }}
                onTaskComplete={(taskId) => {
                  // Update task completion in milestone
                  const updatedMilestones = assignment.milestones.map(m => {
                    if (m.id === selectedCourse.id && m.miniCourse) {
                      const completedTasks = m.miniCourse.completedTasks || [];
                      const isCompleted = completedTasks.includes(taskId);
                      return {
                        ...m,
                        miniCourse: {
                          ...m.miniCourse,
                          completedTasks: isCompleted
                            ? completedTasks.filter(t => t !== taskId)
                            : [...completedTasks, taskId]
                        }
                      };
                    }
                    return m;
                  });
                  onUpdate({ ...assignment, milestones: updatedMilestones });
                }}
                onCheckpointAnswer={(checkpointId, answer) => {
                  // Update checkpoint answer in milestone
                  const updatedMilestones = assignment.milestones.map(m => {
                    if (m.id === selectedCourse.id && m.miniCourse) {
                      const completedCheckpoints = m.miniCourse.completedCheckpoints || [];
                      return {
                        ...m,
                        miniCourse: {
                          ...m.miniCourse,
                          completedCheckpoints: [...completedCheckpoints, checkpointId]
                        }
                      };
                    }
                    return m;
                  });
                  onUpdate({ ...assignment, milestones: updatedMilestones });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`flex items-center gap-6 pb-10 text-[11px] font-black uppercase tracking-[0.4em] transition-all border-b-2 ${active ? 'border-navy-900 dark:border-white text-navy-900 dark:text-white' : 'border-transparent text-navy-100 dark:text-navy-800 hover:text-navy-400'}`}>
    {icon} {label}
  </button>
);

export default AssignmentView;
