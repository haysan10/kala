/**
 * Export Routes
 * 
 * API endpoints for exporting content to external services.
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { googleDriveService } from '../services/googleDrive.service.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/export/google-drive/folders
 * Lists folders in Google Drive
 */
router.get('/google-drive/folders', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { parentId } = req.query;
        await googleDriveService.setCredentials(userId);
        const folders = await googleDriveService.listFolders(parentId as string);
        return sendSuccess(res, folders);
    } catch (error: any) {
        console.error('List Google Drive folders failed:', error);
        return sendError(res, error.message);
    }
});

/**
 * POST /api/export/google-drive
 * Exports content to Google Drive
 */
router.post('/google-drive', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { title, content, folderId } = req.body;

        if (!title || !content) {
            return sendError(res, 'Title and content are required', 400);
        }

        // 1. Set credentials
        await googleDriveService.setCredentials(userId);

        // 2. Identify target folder
        let targetFolderId = folderId;
        if (!targetFolderId) {
            // Default to "KALA" folder in root
            const kalaFolder = await googleDriveService.getOrCreateFolder('KALA');
            targetFolderId = kalaFolder.id;
        }

        // 3. Create file
        const file = await googleDriveService.createMarkdownFile(title, content, targetFolderId);

        return sendSuccess(res, {
            message: 'Successfully exported to Google Drive',
            fileId: file.id,
            link: file.webViewLink
        });
    } catch (error: any) {
        console.error('Export to Google Drive failed:', error);
        if (error.message.includes('not connected') || error.message.includes('missing')) {
            return sendError(res, 'Please connect your Google Drive first.', 401);
        } else {
            return sendError(res, error.message);
        }
    }
});

export default router;
