/**
 * FileExplorer Component (Enhanced)
 * 
 * A beautiful file explorer with folder tree, drag-drop upload,
 * starred files, recent files, and file management capabilities
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Folder, Upload, Star, Clock, Search,
    ChevronRight, Home, Trash2, Download,
    FolderPlus, X, Loader2,
    Grid, List, Eye, RefreshCw, HardDrive
} from 'lucide-react';
import {
    storageApi,
    FileMetadata,
    FolderMetadata,
    StorageUsage,
    formatFileSize,
    getFileIcon,
    getStorageUsage
} from '../services/storageApi';
import { useToast, ConfirmDialog } from './ui/Toast';
import FilePreviewModal from './FilePreviewModal';

type ViewTab = 'browse' | 'starred' | 'recent';

interface FileExplorerProps {
    assignmentId?: string;
    onFileSelect?: (file: FileMetadata) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ assignmentId, onFileSelect }) => {
    // State
    const [activeTab, setActiveTab] = useState<ViewTab>('browse');
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [folders, setFolders] = useState<FolderMetadata[]>([]);
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [starredFiles, setStarredFiles] = useState<FileMetadata[]>([]);
    const [recentFiles, setRecentFiles] = useState<FileMetadata[]>([]);
    const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ type: 'file' | 'folder'; id: string } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileMetadata | FolderMetadata; type: 'file' | 'folder' } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'file' | 'folder'; id: string; name: string } | null>(null);
    const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);
    const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    // Load browse data
    const loadBrowseData = useCallback(async () => {
        setLoading(true);
        try {
            const [foldersData, filesData] = await Promise.all([
                storageApi.getFolders(currentFolderId),
                storageApi.getFiles(currentFolderId),
            ]);
            setFolders(foldersData);
            setFiles(filesData);

            // Update breadcrumb
            if (currentFolderId) {
                const path = await storageApi.getFolderPath(currentFolderId);
                setBreadcrumb(path);
            } else {
                setBreadcrumb([]);
            }
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    }, [currentFolderId]);

    // Load starred files
    const loadStarredFiles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await storageApi.getStarredFiles();
            setStarredFiles(data);
        } catch (error) {
            console.error('Error loading starred files:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load recent files
    const loadRecentFiles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await storageApi.getRecentFiles(20);
            setRecentFiles(data);
        } catch (error) {
            console.error('Error loading recent files:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load data based on active tab
    useEffect(() => {
        if (activeTab === 'browse') {
            loadBrowseData();
        } else if (activeTab === 'starred') {
            loadStarredFiles();
        } else if (activeTab === 'recent') {
            loadRecentFiles();
        }
    }, [activeTab, loadBrowseData, loadStarredFiles, loadRecentFiles]);

    // Load storage usage on mount and after file operations
    const loadStorageUsage = useCallback(async () => {
        try {
            const usage = await getStorageUsage();
            setStorageUsage(usage);
        } catch (error) {
            console.error('Error loading storage usage:', error);
        }
    }, []);

    useEffect(() => {
        loadStorageUsage();
    }, [loadStorageUsage]);

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files) as File[];
        if (droppedFiles.length === 0) return;

        await handleUpload(droppedFiles);
    };

    const handleUpload = async (filesToUpload: File[]) => {
        setUploading(true);
        const loadingToast = toast.loading('Uploading Files', `Uploading ${filesToUpload.length} file(s)...`);
        try {
            await storageApi.uploadFiles(filesToUpload, {
                folderId: currentFolderId,
                assignmentId,
            });
            await loadBrowseData();
            loadStorageUsage(); // Refresh storage usage
            toast.updateToast(loadingToast, {
                type: 'success',
                title: 'Upload Complete',
                message: `${filesToUpload.length} file(s) uploaded successfully.`,
                duration: 5000,
                dismissible: true,
            });
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.updateToast(loadingToast, {
                type: 'error',
                title: 'Upload Failed',
                message: error.message || 'Could not upload files. Please try again.',
                duration: 8000,
                dismissible: true,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files;
        if (selected && selected.length > 0) {
            handleUpload(Array.from(selected));
        }
        e.target.value = '';
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            toast.warning('Folder Name Required', 'Please enter a name for the folder.');
            return;
        }
        try {
            await storageApi.createFolder({
                name: newFolderName.trim(),
                parentId: currentFolderId,
            });
            toast.success('Folder Created', `Folder "${newFolderName.trim()}" has been created.`);
            setNewFolderName('');
            setShowNewFolder(false);
            await loadBrowseData();
        } catch (error: any) {
            console.error('Failed to create folder:', error);
            toast.error('Failed to Create Folder', error.message || 'An error occurred. Please try again.');
        }
    };

    const handleDeleteFolder = async (folderId: string, folderName?: string) => {
        try {
            await storageApi.deleteFolder(folderId);
            toast.success('Folder Deleted', `"${folderName || 'Folder'}" and all its contents have been deleted.`);
            setConfirmDelete(null);
            await loadBrowseData();
        } catch (error: any) {
            console.error('Failed to delete folder:', error);
            toast.error('Delete Failed', error.message || 'Could not delete the folder.');
        }
    };

    const handleDeleteFile = async (fileId: string, fileName?: string) => {
        try {
            await storageApi.deleteFile(fileId);
            toast.success('File Deleted', `"${fileName || 'File'}" has been deleted.`);
            setConfirmDelete(null);
            loadStorageUsage(); // Refresh storage usage
            // Refresh whatever view we're on
            if (activeTab === 'browse') await loadBrowseData();
            else if (activeTab === 'starred') await loadStarredFiles();
            else if (activeTab === 'recent') await loadRecentFiles();
        } catch (error: any) {
            console.error('Failed to delete file:', error);
            toast.error('Delete Failed', error.message || 'Could not delete the file.');
        }
    };

    const handleToggleStar = async (item: FileMetadata | FolderMetadata, type: 'file' | 'folder') => {
        try {
            if (type === 'file') {
                await storageApi.toggleFileStar(item.id);
            } else {
                await storageApi.toggleFolderStar(item.id);
            }
            const action = item.isStarred ? 'removed from' : 'added to';
            toast.success('Star Updated', `"${item.name}" ${action} starred items.`);
            // Refresh appropriate view
            if (activeTab === 'browse') await loadBrowseData();
            else if (activeTab === 'starred') await loadStarredFiles();
            else if (activeTab === 'recent') await loadRecentFiles();
        } catch (error: any) {
            console.error('Failed to toggle star:', error);
            toast.error('Failed to Update Star', error.message || 'Please try again.');
        }
    };

    const handleDownload = (file: FileMetadata) => {
        const url = storageApi.getFileDownloadUrl(file.id);
        const token = localStorage.getItem('kala_token');
        window.open(`${url}?token=${token}`, '_blank');
    };

    // Get displayed files based on tab and search
    const getDisplayedFiles = (): FileMetadata[] => {
        let displayFiles: FileMetadata[] = [];
        if (activeTab === 'browse') displayFiles = files;
        else if (activeTab === 'starred') displayFiles = starredFiles;
        else if (activeTab === 'recent') displayFiles = recentFiles;

        if (!searchQuery.trim()) return displayFiles;
        return displayFiles.filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.mimeType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const getDisplayedFolders = (): FolderMetadata[] => {
        if (activeTab !== 'browse') return [];
        if (!searchQuery.trim()) return folders;
        return folders.filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredFolders = getDisplayedFolders();
    const filteredFiles = getDisplayedFiles();

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Refresh current view
    const handleRefresh = () => {
        if (activeTab === 'browse') loadBrowseData();
        else if (activeTab === 'starred') loadStarredFiles();
        else if (activeTab === 'recent') loadRecentFiles();
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <HardDrive className="text-blue-500" size={20} />
                        File Manager
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                            title={viewMode === 'grid' ? 'List view' : 'Grid view'}
                        >
                            {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Storage Usage Indicator */}
                {storageUsage && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <HardDrive size={14} />
                                Storage
                            </span>
                            <span className={`text-xs font-bold ${storageUsage.isAtLimit ? 'text-red-500' : storageUsage.isNearLimit ? 'text-amber-500' : 'text-gray-600 dark:text-gray-400'}`}>
                                {formatFileSize(storageUsage.usedBytes)} / {formatFileSize(storageUsage.limitBytes)}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${storageUsage.isAtLimit ? 'bg-red-500' : storageUsage.isNearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${storageUsage.usedPercentage}%` }}
                            />
                        </div>
                        {storageUsage.isAtLimit && (
                            <p className="text-xs text-red-500 mt-2 font-medium">
                                ⚠️ Storage full! Delete files or upgrade to continue uploading.
                            </p>
                        )}
                        {storageUsage.isNearLimit && !storageUsage.isAtLimit && (
                            <p className="text-xs text-amber-500 mt-2 font-medium">
                                ⚠️ Running low on storage ({storageUsage.usedPercentage}% used)
                            </p>
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'browse'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Folder size={16} />
                        Browse
                    </button>
                    <button
                        onClick={() => setActiveTab('starred')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'starred'
                            ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Star size={16} />
                        Starred
                    </button>
                    <button
                        onClick={() => setActiveTab('recent')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'recent'
                            ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Clock size={16} />
                        Recent
                    </button>
                </div>

                {/* Search and Actions */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'browse' ? 'files and folders' : 'files'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {activeTab === 'browse' && (
                        <>
                            <button
                                onClick={() => setShowNewFolder(true)}
                                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                                title="New folder"
                            >
                                <FolderPlus size={18} />
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Upload size={16} />
                                Upload
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                        </>
                    )}
                </div>

                {/* Breadcrumb (only for browse) */}
                {activeTab === 'browse' && (
                    <div className="flex items-center gap-2 mt-4 text-sm overflow-x-auto">
                        <button
                            onClick={() => setCurrentFolderId(null)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${currentFolderId === null
                                ? 'text-blue-600 font-medium'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <Home size={14} />
                            Home
                        </button>
                        {breadcrumb.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <ChevronRight size={14} className="text-gray-300 shrink-0" />
                                <button
                                    onClick={() => setCurrentFolderId(item.id)}
                                    className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${index === breadcrumb.length - 1
                                        ? 'text-blue-600 font-medium'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {item.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Tab description */}
                {activeTab === 'starred' && (
                    <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                        <Star size={12} className="text-yellow-500" />
                        Your starred files for quick access
                    </p>
                )}
                {activeTab === 'recent' && (
                    <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} className="text-green-500" />
                        Recently accessed files
                    </p>
                )}
            </div>

            {/* New Folder Modal */}
            {showNewFolder && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateFolder}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div
                ref={dropZoneRef}
                onDragOver={activeTab === 'browse' ? handleDragOver : undefined}
                onDragLeave={activeTab === 'browse' ? handleDragLeave : undefined}
                onDrop={activeTab === 'browse' ? handleDrop : undefined}
                className={`flex-1 overflow-y-auto p-4 relative transition-colors ${isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
            >
                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-100/80 dark:bg-blue-900/80 z-10 pointer-events-none">
                        <div className="text-center">
                            <Upload size={48} className="mx-auto text-blue-500 mb-2" />
                            <p className="text-lg font-medium text-blue-700 dark:text-blue-300">Drop files to upload</p>
                        </div>
                    </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-20">
                        <div className="text-center">
                            <Loader2 size={48} className="mx-auto text-blue-500 animate-spin mb-2" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white">Uploading...</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 size={32} className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    {activeTab === 'starred' ? (
                                        <Star size={40} className="text-yellow-400" />
                                    ) : activeTab === 'recent' ? (
                                        <Clock size={40} className="text-green-400" />
                                    ) : (
                                        <Folder size={40} className="text-gray-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    {searchQuery ? 'No results found' :
                                        activeTab === 'starred' ? 'No starred files' :
                                            activeTab === 'recent' ? 'No recent files' :
                                                'This folder is empty'}
                                </h3>
                                <p className="text-gray-500 mb-4 text-sm">
                                    {searchQuery ? 'Try a different search term' :
                                        activeTab === 'starred' ? 'Star files to see them here' :
                                            activeTab === 'recent' ? 'Access files to see them here' :
                                                'Drag and drop files or click Upload'}
                                </p>
                                {!searchQuery && activeTab === 'browse' && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        Upload Files
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Grid/List View */}
                        {(filteredFolders.length > 0 || filteredFiles.length > 0) && (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {/* Folders */}
                                    {filteredFolders.map(folder => (
                                        <div
                                            key={folder.id}
                                            onClick={() => setCurrentFolderId(folder.id)}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setContextMenu({ x: e.clientX, y: e.clientY, item: folder, type: 'folder' });
                                            }}
                                            className={`group p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border-2 ${selectedItem?.id === folder.id ? 'border-blue-500' : 'border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                    style={{ backgroundColor: folder.color + '20' }}
                                                >
                                                    {folder.icon}
                                                </div>
                                                {folder.isStarred && (
                                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                )}
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                                {folder.name}
                                            </p>
                                        </div>
                                    ))}

                                    {/* Files */}
                                    {filteredFiles.map(file => (
                                        <div
                                            key={file.id}
                                            onClick={() => { setPreviewFile(file); onFileSelect?.(file); }}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setContextMenu({ x: e.clientX, y: e.clientY, item: file, type: 'file' });
                                            }}
                                            className={`group p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border-2 ${selectedItem?.id === file.id ? 'border-blue-500' : 'border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                                                    {getFileIcon(file.mimeType)}
                                                </div>
                                                {file.isStarred && (
                                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                )}
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatFileSize(file.sizeBytes)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Folders */}
                                    {filteredFolders.map(folder => (
                                        <div
                                            key={folder.id}
                                            onClick={() => setCurrentFolderId(folder.id)}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setContextMenu({ x: e.clientX, y: e.clientY, item: folder, type: 'folder' });
                                            }}
                                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                                style={{ backgroundColor: folder.color + '20' }}
                                            >
                                                {folder.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">{folder.name}</p>
                                                <p className="text-xs text-gray-500">Folder</p>
                                            </div>
                                            {folder.isStarred && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </div>
                                    ))}

                                    {/* Files */}
                                    {filteredFiles.map(file => (
                                        <div
                                            key={file.id}
                                            onClick={() => { setPreviewFile(file); onFileSelect?.(file); }}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setContextMenu({ x: e.clientX, y: e.clientY, item: file, type: 'file' });
                                            }}
                                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg shadow-sm">
                                                {getFileIcon(file.mimeType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{formatFileSize(file.sizeBytes)}</p>
                                            </div>
                                            {file.isStarred && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}

                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="fixed bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[160px]"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {contextMenu.type === 'file' && (
                            <>
                                <button
                                    onClick={() => { setPreviewFile(contextMenu.item as FileMetadata); onFileSelect?.(contextMenu.item as FileMetadata); setContextMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                                >
                                    <Eye size={14} /> Preview
                                </button>
                                <button
                                    onClick={() => { handleDownload(contextMenu.item as FileMetadata); setContextMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                                >
                                    <Download size={14} /> Download
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => { handleToggleStar(contextMenu.item, contextMenu.type); setContextMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                        >
                            <Star size={14} /> {contextMenu.item.isStarred ? 'Unstar' : 'Star'}
                        </button>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                            onClick={() => {
                                setConfirmDelete({
                                    type: contextMenu.type,
                                    id: contextMenu.item.id,
                                    name: contextMenu.item.name,
                                });
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-3"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => {
                    if (confirmDelete) {
                        if (confirmDelete.type === 'folder') {
                            handleDeleteFolder(confirmDelete.id, confirmDelete.name);
                        } else {
                            handleDeleteFile(confirmDelete.id, confirmDelete.name);
                        }
                    }
                }}
                title={`Delete ${confirmDelete?.type === 'folder' ? 'Folder' : 'File'}?`}
                message={confirmDelete?.type === 'folder'
                    ? `Are you sure you want to delete "${confirmDelete?.name}"? This will permanently delete the folder and all its contents.`
                    : `Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                type="danger"
            />

            {/* File Preview Modal */}
            {previewFile && (
                <FilePreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                    onToggleStar={async () => {
                        await handleToggleStar(previewFile, 'file');
                        // Refresh the file data
                        const updatedFile = await storageApi.getFile(previewFile.id);
                        setPreviewFile(updatedFile);
                    }}
                    onDownload={() => {
                        const url = storageApi.getFileDownloadUrl(previewFile.id);
                        const token = localStorage.getItem('kala_token');
                        window.open(`${url}?token=${token}`, '_blank');
                    }}
                />
            )}
        </div>
    );
};

export default FileExplorer;
