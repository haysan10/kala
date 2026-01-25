/**
 * Blocks Routes
 * 
 * API endpoints for assignment content blocks
 */

import { Router, Request, Response } from 'express';
import { blocksService } from '../services/blocks.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    createContentBlockSchema,
    updateContentBlockSchema,
    reorderBlocksSchema,
    bulkCreateContentBlocksSchema
} from '../types/index.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/blocks/assignment/:assignmentId
 * Get all blocks for an assignment
 */
router.get('/assignment/:assignmentId', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const blocks = await blocksService.getBlocksByAssignment(req.params.assignmentId, userId);
        sendSuccess(res, blocks);
    } catch (error: any) {
        console.error('Error getting blocks:', error);
        sendError(res, error.message);
    }
});

/**
 * POST /api/blocks
 * Create a new content block
 */
router.post('/', validate(createContentBlockSchema), async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const block = await blocksService.createBlock({
            ...req.body,
            userId,
        });
        sendSuccess(res, block, 201);
    } catch (error: any) {
        console.error('Error creating block:', error);
        sendError(res, error.message);
    }
});

/**
 * POST /api/blocks/bulk
 * Create multiple content blocks (e.g., from template)
 */
router.post('/bulk', validate(bulkCreateContentBlocksSchema), async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { assignmentId, blocks } = req.body;
        const createdBlocks = await blocksService.bulkCreateBlocks(assignmentId, userId, blocks);
        sendSuccess(res, createdBlocks, 201);
    } catch (error: any) {
        console.error('Error creating bulk blocks:', error);
        sendError(res, error.message);
    }
});

/**
 * PATCH /api/blocks/:id
 * Update a content block
 */
router.patch('/:id', validate(updateContentBlockSchema), async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const block = await blocksService.updateBlock(req.params.id, userId, req.body);
        if (!block) {
            sendError(res, 'Block not found', 404);
            return;
        }
        sendSuccess(res, block);
    } catch (error: any) {
        console.error('Error updating block:', error);
        sendError(res, error.message);
    }
});

/**
 * DELETE /api/blocks/:id
 * Delete a content block
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const success = await blocksService.deleteBlock(req.params.id, userId);
        sendSuccess(res, { success });
    } catch (error: any) {
        console.error('Error deleting block:', error);
        sendError(res, error.message);
    }
});

/**
 * POST /api/blocks/assignment/:assignmentId/reorder
 * Reorder blocks for an assignment
 */
router.post('/assignment/:assignmentId/reorder', validate(reorderBlocksSchema), async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { blockIds } = req.body;
        const success = await blocksService.reorderBlocks(req.params.assignmentId, userId, blockIds);
        sendSuccess(res, { success });
    } catch (error: any) {
        console.error('Error reordering blocks:', error);
        sendError(res, error.message);
    }
});

export default router;
