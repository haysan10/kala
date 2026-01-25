/**
 * Files Routes
 * 
 * API endpoints for file upload, download, and management
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { storageService } from '../services/storage.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth middleware to all file routes
router.use(authMiddleware);

// ==================== MULTER CONFIGURATION ====================

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10); // 50MB

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = [
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/markdown',
            'text/csv',
            // Images
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            // Audio/Video
            'audio/mpeg',
            'audio/wav',
            'video/mp4',
            'video/quicktime',
            // Archives
            'application/zip',
            'application/x-rar-compressed',
        ];

        if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('text/')) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} is not allowed`));
        }
    },
});

// ==================== ROUTES ====================

/**
 * GET /api/files
 * List all files for current user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { folderId } = req.query;
        const files = await storageService.getUserFiles(
            userId,
            folderId === 'null' ? null : folderId as string | undefined
        );

        res.json({ data: files });
    } catch (error: any) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/files/storage-usage
 * Get user's storage usage stats
 */
router.get('/storage-usage', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get all files and sum up size
        const allFiles = await storageService.getUserFiles(userId);
        const usedBytes = allFiles.reduce((sum, file) => sum + (file.sizeBytes || 0), 0);

        // 50MB limit
        const limitBytes = 50 * 1024 * 1024;
        const usedPercentage = Math.round((usedBytes / limitBytes) * 100);

        res.json({
            data: {
                usedBytes,
                limitBytes,
                usedPercentage: Math.min(usedPercentage, 100),
                fileCount: allFiles.length,
                isNearLimit: usedPercentage >= 80,
                isAtLimit: usedPercentage >= 100,
            }
        });
    } catch (error: any) {
        console.error('Error getting storage usage:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/files/starred
 * Get starred files
 */
router.get('/starred', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const files = await storageService.getStarredFiles(userId);
        res.json({ data: files });
    } catch (error: any) {
        console.error('Error getting starred files:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/files/recent
 * Get recently accessed files
 */
router.get('/recent', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 10;
        const files = await storageService.getRecentFiles(userId, limit);
        res.json({ data: files });
    } catch (error: any) {
        console.error('Error getting recent files:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/files/:id
 * Get file metadata
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const file = await storageService.getFile(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        // Verify ownership
        if (file.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        res.json({ data: file });
    } catch (error: any) {
        console.error('Error getting file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/files/:id/download
 * Download file content
 */
router.get('/:id/download', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await storageService.getFileContent(req.params.id);
        if (!result) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        // Verify ownership
        if (result.metadata.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { buffer, metadata } = result;

        res.set({
            'Content-Type': metadata.mimeType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.originalName || metadata.name)}"`,
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    } catch (error: any) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/files/:id/preview
 * Get file content for preview (inline)
 */
router.get('/:id/preview', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await storageService.getFileContent(req.params.id);
        if (!result) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        // Verify ownership
        if (result.metadata.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { buffer, metadata } = result;

        res.set({
            'Content-Type': metadata.mimeType || 'application/octet-stream',
            'Content-Disposition': `inline; filename="${encodeURIComponent(metadata.originalName || metadata.name)}"`,
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    } catch (error: any) {
        console.error('Error previewing file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/files/upload
 * Upload a new file
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }

        const { folderId, assignmentId, type } = req.body;

        const file = await storageService.saveFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            {
                userId,
                folderId: folderId || null,
                assignmentId: assignmentId || null,
                type: type || 'draft',
            }
        );

        res.status(201).json({ data: file });
    } catch (error: any) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/files/upload-multiple
 * Upload multiple files
 */
router.post('/upload-multiple', upload.array('files', 10), async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const uploadedFiles = req.files as Express.Multer.File[];
        if (!uploadedFiles || uploadedFiles.length === 0) {
            res.status(400).json({ error: 'No files provided' });
            return;
        }

        const { folderId, assignmentId, type } = req.body;
        const results = [];

        for (const uploadedFile of uploadedFiles) {
            const file = await storageService.saveFile(
                uploadedFile.buffer,
                uploadedFile.originalname,
                uploadedFile.mimetype,
                {
                    userId,
                    folderId: folderId || null,
                    assignmentId: assignmentId || null,
                    type: type || 'draft',
                }
            );
            results.push(file);
        }

        res.status(201).json({ data: results });
    } catch (error: any) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/files/:id
 * Update file metadata
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const file = await storageService.getFile(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        // Verify ownership
        if (file.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { name, folderId, assignmentId, type, isStarred } = req.body;

        const updated = await storageService.updateFile(req.params.id, {
            name,
            folderId,
            assignmentId,
            type,
            isStarred,
        });

        res.json({ data: updated });
    } catch (error: any) {
        console.error('Error updating file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/files/:id/star
 * Toggle star status
 */
router.post('/:id/star', async (req: Request, res: Response): Promise<void> => {
    try {
        const file = await storageService.getFile(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        if (file.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const updated = await storageService.updateFile(req.params.id, {
            isStarred: !file.isStarred,
        });

        res.json({ data: updated });
    } catch (error: any) {
        console.error('Error toggling star:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/files/:id/move
 * Move file to another folder
 */
router.post('/:id/move', async (req: Request, res: Response): Promise<void> => {
    try {
        const file = await storageService.getFile(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        if (file.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { folderId } = req.body;

        const updated = await storageService.updateFile(req.params.id, {
            folderId: folderId || null,
        });

        res.json({ data: updated });
    } catch (error: any) {
        console.error('Error moving file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/files/:id
 * Delete a file
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const file = await storageService.getFile(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        // Verify ownership
        if (file.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        await storageService.deleteFile(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
