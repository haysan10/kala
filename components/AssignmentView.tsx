
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
    <div className="animate-fade-in-up space-y-16 pb-24 dark:text-white relative font-sans">
      {isEmergency && !assignment.currentScaffoldingTask?.completed && (
        <div className="bg-rose-500 text-white p-10 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_25px_60px_rgba(244,63,94,0.4)] animate-float relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/30" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner">
              <Zap size={40} className="animate-pulse" />
            </div>
            <div>
              <span className="academic-label block text-white/60 mb-1">Pedagogical Intervention</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Freeze Detected</h3>
              <p className="text-lg font-medium mentor-text opacity-90 mt-2 text-white">Let's break the cognitive wall with a low-friction burst.</p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-6 relative z-10 min-w-[300px]">
            {assignment.currentScaffoldingTask ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="academic-label text-white/50">Burst Duration</span>
                  <div className="text-2xl font-black tabular-nums">{Math.floor(scaffoldTimeLeft / 60)}:{(scaffoldTimeLeft % 60).toString().padStart(2, '0')}</div>
                </div>
                <div className="p-6 bg-white/10 rounded-2xl border border-white/20 w-full">
                  <p className="font-bold text-lg leading-tight">"{assignment.currentScaffoldingTask.instruction}"</p>
                </div>
                <button onClick={completeScaffold} className="w-full md:w-auto px-10 py-4 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Mark as Completed</button>
              </>
            ) : (
              <button
                onClick={handleStartScaffold}
                disabled={generatingScaffold}
                className="px-12 py-6 bg-white text-rose-600 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center gap-4 hover:scale-105 transition-all shadow-2xl"
              >
                {generatingScaffold ? <Loader2 size={24} className="animate-spin" /> : <Play size={24} fill="currentColor" />}
                Initialize Burst
              </button>
            )}
          </div>
        </div>
      )}

      <header className="space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="bg-navy-900 dark:bg-white text-white dark:text-navy-900 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl">{assignment.course}</span>
            <div className="flex items-center gap-3">
              <span className="academic-label">Terminal Deadline</span>
              <span className="text-[11px] font-black text-navy-900 dark:text-white uppercase tracking-widest">{new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <button onClick={() => onSaveTemplate(assignment)} className="px-6 py-2.5 bg-navy-50 dark:bg-navy-900 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-navy-100 transition-all border border-navy-100 dark:border-navy-800">
            <Layout size={14} /> Save Structure as Template
          </button>
        </div>

        <div className="space-y-10 max-w-6xl">
          <h1 className="academic-heading-xl text-navy-900 dark:text-white">{assignment.title}</h1>

          <div className="flex flex-wrap items-center gap-4 py-4">
            <span className="academic-label mr-2">Index Tags</span>
            {assignment.tags.map(tag => (
              <span key={tag} className="px-4 py-2 bg-navy-50 dark:bg-navy-900 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-navy-100 dark:border-navy-800 flex items-center gap-3 group shadow-sm transition-all hover:bg-white dark:hover:bg-navy-800">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-navy-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
              </span>
            ))}
            {isAddingTag ? (
              <input autoFocus value={newTagInput} onChange={e => setNewTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} onBlur={() => setIsAddingTag(false)} className="px-4 py-2 bg-white dark:bg-navy-900 border border-navy-900 rounded-xl text-[9px] font-black uppercase outline-none w-32 shadow-xl" placeholder="Tag Name..." />
            ) : (
              <button onClick={() => setIsAddingTag(true)} className="px-4 py-2 border border-dashed border-navy-200 text-navy-300 hover:text-navy-900 hover:border-navy-900 transition-all rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><Plus size={14} /> Attach Label</button>
            )}
          </div>

          <div className="flex items-start gap-12 p-16 bg-navy-50/50 dark:bg-navy-900/50 rounded-[5rem] border border-navy-100 dark:border-navy-800 shadow-inner group">
            <div className="p-6 bg-navy-900 dark:bg-white text-white dark:text-navy-900 rounded-[2rem] shrink-0 shadow-2xl group-hover:scale-110 transition-transform duration-500"><Target size={40} /></div>
            <div className="space-y-3">
              <span className="academic-label block">Central Learning Outcome</span>
              <p className="text-4xl text-navy-900 dark:text-white font-black tracking-tight leading-[1.2] mentor-text italic opacity-90">"{assignment.learningOutcome}"</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="flex items-center justify-between border-b border-navy-50 dark:border-navy-900 sticky top-[64px] bg-white dark:bg-navy-950 z-40 py-8 backdrop-blur-xl bg-white/80 dark:bg-navy-950/80">
        <div className="flex gap-16 min-w-max">
          <TabItem active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} icon={<Layers size={20} />} label="Roadmap" />
          <TabItem active={activeTab === 'draft'} onClick={() => setActiveTab('draft')} icon={<Edit3 size={20} />} label="Draft Space" />
          <TabItem active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={<FolderOpen size={20} />} label="The Vault" />
          <TabItem active={activeTab === 'validation'} onClick={() => setActiveTab('validation')} icon={<ClipboardCheck size={20} />} label="Assessment" />
          <TabItem active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<MessageSquare size={20} />} label="Academic Mentor" />
        </div>
        <button onClick={() => { setFocusTarget(null); setIsFocusMode(true); }} className="bg-navy-900 dark:bg-white text-white dark:text-navy-900 px-12 py-5 rounded-[3rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4 hover:scale-105 transition-all shadow-2xl">
          <Play size={24} fill="currentColor" /> Active Engagement
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
            <div className="space-y-16 animate-in fade-in duration-700">
              <div className="flex items-center justify-between border-b border-navy-50 dark:border-navy-900 pb-10">
                <div className="space-y-1">
                  <span className="academic-label block">Unit Pipeline</span>
                  <h3 className="text-2xl font-black text-navy-900 dark:text-white uppercase tracking-tight">Conceptual Sequence</h3>
                </div>
                <div className="flex bg-navy-50 dark:bg-navy-900 p-1.5 rounded-2xl border border-navy-100 dark:border-navy-800">
                  <button onClick={() => setRoadmapView('list')} className={`p-3 rounded-xl transition-all ${roadmapView === 'list' ? 'bg-white dark:bg-navy-800 shadow-md text-navy-900 dark:text-white' : 'text-navy-200'}`}><List size={20} /></button>
                  <button onClick={() => setRoadmapView('map')} className={`p-3 rounded-xl transition-all ${roadmapView === 'map' ? 'bg-white dark:bg-navy-800 shadow-md text-navy-900 dark:text-white' : 'text-navy-200'}`}><Map size={20} /></button>
                </div>
              </div>

              {roadmapView === 'map' ? (
                <KnowledgeMap assignment={assignment} onNodeClick={(m) => loadMiniCourse(m)} />
              ) : (
                <div className="space-y-12">
                  {assignment.milestones.map((m, idx) => (
                    <div key={m.id} className="group relative">
                      <div className={`flex items-start gap-12 p-14 rounded-[4rem] border transition-all shadow-sm hover:shadow-2xl ${m.miniCourse?.masteryStatus === 'perfected' ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20' : 'border-navy-50 dark:border-navy-900 bg-white dark:bg-navy-950'}`}>
                        <button onClick={() => toggleMilestone(m.id)} className="mt-2 transition-all hover:scale-110 shrink-0">
                          {m.status === TaskStatus.COMPLETED ? <ShieldCheck size={64} className="text-navy-900 dark:text-white" /> : <Circle size={64} className="text-navy-50 dark:text-navy-800" strokeWidth={1} />}
                        </button>
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center justify-between gap-10">
                            <div>
                              <span className="academic-label block mb-2">Module 0{idx + 1}</span>
                              <h4 className={`text-4xl font-black tracking-tighter uppercase leading-none ${m.status === TaskStatus.COMPLETED ? 'line-through opacity-20' : ''}`}>{m.title}</h4>
                            </div>
                            <button onClick={() => loadMiniCourse(m)} className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shrink-0 shadow-xl ${m.miniCourse?.masteryStatus === 'perfected' ? 'bg-emerald-500 text-white' : 'bg-navy-900 dark:bg-white text-white dark:text-navy-900'}`}>
                              {loadingCourse ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
                              {m.miniCourse?.masteryStatus === 'perfected' ? 'Mastery Verified' : 'Engage Strategy'}
                            </button>
                          </div>
                          <p className="text-2xl text-navy-400 font-medium leading-relaxed mentor-text italic opacity-80">{m.description}</p>
                          <div className="flex items-center gap-12 pt-6">
                            <div className="flex items-center gap-3">
                              <Clock size={16} className="text-navy-200" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-navy-300">{m.estimatedMinutes}m Load</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar size={16} className="text-navy-200" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-navy-300">Due {new Date(m.deadline).toLocaleDateString()}</span>
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
            <div className="space-y-16 animate-in fade-in duration-500">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative group p-16 rounded-[5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-8 ${isDragging ? 'border-navy-900 bg-navy-50/50 dark:bg-navy-900/50' : 'border-navy-100 dark:border-navy-900'}`}
              >
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all shadow-xl ${isDragging ? 'bg-navy-900 text-white scale-110' : 'bg-navy-50 dark:bg-navy-900 text-navy-100'}`}><FileUp size={48} /></div>
                <div className="space-y-2">
                  <span className="academic-label">Academic Repository</span>
                  <h4 className="text-4xl font-black tracking-tighter text-navy-900 dark:text-white uppercase leading-none">Evidence Injection</h4>
                  <p className="text-xl text-navy-400 font-medium mentor-text italic opacity-80 mt-2">Drag and drop academic assets to initialize the vault.</p>
                </div>
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && processFiles(e.target.files)} />
              </div>

              {pendingFiles.length > 0 && (
                <div className="p-12 bg-navy-50 dark:bg-navy-900/50 rounded-[4rem] border border-navy-100 dark:border-navy-800 space-y-10 animate-in slide-in-from-bottom-6">
                  <div className="flex items-center justify-between">
                    <span className="academic-label">Staging Area ({pendingFiles.length} items)</span>
                    <button onClick={commitPendingFiles} className="px-10 py-4 bg-navy-900 text-white dark:bg-white dark:text-navy-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">Commit to Vault</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {pendingFiles.map((pf, idx) => (
                      <div key={idx} className="relative aspect-square rounded-[3rem] bg-white dark:bg-navy-950 overflow-hidden border border-navy-100 dark:border-navy-800 shadow-2xl group">
                        {pf.previewUrl ? <img src={pf.previewUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-navy-100"><FileText size={48} /></div>}
                        <button onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute top-4 right-4 p-3 bg-rose-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl"><Trash2 size={16} /></button>
                        <div className="absolute bottom-4 left-4 right-4 bg-navy-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-[8px] font-black text-white uppercase tracking-widest truncate">{pf.file.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {filteredFiles.map(file => (
                  <div key={file.id} className="p-10 rounded-[4rem] border border-navy-50 dark:border-navy-900 bg-white dark:bg-navy-950 flex items-center justify-between group hover:border-navy-900 hover:shadow-2xl transition-all shadow-sm">
                    <div className="flex items-center gap-8 min-w-0">
                      <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-lg ${file.type === 'instruction' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}><FileText size={32} /></div>
                      <div className="min-w-0 space-y-1">
                        <span className="academic-label block mb-1">{file.type}</span>
                        <h4 className="text-xl font-black truncate pr-4 tracking-tight uppercase leading-none">{file.name}</h4>
                      </div>
                    </div>
                    <button onClick={() => deleteFile(file.id)} className="p-4 text-navy-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all bg-navy-50 dark:bg-navy-900 rounded-2xl"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-16 animate-in fade-in duration-500">
              <div className="space-y-10">
                <div className="space-y-3">
                  <span className="academic-label block">Synthesis Protocol</span>
                  <h3 className="text-5xl font-black tracking-tighter text-navy-900 dark:text-white uppercase leading-none">Summative Verdict</h3>
                  <p className="text-xl text-navy-400 font-medium mentor-text italic opacity-80">Final verification of conceptual mastery across all units.</p>
                </div>
                <textarea value={draftText} onChange={(e) => setDraftText(e.target.value)} placeholder="Final academic output..." className="w-full h-[600px] p-16 rounded-[4rem] border border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-950 outline-none font-medium leading-relaxed shadow-inner text-lg focus:border-navy-900 transition-all" />
                <button onClick={() => validateWork(`${assignment.title}: ${assignment.description}`, draftText, reflectionText).then(r => onUpdate({ ...assignment, validationHistory: [r, ...assignment.validationHistory] }))} className="w-full py-12 bg-navy-900 dark:bg-white text-white dark:text-navy-900 rounded-[3.5rem] font-black text-sm uppercase tracking-[0.5em] shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all">Initialize Final Assessment</button>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-16">
          <div className="p-14 bg-navy-900 text-white rounded-[5rem] space-y-20 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
            <div className="space-y-6 relative">
              <span className="academic-label text-white/40 block">Maturity Index</span>
              <div className="text-[9rem] font-black tracking-tighter leading-none">{assignment.overallProgress}<span className="text-2xl opacity-30">%</span></div>
            </div>
            <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
              <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_30px_rgba(255,255,255,0.8)]" style={{ width: `${assignment.overallProgress}%` }} />
            </div>

            <div className="pt-12 border-t border-white/5 space-y-8 relative">
              <span className="academic-label text-white/30 block">Core Requirements</span>
              <div className="space-y-6">
                {assignment.rubrics.map((r, i) => (
                  <div key={i} className="flex gap-4 text-sm font-bold leading-relaxed text-white/60 mentor-text italic">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 shrink-0 opacity-20" /> {r}
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
