
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
    <div className="max-w-4xl mx-auto animate-in zoom-in duration-500 space-y-8 sm:space-y-12">
      <header className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-tight">New Project</h2>
        <p className="text-base sm:text-lg text-zinc-400 font-medium mentor-text italic leading-relaxed max-w-2xl">
          Initialize your academic workspace. Kala synthesizes roadmaps from your instructions, documents, or images.
        </p>
      </header>

      <div className="space-y-8 sm:space-y-10">
        {/* Course Selector */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Link to Course (Optional)</span>
          <div className="relative">
            <button
              onClick={() => setShowCourseDropdown(!showCourseDropdown)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${selectedCourse
                ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                : 'border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
            >
              {selectedCourse ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: selectedCourse.color + '20' }}
                  >
                    {selectedCourse.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{selectedCourse.name}</p>
                    {selectedCourse.code && (
                      <p className="text-[10px] text-gray-500 mt-1">{selectedCourse.code}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-zinc-400">
                  <BookOpen size={16} />
                  <span className="text-sm font-medium">Select a course...</span>
                </div>
              )}
              <ChevronDown size={16} className={`text-zinc-400 transition-transform ${showCourseDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCourseDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedCourseId(null);
                    setShowCourseDropdown(false);
                  }}
                  className="w-full p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 text-zinc-500"
                >
                  <X size={16} />
                  <span className="text-sm font-medium">No course linkage</span>
                </button>

                {loadingCourses ? (
                  <div className="p-4 text-center text-zinc-400">
                    <Loader2 className="animate-spin mx-auto" size={18} />
                  </div>
                ) : (
                  courses.map(course => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setShowCourseDropdown(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 ${selectedCourseId === course.id ? 'bg-zinc-50 dark:bg-zinc-800' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: course.color + '20' }}>
                        {course.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900 dark:text-white text-sm leading-none">{course.name}</p>
                        {course.code && <p className="text-[10px] text-zinc-400 mt-1">{course.code}</p>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {templates.length > 0 && (
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Quick Templates</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => useTemplate(t)}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left hover:border-zinc-900 dark:hover:border-zinc-500 transition-all group shadow-sm"
                >
                  <div className="w-8 h-8 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-zinc-400"><Layout size={14} /></div>
                  <h4 className="text-[11px] font-black uppercase tracking-tight mb-1 truncate dark:text-white">{t.name}</h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{t.course}</span>
                </button>
              ))}
              <button className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-300 hover:text-zinc-500 hover:border-zinc-400 dark:hover:text-zinc-500 transition-all">
                <Plus size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">More</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Contextual Text */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center">
                <FileText size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Contextual Text</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste instructions, syllabus, or requirements..."
              className="flex-1 w-full bg-zinc-50/50 dark:bg-zinc-950 rounded-xl p-5 text-sm font-medium border border-zinc-100 dark:border-zinc-800 outline-none focus:border-zinc-900 dark:focus:border-zinc-500 transition-all resize-none dark:text-zinc-100 placeholder-zinc-300 min-h-[220px]"
            />
          </div>

          {/* Card 2: Document Upload */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                <FilePlus size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Document Upload</span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${uploadedFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'}`}
            >
              {uploadedFile ? (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center mx-auto shadow-lg"><FileSearch size={28} /></div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-[150px] dark:text-zinc-200">{uploadedFile.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-[9px] font-black uppercase tracking-widest text-rose-500 mt-2 hover:underline">Remove</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-950 text-zinc-300 dark:text-zinc-700 rounded-xl flex items-center justify-center mb-4"><Upload size={24} /></div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">PDF, Image, or Docx</p>
                  <p className="text-[9px] text-zinc-300 uppercase tracking-widest mt-1">Max: 10MB</p>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*,.docx" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest justify-center">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
          <button
            onClick={handleProcess}
            disabled={analyzing}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing Contents...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Roadmap
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadAssignment;
