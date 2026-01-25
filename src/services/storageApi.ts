/**
 * Files & Folders API Service
 * 
 * Frontend API client for file storage operations
 */

import api from './api';

// ==================== TYPES ====================

export interface FileMetadata {
    id: string;
    userId: string;
    name: string;
    originalName: string | null;
    storageKey: string | null;
    mimeType: string | null;
    sizeBytes: number | null;
    folderId: string | null;
    assignmentId: string | null;
    type: string;
    category: string;
    isStarred: boolean;
    downloadCount: number;
    createdAt: string;
    updatedAt: string | null;
}

export interface FolderMetadata {
    id: string;
    userId: string;
    name: string;
    color: string;
    icon: string;
    parentId: string | null;
    assignmentId: string | null;
    courseId: string | null;
    isStarred: boolean;
    sortOrder: number;
    createdAt: string;
    children?: FolderMetadata[];
    subfolders?: FolderMetadata[];
    files?: FileMetadata[];
}

// ==================== FOLDERS API ====================

/**
 * Get folders for current user
 */
export async function getFolders(parentId?: string | null): Promise<FolderMetadata[]> {
    const params = parentId !== undefined ? { parentId: parentId === null ? 'null' : parentId } : {};
    const response = await api.get<{ data: FolderMetadata[] }>('/api/folders', { params });
    return response.data.data;
}

/**
 * Get folder tree
 */
export async function getFolderTree(): Promise<FolderMetadata[]> {
    const response = await api.get<{ data: FolderMetadata[] }>('/api/folders/tree');
    return response.data.data;
}

/**
 * Get single folder with contents
 */
export async function getFolder(folderId: string): Promise<FolderMetadata & { subfolders: FolderMetadata[]; files: FileMetadata[] }> {
    const response = await api.get<{ data: FolderMetadata & { subfolders: FolderMetadata[]; files: FileMetadata[] } }>(`/api/folders/${folderId}`);
    return response.data.data;
}

/**
 * Get folder breadcrumb path
 */
export async function getFolderPath(folderId: string): Promise<Array<{ id: string; name: string }>> {
    const response = await api.get<{ data: Array<{ id: string; name: string }> }>(`/api/folders/${folderId}/path`);
    return response.data.data;
}

/**
 * Create a folder
 */
export async function createFolder(data: {
    name: string;
    parentId?: string | null;
    color?: string;
    icon?: string;
    assignmentId?: string;
    courseId?: string;
}): Promise<FolderMetadata> {
    const response = await api.post<{ data: FolderMetadata }>('/api/folders', data);
    return response.data.data;
}

/**
 * Update a folder
 */
export async function updateFolder(folderId: string, data: {
    name?: string;
    color?: string;
    icon?: string;
    parentId?: string | null;
    isStarred?: boolean;
}): Promise<FolderMetadata> {
    const response = await api.patch<{ data: FolderMetadata }>(`/api/folders/${folderId}`, data);
    return response.data.data;
}

/**
 * Toggle folder star
 */
export async function toggleFolderStar(folderId: string): Promise<FolderMetadata> {
    const response = await api.post<{ data: FolderMetadata }>(`/api/folders/${folderId}/star`);
    return response.data.data;
}

/**
 * Move folder
 */
export async function moveFolder(folderId: string, parentId: string | null): Promise<FolderMetadata> {
    const response = await api.post<{ data: FolderMetadata }>(`/api/folders/${folderId}/move`, { parentId });
    return response.data.data;
}

/**
 * Delete a folder
 */
export async function deleteFolder(folderId: string): Promise<void> {
    await api.delete(`/api/folders/${folderId}`);
}

// ==================== FILES API ====================

/**
 * Get files for current user
 */
export async function getFiles(folderId?: string | null): Promise<FileMetadata[]> {
    const params = folderId !== undefined ? { folderId: folderId === null ? 'null' : folderId } : {};
    const response = await api.get<{ data: FileMetadata[] }>('/api/files', { params });
    return response.data.data;
}

/**
 * Get starred files
 */
export async function getStarredFiles(): Promise<FileMetadata[]> {
    const response = await api.get<{ data: FileMetadata[] }>('/api/files/starred');
    return response.data.data;
}

/**
 * Get recent files
 */
export async function getRecentFiles(limit: number = 10): Promise<FileMetadata[]> {
    const response = await api.get<{ data: FileMetadata[] }>('/api/files/recent', { params: { limit } });
    return response.data.data;
}

/**
 * Get single file metadata
 */
export async function getFile(fileId: string): Promise<FileMetadata> {
    const response = await api.get<{ data: FileMetadata }>(`/api/files/${fileId}`);
    return response.data.data;
}

/**
 * Upload a file
 */
export async function uploadFile(
    file: File,
    options?: {
        folderId?: string | null;
        assignmentId?: string | null;
        type?: string;
    }
): Promise<FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.folderId) formData.append('folderId', options.folderId);
    if (options?.assignmentId) formData.append('assignmentId', options.assignmentId);
    if (options?.type) formData.append('type', options.type);

    const response = await api.post<{ data: FileMetadata }>('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
    files: File[],
    options?: {
        folderId?: string | null;
        assignmentId?: string | null;
        type?: string;
    }
): Promise<FileMetadata[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (options?.folderId) formData.append('folderId', options.folderId);
    if (options?.assignmentId) formData.append('assignmentId', options.assignmentId);
    if (options?.type) formData.append('type', options.type);

    const response = await api.post<{ data: FileMetadata[] }>('/api/files/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
}

/**
 * Update file metadata
 */
export async function updateFile(fileId: string, data: {
    name?: string;
    folderId?: string | null;
    assignmentId?: string | null;
    type?: string;
    isStarred?: boolean;
}): Promise<FileMetadata> {
    const response = await api.patch<{ data: FileMetadata }>(`/api/files/${fileId}`, data);
    return response.data.data;
}

/**
 * Toggle file star
 */
export async function toggleFileStar(fileId: string): Promise<FileMetadata> {
    const response = await api.post<{ data: FileMetadata }>(`/api/files/${fileId}/star`);
    return response.data.data;
}

/**
 * Move file to folder
 */
export async function moveFile(fileId: string, folderId: string | null): Promise<FileMetadata> {
    const response = await api.post<{ data: FileMetadata }>(`/api/files/${fileId}/move`, { folderId });
    return response.data.data;
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<void> {
    await api.delete(`/api/files/${fileId}`);
}

/**
 * Get file download URL
 */
export function getFileDownloadUrl(fileId: string): string {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/api/files/${fileId}/download`;
}

/**
 * Get file preview URL
 */
export function getFilePreviewUrl(fileId: string): string {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/api/files/${fileId}/preview`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number | null): string {
    if (bytes === null || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get icon for file type
 */
export function getFileIcon(mimeType: string | null): string {
    if (!mimeType) return '📄';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📙';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    if (mimeType.startsWith('text/')) return '📝';
    return '📄';
}

// ==================== STORAGE USAGE ====================

export interface StorageUsage {
    usedBytes: number;
    limitBytes: number;
    usedPercentage: number;
    fileCount: number;
    isNearLimit: boolean;
    isAtLimit: boolean;
}

/**
 * Get storage usage stats
 */
export async function getStorageUsage(): Promise<StorageUsage> {
    const response = await api.get<{ data: StorageUsage }>('/api/files/storage-usage');
    return response.data.data;
}

export const storageApi = {
    // Folders
    getFolders,
    getFolderTree,
    getFolder,
    getFolderPath,
    createFolder,
    updateFolder,
    toggleFolderStar,
    moveFolder,
    deleteFolder,
    // Files
    getFiles,
    getStarredFiles,
    getRecentFiles,
    getFile,
    uploadFile,
    uploadFiles,
    updateFile,
    toggleFileStar,
    moveFile,
    deleteFile,
    getFileDownloadUrl,
    getFilePreviewUrl,
    // Storage
    getStorageUsage,
    // Helpers
    formatFileSize,
    getFileIcon,
};
