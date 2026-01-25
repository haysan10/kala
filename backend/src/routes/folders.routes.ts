/**
 * Folders Routes
 * 
 * API endpoints for folder management
 */

import { Router, Request, Response } from 'express';
import { storageService } from '../services/storage.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth middleware to all folder routes
router.use(authMiddleware);

/**
 * GET /api/folders
 * List all folders for current user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { parentId } = req.query;
        const folders = await storageService.getUserFolders(
            userId,
            parentId === 'null' ? null : parentId as string | undefined
        );

        res.json({ data: folders });
    } catch (error: any) {
        console.error('Error listing folders:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/folders/tree
 * Get full folder tree for current user
 */
router.get('/tree', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get all folders
        const allFolders = await storageService.getUserFolders(userId);

        // Build tree structure
        const buildTree = (parentId: string | null): any[] => {
            return allFolders
                .filter(f => f.parentId === parentId)
                .map(folder => ({
                    ...folder,
                    children: buildTree(folder.id),
                }));
        };

        const tree = buildTree(null);
        res.json({ data: tree });
    } catch (error: any) {
        console.error('Error getting folder tree:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/folders/:id
 * Get single folder with contents
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const folder = await storageService.getFolder(req.params.id);
        if (!folder) {
            res.status(404).json({ error: 'Folder not found' });
            return;
        }

        // Verify ownership
        if (folder.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        // Get subfolders and files
        const subfolders = await storageService.getUserFolders(folder.userId, folder.id);
        const files = await storageService.getUserFiles(folder.userId, folder.id);

        res.json({
            data: {
                ...folder,
                subfolders,
                files,
            },
        });
    } catch (error: any) {
        console.error('Error getting folder:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/folders/:id/path
 * Get breadcrumb path from root to folder
 */
router.get('/:id/path', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const path: Array<{ id: string; name: string }> = [];
        let currentId: string | null = req.params.id;

        while (currentId) {
            const folder = await storageService.getFolder(currentId);
            if (!folder || folder.userId !== userId) break;

            path.unshift({ id: folder.id, name: folder.name });
            currentId = folder.parentId;
        }

        res.json({ data: path });
    } catch (error: any) {
        console.error('Error getting folder path:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/folders
 * Create a new folder
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { name, parentId, color, icon, assignmentId, courseId } = req.body;

        if (!name?.trim()) {
            res.status(400).json({ error: 'Folder name is required' });
            return;
        }

        // If parentId provided, verify it belongs to user
        if (parentId) {
            const parent = await storageService.getFolder(parentId);
            if (!parent || parent.userId !== userId) {
                res.status(400).json({ error: 'Invalid parent folder' });
                return;
            }
        }

        const folder = await storageService.createFolder({
            userId,
            name: name.trim(),
            parentId: parentId || null,
            color,
            icon,
            assignmentId,
            courseId,
        });

        res.status(201).json({ data: folder });
    } catch (error: any) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/folders/:id
 * Update folder
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const folder = await storageService.getFolder(req.params.id);
        if (!folder) {
            res.status(404).json({ error: 'Folder not found' });
            return;
        }

        // Verify ownership
        if (folder.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { name, color, icon, parentId, isStarred } = req.body;

        // Prevent moving to self or child
        if (parentId === req.params.id) {
            res.status(400).json({ error: 'Cannot move folder to itself' });
            return;
        }

        const updated = await storageService.updateFolder(req.params.id, {
            name,
            color,
            icon,
            parentId,
            isStarred,
        });

        res.json({ data: updated });
    } catch (error: any) {
        console.error('Error updating folder:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/folders/:id/star
 * Toggle star status
 */
router.post('/:id/star', async (req: Request, res: Response): Promise<void> => {
    try {
        const folder = await storageService.getFolder(req.params.id);
        if (!folder) {
            res.status(404).json({ error: 'Folder not found' });
            return;
        }

        if (folder.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const updated = await storageService.updateFolder(req.params.id, {
            isStarred: !folder.isStarred,
        });

        res.json({ data: updated });
    } catch (error: any) {
        console.error('Error toggling star:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/folders/:id/move
 * Move folder to another parent
 */
router.post('/:id/move', async (req: Request, res: Response): Promise<void> => {
    try {
        const folder = await storageService.getFolder(req.params.id);
        if (!folder) {
            res.status(404).json({ error: 'Folder not found' });
            return;
        }

        if (folder.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { parentId } = req.body;

        // Prevent moving to self
        if (parentId === req.params.id) {
            res.status(400).json({ error: 'Cannot move folder to itself' });
            return;
        }

        // Verify new parent belongs to user (if provided)
        if (parentId) {
            const parent = await storageService.getFolder(parentId);
            if (!parent || parent.userId !== req.user?.id) {
                res.status(400).json({ error: 'Invalid destination folder' });
                return;
            }
        }

        const updated = await storageService.updateFolder(req.params.id, {
            parentId: parentId || null,
        });

        res.json({ data: updated });
    } catch (error: any) {
        console.error('Error moving folder:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/folders/:id
 * Delete folder and all contents
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const folder = await storageService.getFolder(req.params.id);
        if (!folder) {
            res.status(404).json({ error: 'Folder not found' });
            return;
        }

        // Verify ownership
        if (folder.userId !== req.user?.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        await storageService.deleteFolder(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
