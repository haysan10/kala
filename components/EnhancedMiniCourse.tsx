/**
 * EnhancedMiniCourse Component
 * 
 * Displays enhanced mini course content with sections, tasks, checkpoints, and references
 * Supports both legacy (simple) and enhanced (detailed) course formats
 */

import React, { useState } from 'react';
import {
    MiniCourse,
    CourseSection,
    ConceptItem,
    CourseTask,
    CheckpointQuestion,
    Reference,
    EnhancedPracticalGuide,
} from '../types';
import {
    BookOpen,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    ExternalLink,
    FileText,
    GraduationCap,
    Lightbulb,
    ListChecks,
    Sparkles,
    Target,
    Zap,
    AlertCircle,
    BookMarked,
    Play,
    Brain,
    Sword,
} from 'lucide-react';
import MathRenderer from './MathRenderer';

interface EnhancedMiniCourseProps {
    course: MiniCourse;
    milestoneTitle: string;
    onTaskComplete?: (taskId: string) => void;
    onCheckpointAnswer?: (checkpointId: string, answer: string) => void;
    onFormativeComplete?: () => void;
    onStartDebate?: () => void;
    isFormativeCompleted?: boolean;
}

export default function EnhancedMiniCourse({
    course,
    milestoneTitle,
    onTaskComplete,
    onCheckpointAnswer,
    onFormativeComplete,
    onStartDebate,
    isFormativeCompleted = false,
}: EnhancedMiniCourseProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set(course.completedTasks || []));
    const [answeredCheckpoints, setAnsweredCheckpoints] = useState<Set<string>>(new Set(course.completedCheckpoints || []));
    const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, string>>({});
    const [showHint, setShowHint] = useState<string | null>(null);

    // Check if course has enhanced content
    const hasEnhancedContent = !!(
        course.sections?.length ||
        course.tasks?.length ||
        course.checkpoints?.length ||
        course.references?.length ||
        course.prerequisites?.length
    );

    // Check if concepts are detailed objects
    const hasDetailedConcepts = course.concepts?.length && typeof course.concepts[0] === 'object';

    // Check if practical guide is structured
    const hasStructuredGuide = course.practicalGuide && typeof course.practicalGuide === 'object';

    const toggleSection = (id: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedSections(newExpanded);
    };

    const handleTaskComplete = (taskId: string) => {
        const newCompleted = new Set(completedTasks);
        if (newCompleted.has(taskId)) {
            newCompleted.delete(taskId);
        } else {
            newCompleted.add(taskId);
        }
        setCompletedTasks(newCompleted);
        onTaskComplete?.(taskId);
    };

    const handleCheckpointSubmit = (checkpointId: string) => {
        const answer = checkpointAnswers[checkpointId];
        if (!answer?.trim()) return;

        const newAnswered = new Set(answeredCheckpoints);
        newAnswered.add(checkpointId);
        setAnsweredCheckpoints(newAnswered);
        onCheckpointAnswer?.(checkpointId, answer);
    };

    // Calculate progress
    const totalTasks = course.tasks?.length || 0;
    const completedTasksCount = completedTasks.size;
    const progress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Progress */}
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2 block">
                            Learning Module
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                            {milestoneTitle}
                        </h2>
                    </div>
                    {course.difficultyLevel && (
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`w-2 h-6 rounded-full ${level <= course.difficultyLevel!
                                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Progress Bar (only if has tasks) */}
                {totalTasks > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-bold text-indigo-600">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Learning Outcome */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-500 rounded-xl text-white">
                        <Target size={20} />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1 block">
                            Learning Outcome
                        </span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                            {course.learningOutcome}
                        </p>
                    </div>
                </div>
            </div>

            {/* Prerequisites (if any) */}
            {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="p-5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="text-sm font-bold text-amber-800 dark:text-amber-200 block mb-2">
                                Prerequisites
                            </span>
                            <ul className="space-y-1">
                                {course.prerequisites.map((prereq, i) => (
                                    <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                        <ChevronRight size={14} />
                                        {prereq}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Estimated Time */}
            {course.estimatedMinutes && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>Estimated time: <strong>{course.estimatedMinutes} minutes</strong></span>
                </div>
            )}

            {/* Overview Section */}
            <CollapsibleSection
                id="overview"
                title="Overview"
                icon={<BookOpen size={18} />}
                expanded={expandedSections.has('overview')}
                onToggle={() => toggleSection('overview')}
            >
                <MathRenderer
                    content={course.overview}
                    className="text-lg text-gray-700 dark:text-gray-300"
                />
            </CollapsibleSection>

            {/* Sections (Enhanced) */}
            {course.sections && course.sections.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <FileText size={16} />
                        Course Sections
                    </h3>
                    {course.sections.map((section, index) => (
                        <CollapsibleSection
                            key={section.id}
                            id={section.id}
                            title={`${index + 1}. ${section.title}`}
                            icon={<span className="text-xs font-bold text-indigo-500">{section.estimatedMinutes}m</span>}
                            expanded={expandedSections.has(section.id)}
                            onToggle={() => toggleSection(section.id)}
                        >
                            <MathRenderer
                                content={section.content}
                                className="text-gray-700 dark:text-gray-300"
                            />
                        </CollapsibleSection>
                    ))}
                </div>
            )}

            {/* Concepts */}
            <CollapsibleSection
                id="concepts"
                title="Key Concepts"
                icon={<Brain size={18} />}
                expanded={expandedSections.has('concepts')}
                onToggle={() => toggleSection('concepts')}
            >
                {hasDetailedConcepts ? (
                    <div className="space-y-4">
                        {(course.concepts as ConceptItem[]).map((concept, i) => (
                            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <span className="text-xs font-bold text-gray-400 mt-1">0{i + 1}</span>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{concept.term}</h4>
                                        <MathRenderer
                                            content={concept.definition}
                                            className="text-sm text-gray-600 dark:text-gray-300"
                                        />
                                        {concept.example && (
                                            <div className="text-sm text-indigo-600 dark:text-indigo-400">
                                                <span className="font-semibold">Example:</span> {concept.example}
                                            </div>
                                        )}
                                        {concept.importance && (
                                            <div className="text-xs text-gray-500 italic">
                                                Why it matters: {concept.importance}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {(course.concepts as string[]).map((concept, i) => (
                            <div key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <span className="text-xs font-bold text-gray-400">0{i + 1}</span>
                                <span>{concept}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CollapsibleSection>

            {/* Practical Guide */}
            <CollapsibleSection
                id="guide"
                title="Practical Guide"
                icon={<ListChecks size={18} />}
                expanded={expandedSections.has('guide')}
                onToggle={() => toggleSection('guide')}
            >
                {hasStructuredGuide ? (
                    <div className="space-y-6">
                        {/* Steps */}
                        <div className="space-y-4">
                            {(course.practicalGuide as EnhancedPracticalGuide).steps.map((step) => (
                                <div key={step.stepNumber} className="flex gap-4">
                                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">
                                            {step.stepNumber}
                                        </span>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{step.title}</h4>
                                        <MathRenderer
                                            content={step.description}
                                            className="text-sm text-gray-600 dark:text-gray-300"
                                        />
                                        {step.tips.length > 0 && (
                                            <ul className="space-y-1 mt-2">
                                                {step.tips.map((tip, i) => (
                                                    <li key={i} className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                        <Lightbulb size={12} />
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Common Mistakes */}
                        {(course.practicalGuide as EnhancedPracticalGuide).commonMistakes?.length > 0 && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50">
                                <h4 className="text-sm font-bold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Common Mistakes to Avoid
                                </h4>
                                <ul className="space-y-1">
                                    {(course.practicalGuide as EnhancedPracticalGuide).commonMistakes.map((mistake, i) => (
                                        <li key={i} className="text-sm text-red-600 dark:text-red-400">• {mistake}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Pro Tips */}
                        {(course.practicalGuide as EnhancedPracticalGuide).proTips?.length > 0 && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                                <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                                    <Sparkles size={16} />
                                    Pro Tips
                                </h4>
                                <ul className="space-y-1">
                                    {(course.practicalGuide as EnhancedPracticalGuide).proTips.map((tip, i) => (
                                        <li key={i} className="text-sm text-emerald-600 dark:text-emerald-400">✨ {tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <MathRenderer
                            content={course.practicalGuide as string}
                            className="text-gray-700 dark:text-gray-300"
                        />
                    </div>
                )}
            </CollapsibleSection>

            {/* Tasks */}
            {course.tasks && course.tasks.length > 0 && (
                <CollapsibleSection
                    id="tasks"
                    title={`Action Tasks (${completedTasksCount}/${totalTasks})`}
                    icon={<CheckCircle size={18} />}
                    expanded={expandedSections.has('tasks')}
                    onToggle={() => toggleSection('tasks')}
                >
                    <div className="space-y-3">
                        {course.tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-4 rounded-xl border transition-all ${completedTasks.has(task.id)
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => handleTaskComplete(task.id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${completedTasks.has(task.id)
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
                                            }`}
                                    >
                                        {completedTasks.has(task.id) && <CheckCircle size={14} />}
                                    </button>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <TaskTypeBadge type={task.type} />
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {task.estimatedMinutes}m
                                            </span>
                                        </div>
                                        <p className={`font-medium ${completedTasks.has(task.id) ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                            {task.instruction}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            <span className="font-semibold">Deliverable:</span> {task.deliverable}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Checkpoints */}
            {course.checkpoints && course.checkpoints.length > 0 && (
                <CollapsibleSection
                    id="checkpoints"
                    title="Self-Check Questions"
                    icon={<GraduationCap size={18} />}
                    expanded={expandedSections.has('checkpoints')}
                    onToggle={() => toggleSection('checkpoints')}
                >
                    <div className="space-y-4">
                        {course.checkpoints.map((checkpoint, index) => (
                            <div
                                key={checkpoint.id}
                                className={`p-5 rounded-xl border ${answeredCheckpoints.has(checkpoint.id)
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-3">
                                            <span className="text-xs font-bold text-gray-400 mt-1">Q{index + 1}</span>
                                            <p className="font-medium text-gray-900 dark:text-white">{checkpoint.question}</p>
                                        </div>
                                        {answeredCheckpoints.has(checkpoint.id) && (
                                            <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                        )}
                                    </div>

                                    {!answeredCheckpoints.has(checkpoint.id) && (
                                        <>
                                            <textarea
                                                value={checkpointAnswers[checkpoint.id] || ''}
                                                onChange={(e) => setCheckpointAnswers(prev => ({ ...prev, [checkpoint.id]: e.target.value }))}
                                                placeholder="Write your answer..."
                                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 resize-none"
                                                rows={3}
                                            />
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => setShowHint(showHint === checkpoint.id ? null : checkpoint.id)}
                                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                                >
                                                    <Lightbulb size={14} />
                                                    {showHint === checkpoint.id ? 'Hide hint' : 'Need a hint?'}
                                                </button>
                                                <button
                                                    onClick={() => handleCheckpointSubmit(checkpoint.id)}
                                                    disabled={!checkpointAnswers[checkpoint.id]?.trim()}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                                                >
                                                    Submit Answer
                                                </button>
                                            </div>
                                            {showHint === checkpoint.id && (
                                                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                                        💡 {checkpoint.hint}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {answeredCheckpoints.has(checkpoint.id) && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-semibold">Success Criteria:</span> {checkpoint.successCriteria}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* References */}
            {course.references && course.references.length > 0 && (
                <CollapsibleSection
                    id="references"
                    title="References & Further Reading"
                    icon={<BookMarked size={18} />}
                    expanded={expandedSections.has('references')}
                    onToggle={() => toggleSection('references')}
                >
                    <div className="space-y-3">
                        {course.references.map((ref, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <ReferenceTypeBadge type={ref.type} />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{ref.title}</p>
                                    <p className="text-sm text-gray-500">{ref.description}</p>
                                    {ref.url && (
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            <ExternalLink size={12} />
                                            View resource
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Expert Tip */}
            <div className="p-5 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/50">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg text-white">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-1 block">
                            Expert Insight
                        </span>
                        <p className="text-sm text-purple-800 dark:text-purple-200 italic leading-relaxed">
                            "{course.expertTip}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Formative Action */}
            <div className={`p-6 rounded-2xl border relative overflow-hidden ${isFormativeCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                }`}>
                <div className="absolute top-4 right-4 opacity-10">
                    <Zap size={80} />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-widest ${isFormativeCompleted ? 'text-emerald-600' : 'text-blue-600'
                            }`}>
                            Formative Verification
                        </span>
                        {isFormativeCompleted && <CheckCircle className="text-emerald-500" size={24} />}
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                        "{course.formativeAction}"
                    </p>
                    {!isFormativeCompleted && (
                        <button
                            onClick={onFormativeComplete}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all"
                        >
                            Verify Task Completion
                        </button>
                    )}
                </div>
            </div>

            {/* Next Steps */}
            {course.nextSteps && (
                <div className="p-5 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 block">
                        What's Next?
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">{course.nextSteps}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    disabled={!isFormativeCompleted}
                    onClick={onStartDebate}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                >
                    <Sword size={20} />
                    Start Mastery Debate
                    <ChevronRight size={18} />
                </button>
                <p className="text-xs text-gray-400 text-center sm:text-left">
                    Complete the formative task to unlock debate mode
                </p>
            </div>
        </div>
    );
}

// ==================== HELPER COMPONENTS ====================

function CollapsibleSection({
    id,
    title,
    icon,
    children,
    expanded,
    onToggle,
}: {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    key?: string;
}) {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-indigo-500">{icon}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expanded && (
                <div className="p-5 bg-white dark:bg-gray-900 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

function TaskTypeBadge({ type }: { type: CourseTask['type'] }) {
    const styles = {
        action: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        reflection: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        research: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        practice: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    };

    const icons = {
        action: <Play size={12} />,
        reflection: <Brain size={12} />,
        research: <FileText size={12} />,
        practice: <Target size={12} />,
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${styles[type]}`}>
            {icons[type]}
            {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
    );
}

function ReferenceTypeBadge({ type }: { type: Reference['type'] }) {
    const styles = {
        book: 'bg-amber-100 text-amber-700',
        article: 'bg-blue-100 text-blue-700',
        web: 'bg-emerald-100 text-emerald-700',
        video: 'bg-red-100 text-red-700',
    };

    const icons = {
        book: '📚',
        article: '📄',
        web: '🌐',
        video: '🎥',
    };

    return (
        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${styles[type]}`}>
            {icons[type]}
        </span>
    );
}
