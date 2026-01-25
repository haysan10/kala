/**
 * FilePreviewModal Component
 * 
 * Universal file preview modal with support for:
 * - Images (with zoom/pan)
 * - PDFs (with pagination)
 * - Text/Code files
 * - Video/Audio
 * - Download fallback for unsupported types
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Download, Star, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
    RotateCw, Maximize2, Minimize2, ExternalLink, File, Eye, Loader2,
    FileText, Image, Film, Music, FileCode, AlertCircle
} from 'lucide-react';
import { FileMetadata, formatFileSize, getFileIcon, storageApi } from '../services/storageApi';

interface FilePreviewModalProps {
    file: FileMetadata;
    onClose: () => void;
    onToggleStar?: () => void;
    onDownload?: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    file,
    onClose,
    onToggleStar,
    onDownload,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Determine file category
    const getCategory = (mimeType: string | null): 'image' | 'pdf' | 'text' | 'video' | 'audio' | 'other' => {
        if (!mimeType) return 'other';
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.startsWith('text/') ||
            mimeType.includes('javascript') ||
            mimeType.includes('json') ||
            mimeType.includes('xml') ||
            mimeType.includes('markdown')) return 'text';
        return 'other';
    };

    const category = getCategory(file.mimeType);

    // Get preview URL with auth token
    const getPreviewUrl = () => {
        const baseUrl = storageApi.getFilePreviewUrl(file.id);
        const token = localStorage.getItem('kala_token');
        return `${baseUrl}?token=${token}`;
    };

    // Load text content if needed
    useEffect(() => {
        const loadTextContent = async () => {
            if (category !== 'text') {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(getPreviewUrl());
                if (!response.ok) throw new Error('Failed to load file');
                const text = await response.text();
                setContent(text);
            } catch (err) {
                setError('Failed to load file content');
            } finally {
                setLoading(false);
            }
        };

        loadTextContent();
    }, [category, file.id]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 3));
            if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5));
            if (e.key === 'r') setRotation(r => (r + 90) % 360);
            if (e.key === '0') { setZoom(1); setRotation(0); }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Handle image load
    const handleImageLoad = () => setLoading(false);
    const handleImageError = () => {
        setLoading(false);
        setError('Failed to load image');
    };

    // Handle download
    const handleDownload = () => {
        if (onDownload) {
            onDownload();
        } else {
            const url = storageApi.getFileDownloadUrl(file.id);
            const token = localStorage.getItem('kala_token');
            window.open(`${url}?token=${token}`, '_blank');
        }
    };

    // Render preview based on category
    const renderPreview = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Loader2 size={48} className="animate-spin text-blue-500" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <AlertCircle size={64} className="text-red-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Preview Failed</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={handleDownload}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Download size={16} />
                        Download Instead
                    </button>
                </div>
            );
        }

        switch (category) {
            case 'image':
                return (
                    <div className="flex items-center justify-center h-full overflow-auto p-4">
                        <img
                            src={getPreviewUrl()}
                            alt={file.name}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            style={{
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                transition: 'transform 0.2s ease',
                                maxWidth: isFullscreen ? 'none' : '100%',
                                maxHeight: isFullscreen ? 'none' : '100%',
                            }}
                            className="object-contain"
                        />
                    </div>
                );

            case 'pdf':
                return (
                    <div className="h-full w-full">
                        <iframe
                            src={`${getPreviewUrl()}#toolbar=1&navpanes=0`}
                            className="w-full h-full border-0 rounded-lg"
                            title={file.name}
                            onLoad={() => setLoading(false)}
                        />
                    </div>
                );

            case 'video':
                return (
                    <div className="flex items-center justify-center h-full p-4">
                        <video
                            src={getPreviewUrl()}
                            controls
                            autoPlay={false}
                            className="max-w-full max-h-full rounded-lg shadow-lg"
                            onLoadedData={() => setLoading(false)}
                        >
                            Your browser does not support video playback.
                        </video>
                    </div>
                );

            case 'audio':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                        <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                            <Music size={64} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{file.name}</h3>
                        <audio
                            src={getPreviewUrl()}
                            controls
                            className="w-full max-w-md"
                            onLoadedData={() => setLoading(false)}
                        >
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                );

            case 'text':
                return (
                    <div className="h-full overflow-auto p-4">
                        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                            {content}
                        </pre>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 text-5xl">
                            {getFileIcon(file.mimeType)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{file.name}</h3>
                        <p className="text-gray-500 mb-2">{file.mimeType || 'Unknown type'}</p>
                        <p className="text-gray-400 text-sm mb-6">{formatFileSize(file.sizeBytes)}</p>
                        <p className="text-gray-500 mb-6">Preview not available for this file type</p>
                        <button
                            onClick={handleDownload}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Download size={18} />
                            Download File
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            {/* Modal Container */}
            <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all ${isFullscreen ? 'w-screen h-screen rounded-none' : 'w-[95vw] h-[90vh] max-w-6xl'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                            {getFileIcon(file.mimeType)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold text-gray-900 dark:text-white truncate">{file.name}</h2>
                            <p className="text-xs text-gray-500">
                                {formatFileSize(file.sizeBytes)} • {file.mimeType || 'Unknown type'}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Zoom controls (for images) */}
                        {category === 'image' && (
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    title="Zoom out"
                                >
                                    <ZoomOut size={16} />
                                </button>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12 text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    title="Zoom in"
                                >
                                    <ZoomIn size={16} />
                                </button>
                                <button
                                    onClick={() => setRotation(r => (r + 90) % 360)}
                                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    title="Rotate"
                                >
                                    <RotateCw size={16} />
                                </button>
                            </div>
                        )}

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                        {/* Star */}
                        {onToggleStar && (
                            <button
                                onClick={onToggleStar}
                                className={`p-2 rounded-lg transition-colors ${file.isStarred
                                        ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                title={file.isStarred ? 'Unstar' : 'Star'}
                            >
                                <Star size={18} className={file.isStarred ? 'fill-yellow-500' : ''} />
                            </button>
                        )}

                        {/* Download */}
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Download"
                        >
                            <Download size={18} />
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Close (Esc)"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-950">
                    {renderPreview()}
                </div>

                {/* Footer with file info */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                            <span>Created: {new Date(file.createdAt).toLocaleDateString()}</span>
                            {file.downloadCount > 0 && (
                                <span>Downloads: {file.downloadCount}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Press ESC to close</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
