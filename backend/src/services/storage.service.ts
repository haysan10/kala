/**
 * Storage Service
 * 
 * Handles file storage operations - local storage for now,
 * can be extended to S3/R2/etc later
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { db } from '../config/database.js';
import { files, folders } from '../db/schema.js';
import { eq, and, isNull, desc, asc } from 'drizzle-orm';

// ==================== CONFIGURATION ====================

const STORAGE_DIR = process.env.STORAGE_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10); // 50MB default

// Ensure storage directory exists
async function ensureStorageDir() {
    try {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (err) {
        // Already exists
    }
}

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
    childCount?: number;
    fileCount?: number;
}

export interface UploadOptions {
    userId: string;
    folderId?: string | null;
    assignmentId?: string | null;
    type?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate unique storage key for file
 */
function generateStorageKey(userId: string, originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${userId}/${timestamp}-${random}${ext}`;
}

/**
 * Determine file category from mime type
 */
function categorizeFile(mimeType: string | null): string {
    if (!mimeType) return 'other';

    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
        mimeType.includes('pdf') ||
        mimeType.includes('document') ||
        mimeType.includes('text') ||
        mimeType.includes('spreadsheet') ||
        mimeType.includes('presentation')
    ) return 'document';

    return 'other';
}

// ==================== FOLDER OPERATIONS ====================

/**
 * Get all folders for a user
 */
export async function getUserFolders(
    userId: string,
    parentId?: string | null
): Promise<FolderMetadata[]> {
    const condition = parentId === undefined
        ? eq(folders.userId, userId)
        : parentId === null
            ? and(eq(folders.userId, userId), isNull(folders.parentId))
            : and(eq(folders.userId, userId), eq(folders.parentId, parentId));

    const results = await db.select()
        .from(folders)
        .where(condition)
        .orderBy(asc(folders.sortOrder), asc(folders.name));

    return results.map(f => ({
        id: f.id,
        userId: f.userId,
        name: f.name,
        color: f.color || '#6366f1',
        icon: f.icon || '📁',
        parentId: f.parentId,
        assignmentId: f.assignmentId,
        courseId: f.courseId,
        isStarred: f.isStarred || false,
        sortOrder: f.sortOrder || 0,
        createdAt: f.createdAt || new Date().toISOString(),
    }));
}

/**
 * Get single folder by ID
 */
export async function getFolder(folderId: string): Promise<FolderMetadata | null> {
    const [folder] = await db.select()
        .from(folders)
        .where(eq(folders.id, folderId))
        .limit(1);

    if (!folder) return null;

    return {
        id: folder.id,
        userId: folder.userId,
        name: folder.name,
        color: folder.color || '#6366f1',
        icon: folder.icon || '📁',
        parentId: folder.parentId,
        assignmentId: folder.assignmentId,
        courseId: folder.courseId,
        isStarred: folder.isStarred || false,
        sortOrder: folder.sortOrder || 0,
        createdAt: folder.createdAt || new Date().toISOString(),
    };
}

/**
 * Create a new folder
 */
export async function createFolder(data: {
    userId: string;
    name: string;
    parentId?: string | null;
    color?: string;
    icon?: string;
    assignmentId?: string;
    courseId?: string;
}): Promise<FolderMetadata> {
    const [folder] = await db.insert(folders).values({
        userId: data.userId,
        name: data.name,
        parentId: data.parentId || null,
        color: data.color || '#6366f1',
        icon: data.icon || '📁',
        assignmentId: data.assignmentId || null,
        courseId: data.courseId || null,
    }).returning();

    return {
        id: folder.id,
        userId: folder.userId,
        name: folder.name,
        color: folder.color || '#6366f1',
        icon: folder.icon || '📁',
        parentId: folder.parentId,
        assignmentId: folder.assignmentId,
        courseId: folder.courseId,
        isStarred: folder.isStarred || false,
        sortOrder: folder.sortOrder || 0,
        createdAt: folder.createdAt || new Date().toISOString(),
    };
}

/**
 * Update a folder
 */
export async function updateFolder(
    folderId: string,
    data: Partial<{
        name: string;
        color: string;
        icon: string;
        parentId: string | null;
        isStarred: boolean;
    }>
): Promise<FolderMetadata | null> {
    const [updated] = await db.update(folders)
        .set({
            ...data,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(folders.id, folderId))
        .returning();

    if (!updated) return null;

    return {
        id: updated.id,
        userId: updated.userId,
        name: updated.name,
        color: updated.color || '#6366f1',
        icon: updated.icon || '📁',
        parentId: updated.parentId,
        assignmentId: updated.assignmentId,
        courseId: updated.courseId,
        isStarred: updated.isStarred || false,
        sortOrder: updated.sortOrder || 0,
        createdAt: updated.createdAt || new Date().toISOString(),
    };
}

/**
 * Delete a folder and all contents
 */
export async function deleteFolder(folderId: string): Promise<void> {
    // Get all files in this folder to delete from storage
    const filesToDelete = await db.select()
        .from(files)
        .where(eq(files.folderId, folderId));

    // Delete physical files
    for (const file of filesToDelete) {
        if (file.storageKey) {
            try {
                await fs.unlink(path.join(STORAGE_DIR, file.storageKey));
            } catch {
                // File might not exist
            }
        }
    }

    // Delete folder (cascade will delete files in DB)
    await db.delete(folders).where(eq(folders.id, folderId));
}

// ==================== FILE OPERATIONS ====================

/**
 * Get files for a user, optionally filtered by folder
 */
export async function getUserFiles(
    userId: string,
    folderId?: string | null
): Promise<FileMetadata[]> {
    const condition = folderId === undefined
        ? eq(files.userId, userId)
        : folderId === null
            ? and(eq(files.userId, userId), isNull(files.folderId))
            : and(eq(files.userId, userId), eq(files.folderId, folderId));

    const results = await db.select()
        .from(files)
        .where(condition)
        .orderBy(desc(files.createdAt));

    return results.map(f => ({
        id: f.id,
        userId: f.userId || '',
        name: f.name,
        originalName: f.originalName,
        storageKey: f.storageKey,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        folderId: f.folderId,
        assignmentId: f.assignmentId,
        type: f.type || 'draft',
        category: f.category || 'document',
        isStarred: f.isStarred || false,
        downloadCount: f.downloadCount || 0,
        createdAt: f.createdAt || new Date().toISOString(),
        updatedAt: f.updatedAt,
    }));
}

/**
 * Get single file by ID
 */
export async function getFile(fileId: string): Promise<FileMetadata | null> {
    const [file] = await db.select()
        .from(files)
        .where(eq(files.id, fileId))
        .limit(1);

    if (!file) return null;

    return {
        id: file.id,
        userId: file.userId || '',
        name: file.name,
        originalName: file.originalName,
        storageKey: file.storageKey,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        folderId: file.folderId,
        assignmentId: file.assignmentId,
        type: file.type || 'draft',
        category: file.category || 'document',
        isStarred: file.isStarred || false,
        downloadCount: file.downloadCount || 0,
        createdAt: file.createdAt || new Date().toISOString(),
        updatedAt: file.updatedAt,
    };
}

/**
 * Save uploaded file to storage
 */
export async function saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions
): Promise<FileMetadata> {
    await ensureStorageDir();

    const storageKey = generateStorageKey(options.userId, originalName);
    const fullPath = path.join(STORAGE_DIR, storageKey);

    // Ensure user directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Check storage limit (50MB)
    const MAX_STORAGE_BYTES = 50 * 1024 * 1024;
    const userFilesList = await db.select({ sizeBytes: files.sizeBytes }).from(files).where(eq(files.userId, options.userId));
    const currentUsage = userFilesList.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);

    if (currentUsage + buffer.length > MAX_STORAGE_BYTES) {
        throw new Error('Storage limit reached (50MB). Please delete some files or use Google Drive integration.');
    }

    // Save file to disk
    await fs.writeFile(fullPath, buffer);

    // Create database record
    const [file] = await db.insert(files).values({
        userId: options.userId,
        name: originalName,
        originalName: originalName,
        storageKey: storageKey,
        mimeType: mimeType,
        sizeBytes: buffer.length,
        folderId: options.folderId || null,
        assignmentId: options.assignmentId || null,
        type: options.type || 'draft',
        category: categorizeFile(mimeType),
    }).returning();

    return {
        id: file.id,
        userId: file.userId || '',
        name: file.name,
        originalName: file.originalName,
        storageKey: file.storageKey,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        folderId: file.folderId,
        assignmentId: file.assignmentId,
        type: file.type || 'draft',
        category: file.category || 'document',
        isStarred: file.isStarred || false,
        downloadCount: file.downloadCount || 0,
        createdAt: file.createdAt || new Date().toISOString(),
        updatedAt: file.updatedAt,
    };
}

/**
 * Get file content for download/preview
 */
export async function getFileContent(fileId: string): Promise<{ buffer: Buffer; metadata: FileMetadata } | null> {
    const file = await getFile(fileId);
    if (!file || !file.storageKey) return null;

    const fullPath = path.join(STORAGE_DIR, file.storageKey);

    try {
        const buffer = await fs.readFile(fullPath);

        // Update download count and last accessed
        await db.update(files)
            .set({
                downloadCount: (file.downloadCount || 0) + 1,
                lastAccessedAt: new Date().toISOString(),
            })
            .where(eq(files.id, fileId));

        return { buffer, metadata: file };
    } catch {
        return null;
    }
}

/**
 * Update file metadata
 */
export async function updateFile(
    fileId: string,
    data: Partial<{
        name: string;
        folderId: string | null;
        assignmentId: string | null;
        type: string;
        isStarred: boolean;
    }>
): Promise<FileMetadata | null> {
    const [updated] = await db.update(files)
        .set({
            ...data,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(files.id, fileId))
        .returning();

    if (!updated) return null;

    return {
        id: updated.id,
        userId: updated.userId || '',
        name: updated.name,
        originalName: updated.originalName,
        storageKey: updated.storageKey,
        mimeType: updated.mimeType,
        sizeBytes: updated.sizeBytes,
        folderId: updated.folderId,
        assignmentId: updated.assignmentId,
        type: updated.type || 'draft',
        category: updated.category || 'document',
        isStarred: updated.isStarred || false,
        downloadCount: updated.downloadCount || 0,
        createdAt: updated.createdAt || new Date().toISOString(),
        updatedAt: updated.updatedAt,
    };
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<void> {
    const file = await getFile(fileId);
    if (!file) return;

    // Delete from storage
    if (file.storageKey) {
        try {
            await fs.unlink(path.join(STORAGE_DIR, file.storageKey));
        } catch {
            // File might not exist
        }
    }

    // Delete from database
    await db.delete(files).where(eq(files.id, fileId));
}

/**
 * Get starred files for a user
 */
export async function getStarredFiles(userId: string): Promise<FileMetadata[]> {
    const results = await db.select()
        .from(files)
        .where(and(eq(files.userId, userId), eq(files.isStarred, true)))
        .orderBy(desc(files.updatedAt));

    return results.map(f => ({
        id: f.id,
        userId: f.userId || '',
        name: f.name,
        originalName: f.originalName,
        storageKey: f.storageKey,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        folderId: f.folderId,
        assignmentId: f.assignmentId,
        type: f.type || 'draft',
        category: f.category || 'document',
        isStarred: true,
        downloadCount: f.downloadCount || 0,
        createdAt: f.createdAt || new Date().toISOString(),
        updatedAt: f.updatedAt,
    }));
}

/**
 * Get recent files for a user
 */
export async function getRecentFiles(userId: string, limit: number = 10): Promise<FileMetadata[]> {
    const results = await db.select()
        .from(files)
        .where(eq(files.userId, userId))
        .orderBy(desc(files.lastAccessedAt), desc(files.createdAt))
        .limit(limit);

    return results.map(f => ({
        id: f.id,
        userId: f.userId || '',
        name: f.name,
        originalName: f.originalName,
        storageKey: f.storageKey,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        folderId: f.folderId,
        assignmentId: f.assignmentId,
        type: f.type || 'draft',
        category: f.category || 'document',
        isStarred: f.isStarred || false,
        downloadCount: f.downloadCount || 0,
        createdAt: f.createdAt || new Date().toISOString(),
        updatedAt: f.updatedAt,
    }));
}

export const storageService = {
    // Folders
    getUserFolders,
    getFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    // Files
    getUserFiles,
    getFile,
    saveFile,
    getFileContent,
    updateFile,
    deleteFile,
    getStarredFiles,
    getRecentFiles,
};
