
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Sparkles, Loader2, AlertTriangle, ArrowRight, Layout, Trash2, FilePlus, X, FileSearch, BookOpen, ChevronDown, Plus } from 'lucide-react';
import { analyzeAssignment } from '../services/geminiService';
import { Assignment, TaskStatus, AssignmentTemplate, FileEntry, Course } from '../types';
import { getCourses } from '../services/coursesApi';
import { useToast } from './ui/Toast';

interface UploadAssignmentProps {
  templates: AssignmentTemplate[];
  onCreated: (assignment: Assignment) => void;
}

const UploadAssignment: React.FC<UploadAssignmentProps> = ({ templates, onCreated }) => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Course selection state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const toast = useToast();

  // Load courses on mount
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const data = await getCourses();
        setCourses(data.filter(c => !c.isArchived));
      } catch (err) {
        console.error('Failed to load courses:', err);
        toast.error('Failed to Load Courses', 'Could not fetch your courses. Please try again.');
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const useTemplate = (t: AssignmentTemplate) => {
    setText(`TITLE: [Enter Assignment Title]\n\nCOURSE: ${t.course}\n\nCORE REQUIREMENTS:\n${t.rubrics.join('\n')}\n\nLEARNING OUTCOME: ${t.learningOutcome}\n\nDIAGNOSTIC QUESTIONS:\n${t.diagnosticQuestions.join('\n')}`);
    toast.success('Template Applied', `"${t.name}" template has been loaded. Customize it as needed.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File Too Large', 'Maximum file size is 10MB. Please choose a smaller file.');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error('Invalid File Type', 'Please upload a PDF, image, or Word document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setUploadedFile({
        name: file.name,
        data: base64,
        mimeType: file.type
      });
      toast.success('File Uploaded', `"${file.name}" is ready for analysis.`);
    };
    reader.onerror = () => {
      toast.error('Upload Failed', 'Could not read the file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleProcess = async () => {
    if (!text.trim() && !uploadedFile) {
      toast.warning('No Input Provided', 'Please provide a text description or upload a document/image.');
      setError('Please provide a text description or upload a document/image.');
      return;
    }

    setAnalyzing(true);
    setError('');
    const loadingToast = toast.loading('Analyzing Assignment', 'Kala is synthesizing your assignment roadmap...');

    try {
      const result = await analyzeAssignment(text, uploadedFile ? { data: uploadedFile.data, mimeType: uploadedFile.mimeType } : undefined);

      const newAssignment: Assignment = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.title || (uploadedFile ? uploadedFile.name.split('.')[0] : 'Untitled Assignment'),
        course: selectedCourse?.name || result.course || 'General',
        courseId: selectedCourseId || undefined,
        courseColor: selectedCourse?.color || undefined,
        description: result.description || 'No description provided.',
        learningOutcome: result.learningOutcome || 'Complete the assignment as instructed.',
        diagnosticQuestions: result.diagnosticQuestions || [
          "How confident do you feel about this topic?",
          "What is the biggest challenge you foresee?",
          "How will you measure success for this task?"
        ],
        deadline: result.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: [],
        rubrics: result.rubrics || [],
        atRisk: false,
        overallProgress: 0,
        clarityScore: 0,
        createdAt: new Date().toISOString(),
        files: uploadedFile ? [{
          id: Math.random().toString(36).substr(2, 9),
          name: uploadedFile.name,
          type: 'instruction',
          timestamp: new Date().toISOString(),
          size: 'Uploaded on Ingestion'
        }] : [],
        validationHistory: [],
        milestones: (result.milestones || []).map((m: any) => ({
          ...m,
          id: Math.random().toString(36).substr(2, 5),
          status: TaskStatus.TODO
        }))
      };

      toast.updateToast(loadingToast, {
        type: 'success',
        title: 'Assignment Created!',
        message: `"${newAssignment.title}" has been added with ${newAssignment.milestones.length} milestones.`,
        duration: 5000,
        dismissible: true,
      });

      onCreated(newAssignment);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'Analysis failed';
      setError('Analysis failed. Ensure the text or document contains valid assignment data.');

      toast.updateToast(loadingToast, {
        type: 'error',
        title: 'Analysis Failed',
        message: errorMessage.includes('API')
          ? 'AI service is unavailable. Please check your API key in Settings.'
          : 'Could not analyze the content. Please ensure it contains valid assignment data.',
        duration: 8000,
        dismissible: true,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">Project Ingestion</h2>
          <p className="text-sm text-zinc-400 font-medium italic">Synthesize roadmaps from context.</p>
        </div>
        
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${showAdvanced ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
        >
          <Plus size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-45' : ''}`} />
          Customize
        </button>
      </header>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
          {/* Course Selector */}
          <div className="space-y-3">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Linked Course</span>
            <div className="relative">
              <button
                onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm`}
              >
                {selectedCourse ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedCourse.icon}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedCourse.name}</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-zinc-400">Select course...</span>
                )}
                <ChevronDown size={14} className={`text-zinc-400 transition-transform ${showCourseDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCourseDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto p-1">
                  <button onClick={() => { setSelectedCourseId(null); setShowCourseDropdown(false); }} className="w-full p-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg flex items-center gap-2 text-zinc-500 text-xs">
                    <X size={12} /> No linkage
                  </button>
                  {courses.map(course => (
                    <button key={course.id} onClick={() => { setSelectedCourseId(course.id); setShowCourseDropdown(false); }} className="w-full p-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg flex items-center gap-2">
                      <span className="text-sm">{course.icon}</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-xs">{course.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div className="space-y-3">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Templates</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {templates.slice(0, 3).map(t => (
                  <button
                    key={t.id}
                    onClick={() => useTemplate(t)}
                    className="whitespace-nowrap px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-500 transition-all text-[10px] font-bold text-zinc-500 dark:text-white shadow-sm"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Contextual Text */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg flex items-center justify-center">
                <FileText size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Context</span>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste raw instructions (e.g., Syllabus, Rubric, or Task details)..."
            className="flex-1 w-full bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl p-4 text-xs font-medium border border-zinc-100 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none min-h-[180px]"
          />
        </div>

        {/* Card 2: Document Upload */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg flex items-center justify-center">
                <FilePlus size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Assets</span>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 border border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer ${uploadedFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'}`}
          >
            {uploadedFile ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-2"><FileSearch size={20} /></div>
                <p className="text-[10px] font-bold text-zinc-400 truncate max-w-[120px]">{uploadedFile.name}</p>
                <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-[8px] font-black uppercase tracking-widest text-rose-500 mt-1 hover:underline">Revoke</button>
              </div>
            ) : (
              <>
                <Upload size={20} className="text-zinc-200 dark:text-zinc-800 mb-2" />
                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Upload</p>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*,.docx" onChange={handleFileChange} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-rose-500 text-[9px] font-black uppercase tracking-widest justify-center">
            <AlertTriangle size={12} />
            {error}
          </div>
        )}
        <button
          onClick={handleProcess}
          disabled={analyzing}
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {analyzing ? (
            <><Loader2 className="animate-spin" size={16} /> Working...</>
          ) : (
            <><Sparkles size={16} /> Ingest Project</>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadAssignment;
