/**
 * Blocks Service
 * 
 * Handles CRUD for assignment content blocks and reordering
 */

import { eq, and, asc, inArray } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
    contentBlocks,
    assignments,
    ContentBlock,
    NewContentBlock,
} from '../db/schema.js';
import { parseJsonField, stringifyJsonField } from '../utils/helpers.js';

// ==================== TYPES ====================

export interface FormattedContentBlock extends Omit<ContentBlock, 'metadata'> {
    metadata: Record<string, any>;
}

// ==================== SERVICE ====================

export class BlocksService {
    /**
     * Get all blocks for an assignment
     */
    async getBlocksByAssignment(assignmentId: string, userId: string): Promise<FormattedContentBlock[]> {
        const results = await db
            .select()
            .from(contentBlocks)
            .where(
                and(
                    eq(contentBlocks.assignmentId, assignmentId),
                    eq(contentBlocks.userId, userId)
                )
            )
            .orderBy(asc(contentBlocks.sortOrder));

        return results.map(this.formatBlock);
    }

    /**
     * Get single block
     */
    async getBlock(id: string, userId: string): Promise<FormattedContentBlock | null> {
        const [block] = await db
            .select()
            .from(contentBlocks)
            .where(
                and(
                    eq(contentBlocks.id, id),
                    eq(contentBlocks.userId, userId)
                )
            )
            .limit(1);

        if (!block) return null;
        return this.formatBlock(block);
    }

    /**
     * Create a new block
     */
    async createBlock(data: {
        assignmentId: string;
        userId: string;
        type: string;
        content: string;
        metadata?: Record<string, any>;
        sortOrder?: number;
    }): Promise<FormattedContentBlock> {
        // If sortOrder not provided, find the max and add 1
        let order = data.sortOrder;
        if (order === undefined) {
            const existing = await db
                .select({ sortOrder: contentBlocks.sortOrder })
                .from(contentBlocks)
                .where(eq(contentBlocks.assignmentId, data.assignmentId))
                .orderBy(asc(contentBlocks.sortOrder));

            order = existing.length > 0 ? (existing[existing.length - 1].sortOrder || 0) + 1 : 0;
        }

        const [block] = await db
            .insert(contentBlocks)
            .values({
                assignmentId: data.assignmentId,
                userId: data.userId,
                type: data.type,
                content: data.content,
                metadata: stringifyJsonField(data.metadata || {}),
                sortOrder: order,
            })
            .returning();

        return this.formatBlock(block);
    }

    /**
     * Bulk create blocks
     */
    async bulkCreateBlocks(assignmentId: string, userId: string, blocks: any[]): Promise<FormattedContentBlock[]> {
        return await db.transaction(async (tx) => {
            const results = [];
            for (let i = 0; i < blocks.length; i++) {
                const b = blocks[i];
                const [inserted] = await tx
                    .insert(contentBlocks)
                    .values({
                        assignmentId,
                        userId,
                        type: b.type,
                        content: b.content,
                        metadata: stringifyJsonField(b.metadata || {}),
                        sortOrder: b.sortOrder !== undefined ? b.sortOrder : i,
                    })
                    .returning();
                results.push(this.formatBlock(inserted));
            }
            return results;
        });
    }

    /**
     * Update a block
     */
    async updateBlock(
        id: string,
        userId: string,
        data: Partial<{
            type: string;
            content: string;
            metadata: Record<string, any>;
            sortOrder: number;
        }>
    ): Promise<FormattedContentBlock | null> {
        const updateData: any = { ...data };
        if (data.metadata) {
            updateData.metadata = stringifyJsonField(data.metadata);
        }
        updateData.updatedAt = new Date().toISOString();

        const [updated] = await db
            .update(contentBlocks)
            .set(updateData)
            .where(
                and(
                    eq(contentBlocks.id, id),
                    eq(contentBlocks.userId, userId)
                )
            )
            .returning();

        if (!updated) return null;
        return this.formatBlock(updated);
    }

    /**
     * Delete a block
     */
    async deleteBlock(id: string, userId: string): Promise<boolean> {
        const result = await db
            .delete(contentBlocks)
            .where(
                and(
                    eq(contentBlocks.id, id),
                    eq(contentBlocks.userId, userId)
                )
            );

        return true;
    }

    /**
     * Reorder blocks
     */
    async reorderBlocks(assignmentId: string, userId: string, blockIds: string[]): Promise<boolean> {
        // Use a transaction for stability
        await db.transaction(async (tx) => {
            for (let i = 0; i < blockIds.length; i++) {
                await tx
                    .update(contentBlocks)
                    .set({ sortOrder: i, updatedAt: new Date().toISOString() })
                    .where(
                        and(
                            eq(contentBlocks.id, blockIds[i]),
                            eq(contentBlocks.assignmentId, assignmentId),
                            eq(contentBlocks.userId, userId)
                        )
                    );
            }
        });

        return true;
    }

    /**
     * Helper to format block for response
     */
    private formatBlock(block: ContentBlock): FormattedContentBlock {
        return {
            ...block,
            metadata: parseJsonField<Record<string, any>>(block.metadata),
        };
    }
}

export const blocksService = new BlocksService();
