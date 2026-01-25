/**
 * Enhanced BlockEditor Component
 * 
 * Features:
 * - Block-based content system (text, heading, code, image, math, quiz, milestones)
 * - Native Drag and Drop reordering (BLK-007)
 * - Academic blocks: Math (KaTeX), Quiz, Milestone Ref (BLK-010-BLK-015)
 * - AI Content Generation (BLK-020)
 * - Real-time auto-saving
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Trash2, GripVertical, ChevronUp, ChevronDown,
    Type, Heading1, Image as ImageIcon, Code, CheckSquare,
    Target, HelpCircle, FileText, Minus, Info, Save,
    Loader2, MoreVertical, Layout, Sparkles, Sigma, ListChecks,
    Flag, ExternalLink, RefreshCw, Wand2, CheckCircle2, X, ChevronRight,
    Quote, Download, BookMarked, ArrowDown, ArrowUp, FileDown, BookOpen,
    Lightbulb, MessageSquare, BarChart3, Paperclip
} from 'lucide-react';
import { blocksApi, ContentBlock, ContentBlockType } from '../services/blocksApi';
import { generateDraft } from '../services/geminiService';
import { exportToMarkdown, downloadFile, printToPDF } from '../services/exportService';
import { exportApi, GoogleDriveFolder } from '../services/exportApi';
import { ACADEMIC_TEMPLATES, AcademicTemplate } from '../services/templateService';
import MathRenderer from './MathRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudSync, Folder, FolderPlus, Check, X as XIcon, ChevronLeft } from 'lucide-react';

// For KaTeX TypeScript support
declare global {
    interface Window {
        katex: any;
    }
}

interface BlockEditorProps {
    assignmentId: string;
    onUpdate?: () => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ assignmentId, onUpdate }) => {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeBlock, setActiveBlock] = useState<string | null>(null);
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

    // Folder selection state
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [driveFolders, setDriveFolders] = useState<GoogleDriveFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<GoogleDriveFolder | null>(null);
    const [folderLoading, setFolderLoading] = useState(false);

    // Initialize/Load blocks
    const loadBlocks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await blocksApi.getBlocks(assignmentId);
            setBlocks(data);
        } catch (error) {
            console.error('Failed to load blocks:', error);
        } finally {
            setLoading(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        loadBlocks();
    }, [loadBlocks]);

    // Handle adding a new block
    const handleAddBlock = async (type: ContentBlockType, index?: number) => {
        const defaultContent = {
            text: '',
            heading: 'New Heading',
            image: 'https://images.unsplash.com/photo-1454165833767-02a6ed30cc67?auto=format&fit=crop&q=80&w=1000',
            code: '// Write code here\nconsole.log("Hello KALA");',
            task: 'New actionable task',
            milestone: 'Select milestone...',
            quiz: 'Title: Quiz Name\nQ1: Question?\nA1: Option 1\nA2: Option 2\nC: 0',
            file: 'Attach file...',
            divider: '---',
            callout: 'Important note...',
            math: '\\int_{a}^{b} f(x)dx = F(b) - F(a)',
            milestone_ref: 'Select milestone...',
            citation: 'Author (Year). Title. Journal/Publisher.',
            reflection: 'What insights did I gain today? How does this connect to my existing knowledge?',
            debate: 'State your position on this topic...',
            progress: '50',
            file_embed: 'Select a file from your vault...'
        };

        try {
            const newBlock = await blocksApi.createBlock({
                assignmentId,
                type,
                content: defaultContent[type],
                sortOrder: index !== undefined ? index : blocks.length,
                metadata: {}
            });

            const newBlocks = [...blocks];
            if (index !== undefined) {
                newBlocks.splice(index, 0, newBlock);
                setBlocks(newBlocks);
                await handleReorder(newBlocks.map(b => b.id));
            } else {
                setBlocks([...blocks, newBlock]);
            }
            setActiveBlock(newBlock.id);
        } catch (error) {
            console.error('Failed to add block:', error);
        }
    };

    const handleUpdateBlock = async (id: string, updates: Partial<ContentBlock>) => {
        setSaving(true);
        try {
            const updated = await blocksApi.updateBlock(id, updates);
            setBlocks(blocks.map(b => b.id === id ? updated : b));
        } catch (error) {
            console.error('Failed to update block:', error);
        } finally {
            setTimeout(() => setSaving(false), 500);
        }
    };

    const handleDeleteBlock = async (id: string) => {
        try {
            await blocksApi.deleteBlock(id);
            setBlocks(blocks.filter(b => b.id !== id));
        } catch (error) {
            console.error('Failed to delete block:', error);
        }
    };

    const handleReorder = async (newOrder: string[]) => {
        try {
            await blocksApi.reorderBlocks(assignmentId, newOrder);
            // After reorder, we might want to refresh but local state is usually enough
        } catch (error) {
            console.error('Failed to reorder blocks:', error);
        }
    };

    const handleApplyTemplate = async (template: AcademicTemplate) => {
        setLoading(true);
        try {
            const created = await blocksApi.createBlocksBulk(assignmentId, template.blocks);
            setBlocks(created);
            if (created.length > 0) setActiveBlock(created[0].id);
        } catch (error) {
            console.error('Failed to apply template:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDriveFolders = async () => {
        setFolderLoading(true);
        try {
            const folders = await exportApi.listFolders();
            setDriveFolders(folders);
        } catch (error: any) {
            console.error('Failed to fetch Drive folders:', error);
            if (error.status === 401) {
                if (window.confirm("Google Drive not connected. Connect now?")) {
                    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google/drive`;
                }
            }
        } finally {
            setFolderLoading(false);
        }
    };

    const handleOpenFolderPicker = () => {
        setShowFolderModal(true);
        fetchDriveFolders();
    };

    // Drag and Drop handlers
    const onDragStart = (e: React.DragEvent, id: string) => {
        setDraggedBlockId(id);
        e.dataTransfer.setData('blockId', id);
        e.dataTransfer.effectAllowed = 'move';

        // Custom ghost image
        const ghost = document.createElement('div');
        ghost.classList.add('bg-blue-500', 'px-4', 'py-2', 'rounded-lg', 'text-white', 'text-xs', 'font-bold');
        ghost.innerText = 'Moving block';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = async (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const blockId = e.dataTransfer.getData('blockId');
        if (!blockId) return;

        const sourceIndex = blocks.findIndex(b => b.id === blockId);
        if (sourceIndex === targetIndex) return;

        const newBlocks = [...blocks];
        const [removed] = newBlocks.splice(sourceIndex, 1);
        newBlocks.splice(targetIndex, 0, removed);

        setBlocks(newBlocks);
        setDraggedBlockId(null);
        await handleReorder(newBlocks.map(b => b.id));
    };

    const handleExportMarkdown = () => {
        const md = exportToMarkdown(blocks, "KALA Assignment Draft");
        downloadFile(md, "kala-draft.md", "text/markdown");
    };

    const handleExportPDF = () => {
        printToPDF();
    };

    const handleExportGoogleDrive = async () => {
        const md = exportToMarkdown(blocks, "KALA Assignment Draft");
        setSaving(true);
        try {
            const result = await exportApi.exportToGoogleDrive("KALA Draft", md, selectedFolder?.id);
            alert(`Draft synced to Google Drive in folder: ${selectedFolder?.name || 'KALA'}! Link: ${result.link}`);
            setShowFolderModal(false);
        } catch (error: any) {
            console.error('Google Drive Sync Error:', error);
            if (error.status === 401) {
                if (window.confirm("Google Drive not connected or permissions missing. Connect now?")) {
                    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google/drive`;
                }
            } else {
                alert(`Sync failed: ${error.message}`);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={40} className="animate-spin text-blue-500" />
                <p className="text-gray-500 font-medium">Building your workspace...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 pb-40 px-4">
            <AnimatePresence mode="popLayout">
                {blocks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-20 flex flex-col items-center"
                    >
                        <div className="text-center mb-16 space-y-4">
                            <div className="w-20 h-20 bg-blue-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl mb-8">
                                <Sparkles size={40} />
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Initialize Your Workspace</h3>
                            <p className="text-gray-500 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-60 italic">
                                Draft your assignment using a block-based architecture or kickstart with an academic blueprint.
                            </p>
                        </div>

                        {/* Template Picker */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
                            {ACADEMIC_TEMPLATES.map(tpl => (
                                <button
                                    key={tpl.id}
                                    onClick={() => handleApplyTemplate(tpl)}
                                    className="p-10 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all text-left flex flex-col group/tpl overflow-hidden relative"
                                >
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full group-hover/tpl:scale-150 transition-transform duration-700" />
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl w-fit mb-6 text-blue-500 group-hover/tpl:bg-blue-500 group-hover/tpl:text-white transition-colors">
                                        {/* Dynamic Icon selection could be more robust, using fallback icon for now */}
                                        <FileText size={24} />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-none">{tpl.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal opacity-70 mb-8">{tpl.description}</p>
                                    <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
                                        Use Template <ChevronRight size={14} className="group-hover/tpl:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Or Start Fresh</span>
                            <div className="flex flex-wrap justify-center gap-3">
                                <AddBlockButton onClick={(t) => handleAddBlock(t)} variant="large" />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-2">
                        {blocks.map((block, index) => (
                            <motion.div
                                key={block.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`relative group ${draggedBlockId === block.id ? 'opacity-30' : ''}`}
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, index)}
                            >
                                {/* Insertion Point Above */}
                                <div className="absolute -top-4 left-0 right-0 h-8 z-10 opacity-0 group-hover:opacity-100 transition-all flex justify-center items-center">
                                    <InsertButton onClick={(t) => handleAddBlock(t, index)} />
                                </div>

                                <BlockWrapper
                                    block={block}
                                    isActive={activeBlock === block.id}
                                    onSelect={() => setActiveBlock(block.id)}
                                    onDelete={() => handleDeleteBlock(block.id)}
                                    onDragStart={(e) => onDragStart(e, block.id)}
                                >
                                    <BlockContent
                                        block={block}
                                        assignmentContext={assignmentId} // Ideally pass title/desc too
                                        isActive={activeBlock === block.id}
                                        onChange={(content, metadata) => handleUpdateBlock(block.id, { content, metadata })}
                                        onAddBelow={(type) => handleAddBlock(type, index + 1)}
                                        onDelete={() => handleDeleteBlock(block.id)}
                                        onFocusPrev={() => index > 0 && setActiveBlock(blocks[index - 1].id)}
                                        onFocusNext={() => index < blocks.length - 1 && setActiveBlock(blocks[index + 1].id)}
                                    />
                                </BlockWrapper>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Final Insertion Point */}
            {blocks.length > 0 && (
                <div className="pt-8 flex justify-center">
                    <AddBlockButton onClick={(t) => handleAddBlock(t)} variant="large" />
                </div>
            )}

            {/* Syncing/Status Indicator */}
            <div className="fixed bottom-10 right-10 flex flex-col items-end gap-3 z-50">
                {saving && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-3"
                    >
                        <RefreshCw size={14} className="animate-spin text-blue-500" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Syncing...</span>
                    </motion.div>
                )}
                <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10">
                    <div className="flex gap-2 mr-2 border-r border-white/20 dark:border-gray-200 pr-4">
                        <button
                            onClick={handleExportMarkdown}
                            title="Export to Markdown"
                            className="p-2 hover:bg-white/10 dark:hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <FileDown size={18} />
                        </button>
                        <button
                            onClick={handleExportPDF}
                            title="Print / Export to PDF"
                            className="p-2 hover:bg-white/10 dark:hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <Download size={18} />
                        </button>
                        <button
                            onClick={handleOpenFolderPicker}
                            title="Sync to Google Drive"
                            className="p-2 hover:bg-white/10 dark:hover:bg-gray-100 rounded-xl transition-colors text-blue-400"
                        >
                            <CloudSync size={18} />
                        </button>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Workspace</p>
                        <p className="text-xs font-black">{blocks.length} Blocks Active</p>
                    </div>
                </div>
            </div>

            {/* Folder Picker Modal */}
            <AnimatePresence>
                {showFolderModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Target Directory</h3>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Google Drive Sync</p>
                                    </div>
                                    <button onClick={() => setShowFolderModal(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                                        <XIcon size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    <button
                                        onClick={() => setSelectedFolder(null)}
                                        className={`w-full p-5 rounded-[2rem] flex items-center gap-4 transition-all border ${!selectedFolder ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-gray-200'}`}
                                    >
                                        <div className={`p-3 rounded-xl ${!selectedFolder ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                            <Folder size={20} />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">Default Cluster</p>
                                            <p className="text-[10px] font-medium text-gray-400">Folder: /KALA</p>
                                        </div>
                                        {!selectedFolder && <Check size={20} className="text-blue-500" />}
                                    </button>

                                    <div className="h-px bg-gray-100 dark:bg-white/5 my-2" />

                                    {folderLoading ? (
                                        <div className="py-10 flex flex-col items-center gap-3 opacity-40">
                                            <Loader2 size={32} className="animate-spin text-blue-500" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Scanning Drive...</p>
                                        </div>
                                    ) : driveFolders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => setSelectedFolder(folder)}
                                            className={`w-full p-5 rounded-[2rem] flex items-center gap-4 transition-all border ${selectedFolder?.id === folder.id ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-gray-200'}`}
                                        >
                                            <div className={`p-3 rounded-xl ${selectedFolder?.id === folder.id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                                <Folder size={20} />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white">{folder.name}</p>
                                            </div>
                                            {selectedFolder?.id === folder.id && <Check size={20} className="text-blue-500" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        onClick={handleExportGoogleDrive}
                                        disabled={saving}
                                        className="flex-1 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <CloudSync size={18} />}
                                        Confirm & Sync
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ==================== SUB-COMPONENTS ====================

const BlockWrapper: React.FC<{
    block: ContentBlock;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onDragStart: (e: React.DragEvent) => void;
    children: React.ReactNode;
}> = ({ block, isActive, onSelect, onDelete, onDragStart, children }) => {
    return (
        <div
            onClick={onSelect}
            className={`relative p-6 rounded-[2.5rem] transition-all duration-300 ${isActive
                ? 'bg-white dark:bg-gray-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-blue-500/20 ring-1 ring-blue-500/10'
                : 'bg-transparent border border-transparent hover:bg-white/50 dark:hover:bg-gray-800/30'
                }`}
        >
            {/* Draggable Handle */}
            <div
                draggable
                onDragStart={onDragStart}
                className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100`}
            >
                <GripVertical size={20} />
            </div>

            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className={`absolute right-4 top-4 p-2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20`}
            >
                <X size={16} />
            </button>

            {children}
        </div>
    );
};

const BlockContent: React.FC<{
    block: ContentBlock;
    assignmentContext: string;
    isActive: boolean;
    onChange: (content: string, metadata?: Record<string, any>) => void;
    onAddBelow: (type: ContentBlockType) => void;
    onDelete: () => void;
    onFocusPrev: () => void;
    onFocusNext: () => void;
}> = ({ block, assignmentContext, isActive, onChange, onAddBelow, onDelete, onFocusPrev, onFocusNext }) => {
    const [localContent, setLocalContent] = useState(block.content);
    const [aiLoading, setAiLoading] = useState(false);
    const [showMathTemplates, setShowMathTemplates] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isActive && textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [isActive]);

    useEffect(() => {
        setLocalContent(block.content);
    }, [block.content]);

    useEffect(() => {
        // Handled by MathRenderer component now
    }, [block.type, localContent]);

    const handleBlur = () => {
        if (localContent !== block.content) {
            onChange(localContent);
        }
    };

    const handleAiGenerate = async () => {
        const prompt = window.prompt("What should KALA draft for you? (e.g., 'Summarize the impact of climate change on agriculture')");
        if (!prompt) return;

        setAiLoading(true);
        try {
            const draft = await generateDraft(prompt, assignmentContext);
            setLocalContent(draft);
            onChange(draft);
        } catch (error) {
            console.error('AI Draft Error:', error);
            alert('AI draft failed');
        } finally {
            setAiLoading(false);
        }
    };

    const blockTypeIcon = () => {
        switch (block.type) {
            case 'heading': return <Heading1 size={14} className="text-blue-500" />;
            case 'math': return <Sigma size={14} className="text-purple-500" />;
            case 'code': return <Code size={14} className="text-orange-500" />;
            case 'callout': return <Info size={14} className="text-emerald-500" />;
            case 'quiz': return <ListChecks size={14} className="text-rose-500" />;
            case 'milestone_ref': return <Flag size={14} className="text-amber-500" />;
            case 'citation': return <Quote size={14} className="text-amber-600" />;
            case 'reflection': return <Lightbulb size={14} className="text-yellow-500" />;
            case 'debate': return <MessageSquare size={14} className="text-indigo-500" />;
            case 'progress': return <BarChart3 size={14} className="text-cyan-500" />;
            case 'file_embed': return <Paperclip size={14} className="text-pink-500" />;
            default: return null;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && block.type === 'text') {
            e.preventDefault();
            onAddBelow('text');
        } else if (e.key === 'Backspace' && !localContent && block.type === 'text') {
            e.preventDefault();
            onDelete();
        } else if (e.key === 'ArrowUp' && (textAreaRef.current?.selectionStart === 0 || block.type !== 'text')) {
            onFocusPrev();
        } else if (e.key === 'ArrowDown' && (textAreaRef.current?.selectionStart === localContent.length || block.type !== 'text')) {
            onFocusNext();
        }
    };

    const mathTemplates = [
        { label: 'Fraction', latex: '\\frac{a}{b}' },
        { label: 'Sum', latex: '\\sum_{i=1}^{n} x_i' },
        { label: 'Integral', latex: '\\int_{a}^{b} f(x) dx' },
        { label: 'Root', latex: '\\sqrt{x}' },
        { label: 'Limit', latex: '\\lim_{x \\to \\infty}' }
    ];

    return (
        <div className="space-y-3">
            {/* Block Metadata/Type Indicator */}
            {block.type !== 'text' && (
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 px-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-1.5 shadow-sm">
                        {blockTypeIcon()}
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            {block.type.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            )}

            {/* AI Action Button (for text blocks) */}
            {block.type === 'text' && !localContent && (
                <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="flex items-center gap-2 text-xs font-bold text-blue-500/50 hover:text-blue-500 transition-all h-6 group/ai"
                >
                    {aiLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : (
                        <Wand2 size={12} className="group-hover/ai:animate-bounce" />
                    )}
                    Draft with AI...
                </button>
            )}

            {/* Render Content based on Type */}
            <div className="relative group/content">
                {block.type === 'text' && (
                    <>
                        {isActive ? (
                            <textarea
                                ref={textAreaRef}
                                value={localContent}
                                onChange={(e) => setLocalContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                placeholder="Synthesize your thoughts or / to insert..."
                                dir={/[\u0600-\u06FF]/.test(localContent) ? "rtl" : "ltr"}
                                className={`w-full bg-transparent border-none focus:ring-0 text-xl font-medium text-gray-700 dark:text-gray-300 leading-relaxed resize-none min-h-[40px] ${/[\u0600-\u06FF]/.test(localContent) ? 'font-arabic' : ''}`}
                                style={{ height: 'auto' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                }}
                            />
                        ) : (
                            <MathRenderer
                                content={localContent || "Click to add content..."}
                                className={`text-xl font-medium text-gray-700 dark:text-gray-300 ${!localContent ? 'opacity-30 italic' : ''}`}
                            />
                        )}
                        {localContent && (
                            <button onClick={handleAiGenerate} className="absolute -right-10 top-2 p-2 text-gray-200 hover:text-blue-400 transition-all opacity-0 group-hover/content:opacity-100">
                                <Wand2 size={16} />
                            </button>
                        )}
                    </>
                )}

                {block.type === 'heading' && (
                    <input
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="Conceptual Milestone..."
                        dir={/[\u0600-\u06FF]/.test(localContent) ? "rtl" : "ltr"}
                        className={`w-full bg-transparent border-none focus:ring-0 text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none ${/[\u0600-\u06FF]/.test(localContent) ? 'font-arabic' : ''}`}
                    />
                )}

                {block.type === 'math' && (
                    <div className="space-y-4">
                        {isActive ? (
                            <div className="space-y-2">
                                <div className="flex gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                    {mathTemplates.map(t => (
                                        <button
                                            key={t.label}
                                            onClick={() => {
                                                const newContent = localContent + t.latex;
                                                setLocalContent(newContent);
                                                onChange(newContent);
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    ref={textAreaRef}
                                    value={localContent}
                                    onChange={(e) => setLocalContent(e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-purple-500/20 rounded-xl p-3 font-mono text-sm text-purple-600 dark:text-purple-400 focus:ring-0 transition-all"
                                    placeholder="LaTeX Formula..."
                                />
                            </div>
                        ) : null}
                        <div className="p-8 bg-purple-50/30 dark:bg-purple-900/10 rounded-2xl flex items-center justify-center text-2xl">
                            <MathRenderer content={`$$${localContent}$$`} />
                        </div>
                    </div>
                )}

                {block.type === 'citation' && (
                    <div className="p-8 bg-amber-50/30 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-500/10 flex gap-6 items-start relative group/citation">
                        <div className="p-4 bg-amber-500 text-white rounded-[1.5rem] shadow-xl shrink-0"><Quote size={24} /></div>
                        <textarea
                            ref={textAreaRef}
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-serif italic text-amber-900 dark:text-amber-200 tracking-tight leading-snug resize-none"
                            style={{ height: 'auto' }}
                            placeholder="Academic citation..."
                        />
                    </div>
                )}

                {block.type === 'code' && (
                    <div className="bg-gray-950 rounded-[2rem] p-8 font-mono text-sm shadow-2xl relative group/code overflow-hidden border border-white/5">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-orange-400/80 text-[10px] font-black uppercase tracking-[0.2em]">{block.metadata?.language || 'javascript'}</span>
                            <div className="flex gap-4 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                {['js', 'ts', 'py', 'sql'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => onChange(localContent, { ...block.metadata, language: lang })}
                                        className={`text-[9px] font-bold uppercase transition-colors ${block.metadata?.language === lang ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            onBlur={handleBlur}
                            className="w-full bg-transparent border-none focus:ring-0 text-amber-50 leading-relaxed resize-none scrollbar-hide"
                            style={{ height: 'auto' }}
                        />
                    </div>
                )}

                {block.type === 'callout' && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 p-10 rounded-[2.5rem] flex gap-8 items-start relative group/callout">
                        <div className="p-4 bg-emerald-100 dark:bg-emerald-800 rounded-3xl shrink-0 shadow-lg text-emerald-600 dark:text-emerald-400">
                            <Info size={32} />
                        </div>
                        <textarea
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            onBlur={handleBlur}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-2xl font-black text-emerald-900 dark:text-emerald-300 tracking-tight leading-snug resize-none"
                            style={{ height: 'auto' }}
                        />
                    </div>
                )}

                {block.type === 'image' && (
                    <div className="space-y-4">
                        <div className="relative group/img rounded-[3rem] overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                            <img src={localContent} alt="Draft visual" className="w-full object-cover max-h-[600px]" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center p-12">
                                <input
                                    type="text"
                                    value={localContent}
                                    onChange={(e) => setLocalContent(e.target.value)}
                                    onBlur={handleBlur}
                                    placeholder="Image URL..."
                                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <p className="text-[10px] text-white/60 mt-4 font-bold uppercase tracking-widest leading-none">Paste Image Address</p>
                            </div>
                        </div>
                    </div>
                )}

                {block.type === 'milestone_ref' && (
                    <div className="p-8 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30 flex items-center justify-between hover:border-amber-500 transition-all cursor-pointer group/milestone">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-amber-500 text-white rounded-[1.5rem] shadow-xl"><Flag size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1 leading-none">Milestone Reference</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{localContent}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-amber-500 opacity-0 group-hover/milestone:opacity-100 group-hover/milestone:translate-x-2 transition-all" />
                    </div>
                )}

                {block.type === 'quiz' && (
                    <div className="bg-rose-50/50 dark:bg-rose-900/10 p-10 rounded-[3rem] border border-rose-100 dark:border-rose-900/30">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg"><ListChecks size={20} /></div>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Diagnostic Quiz Block</h4>
                        </div>
                        <textarea
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            onBlur={handleBlur}
                            className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 font-mono text-xs border-transparent focus:border-rose-300 focus:ring-0 transition-all text-gray-600 dark:text-gray-400"
                            rows={6}
                        />
                        <button className="mt-6 w-full py-4 bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-[1.5rem] shadow-xl hover:bg-rose-700 transition-all">Preview Interactive Quiz</button>
                    </div>
                )}

                {/* ABL-007: Reflection Block - Journaling Prompt */}
                {block.type === 'reflection' && (
                    <div className="bg-yellow-50/50 dark:bg-yellow-900/10 p-10 rounded-[3rem] border border-yellow-100 dark:border-yellow-900/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="flex items-center gap-4 mb-8 relative">
                            <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-[1.5rem] shadow-xl">
                                <Lightbulb size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600/60 mb-1 leading-none">Reflection Prompt</p>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Journaling Space</h4>
                            </div>
                        </div>
                        <textarea
                            ref={textAreaRef}
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            placeholder="Reflect on your learning journey... What insights emerged?"
                            className="w-full bg-white/80 dark:bg-gray-800/50 backdrop-blur rounded-[2rem] p-8 text-lg text-gray-700 dark:text-gray-300 border border-yellow-200/50 dark:border-yellow-900/30 focus:border-yellow-400 focus:ring-0 transition-all leading-relaxed min-h-[150px] resize-none font-medium"
                        />
                        <div className="flex items-center justify-between mt-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/50">Private journaling - Not shared with AI</span>
                            <div className="flex items-center gap-2 text-yellow-600">
                                <CheckCircle2 size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Auto-saved</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABL-008: Debate Block - Launches Debate Mode */}
                {block.type === 'debate' && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                        <div className="flex items-center gap-4 mb-8 relative">
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[1.5rem] shadow-xl">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 mb-1 leading-none">Debate Prompt</p>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Position Statement</h4>
                            </div>
                        </div>
                        <textarea
                            ref={textAreaRef}
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            placeholder="State your position on this topic. Be clear and argumentative..."
                            className="w-full bg-white/80 dark:bg-gray-800/50 backdrop-blur rounded-[2rem] p-8 text-lg text-gray-700 dark:text-gray-300 border border-indigo-200/50 dark:border-indigo-900/30 focus:border-indigo-400 focus:ring-0 transition-all leading-relaxed min-h-[120px] resize-none font-medium"
                        />
                        <button className="mt-6 w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-[1.5rem] shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-3">
                            <MessageSquare size={18} />
                            Launch Socratic Debate Mode
                        </button>
                    </div>
                )}

                {/* ABL-012: Progress Block - Progress Bar */}
                {block.type === 'progress' && (
                    <div className="bg-cyan-50/50 dark:bg-cyan-900/10 p-10 rounded-[3rem] border border-cyan-100 dark:border-cyan-900/30">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-[1.5rem] shadow-xl">
                                <BarChart3 size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60 mb-1 leading-none">Progress Tracker</p>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Milestone Completion</h4>
                            </div>
                            <div className="text-4xl font-black text-cyan-600 dark:text-cyan-400">{localContent}%</div>
                        </div>
                        <div className="relative h-6 bg-gray-200/80 dark:bg-gray-700/50 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, parseInt(localContent) || 0))}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 mix-blend-difference">{localContent}% Complete</span>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={parseInt(localContent) || 0}
                                onChange={(e) => { setLocalContent(e.target.value); onChange(e.target.value); }}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={localContent}
                                onChange={(e) => setLocalContent(e.target.value)}
                                onBlur={handleBlur}
                                className="w-20 px-4 py-2 bg-white dark:bg-gray-800 border border-cyan-200 dark:border-cyan-800 rounded-xl text-center font-black text-cyan-600"
                            />
                        </div>
                    </div>
                )}

                {/* ABL-014: File Embed Block - Link to Vault File */}
                {block.type === 'file_embed' && (
                    <div className="bg-pink-50/50 dark:bg-pink-900/10 p-10 rounded-[3rem] border border-pink-100 dark:border-pink-900/30 hover:border-pink-300 transition-all cursor-pointer group/file">
                        <div className="flex items-center gap-6">
                            <div className="p-5 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-[1.5rem] shadow-xl group-hover/file:scale-110 transition-transform">
                                <Paperclip size={28} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-pink-500/60 mb-1 leading-none">Attached File</p>
                                <input
                                    value={localContent}
                                    onChange={(e) => setLocalContent(e.target.value)}
                                    onBlur={handleBlur}
                                    placeholder="Enter file path or click to select from vault..."
                                    className="w-full text-xl font-black text-gray-900 dark:text-white tracking-tight bg-transparent border-none focus:ring-0 p-0"
                                />
                            </div>
                            <button className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-2xl text-pink-600 hover:bg-pink-200 dark:hover:bg-pink-800/50 transition-colors opacity-0 group-hover/file:opacity-100">
                                <ExternalLink size={20} />
                            </button>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <button className="flex-1 py-4 bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors flex items-center justify-center gap-2">
                                <Paperclip size={14} />
                                Select from Vault
                            </button>
                            <button className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all flex items-center justify-center gap-2">
                                <ExternalLink size={14} />
                                Open Preview
                            </button>
                        </div>
                    </div>
                )}

                {block.type === 'divider' && <div className="h-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent my-12" />}
            </div>
        </div>
    );
};

// ==================== UI BUTTONS ====================

const AddBlockButton: React.FC<{ onClick: (type: ContentBlockType) => void, variant?: 'small' | 'large' }> = ({ onClick, variant = 'small' }) => {
    const [showOptions, setShowOptions] = useState(false);

    const types: { type: ContentBlockType, icon: any, label: string, color: string }[] = [
        { type: 'text', icon: Type, label: 'Text', color: 'text-gray-500' },
        { type: 'heading', icon: Heading1, label: 'Heading', color: 'text-blue-500' },
        { type: 'math', icon: Sigma, label: 'Math', color: 'text-purple-500' },
        { type: 'image', icon: ImageIcon, label: 'Image', color: 'text-indigo-500' },
        { type: 'code', icon: Code, label: 'Code', color: 'text-orange-500' },
        { type: 'callout', icon: Info, label: 'Callout', color: 'text-emerald-500' },
        { type: 'milestone_ref', icon: Flag, label: 'Milestone', color: 'text-amber-500' },
        { type: 'citation', icon: Quote, label: 'Citation', color: 'text-amber-600' },
        { type: 'reflection', icon: Lightbulb, label: 'Reflection', color: 'text-yellow-500' },
        { type: 'debate', icon: MessageSquare, label: 'Debate', color: 'text-indigo-500' },
        { type: 'progress', icon: BarChart3, label: 'Progress', color: 'text-cyan-500' },
        { type: 'file_embed', icon: Paperclip, label: 'File', color: 'text-pink-500' },
        { type: 'divider', icon: Minus, label: 'Divider', color: 'text-gray-300' },
    ];

    return (
        <div className="relative group/add">
            <button
                onClick={() => setShowOptions(!showOptions)}
                className={`flex items-center gap-4 transition-all duration-500 border-2 border-dashed ${variant === 'large'
                    ? 'p-12 px-20 rounded-[4rem] border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800 flex-col shadow-none hover:shadow-2xl'
                    : 'p-4 px-8 rounded-[2rem] border-gray-100 dark:border-gray-800 hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800'
                    }`}
            >
                <div className={`rounded-[1.2rem] bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-all ${variant === 'large' ? 'w-16 h-16' : 'w-10 h-10'} group-hover/add:bg-blue-600 group-hover/add:text-white`}>
                    <Plus size={variant === 'large' ? 32 : 20} className={showOptions ? 'rotate-45' : ''} />
                </div>
                {variant === 'large' && (
                    <div className="text-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover/add:text-gray-900 dark:group-hover/add:text-white">Expand Knowledge</span>
                        <p className="text-gray-400 text-xs mt-2 font-medium opacity-50">Select a content architecture</p>
                    </div>
                )}
            </button>

            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={`absolute left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 p-6 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 z-[100] grid grid-cols-3 gap-3 min-w-[450px] ${variant === 'large' ? 'bottom-full mb-10' : 'top-full mt-4'}`}
                    >
                        {types.map(t => (
                            <button
                                key={t.type}
                                onClick={() => { onClick(t.type); setShowOptions(false); }}
                                className="flex flex-col items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-[2rem] transition-all group/btn"
                            >
                                <div className={`p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl group-hover/btn:scale-110 transition-transform ${t.color}`}>
                                    <t.icon size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InsertButton: React.FC<{ onClick: (type: ContentBlockType) => void }> = ({ onClick }) => {
    const [showOptions, setShowOptions] = useState(false);

    return (
        <div className="relative w-full flex justify-center group/ins">
            <div className="absolute inset-0 flex items-center px-20 opacity-0 group-hover/ins:opacity-100 transition-all">
                <div className="h-px w-full bg-blue-500/20" />
            </div>

            <button
                onClick={() => setShowOptions(!showOptions)}
                className="relative z-10 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl scale-0 group-hover/ins:scale-100 transition-all hover:scale-125"
            >
                <Plus size={16} />
            </button>

            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-950 p-3 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex gap-1 z-50 animate-in fade-in"
                    >
                        {[
                            { type: 'text', icon: Type },
                            { type: 'heading', icon: Heading1 },
                            { type: 'math', icon: Sigma },
                            { type: 'code', icon: Code },
                            { type: 'image', icon: ImageIcon },
                            { type: 'callout', icon: Info },
                            { type: 'citation', icon: Quote },
                            { type: 'reflection', icon: Lightbulb },
                            { type: 'debate', icon: MessageSquare },
                            { type: 'progress', icon: BarChart3 },
                            { type: 'file_embed', icon: Paperclip }
                        ].map(t => (
                            <button
                                key={t.type}
                                onClick={() => { onClick(t.type as any); setShowOptions(false); }}
                                className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110 text-gray-500 hover:text-blue-600"
                                title={`Insert ${t.type}`}
                            >
                                <t.icon size={18} />
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlockEditor;
