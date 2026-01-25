/**
 * Blocks API Service
 * 
 * Frontend API client for assignment content blocks
 */

import api from './api';

// ==================== TYPES ====================

export type ContentBlockType =
    | "text"
    | "heading"
    | "image"
    | "code"
    | "task"
    | "milestone"
    | "quiz"
    | "file"
    | "divider"
    | "callout"
    | "math"
    | "milestone_ref"
    | "citation"
    | "reflection"
    | "debate"
    | "progress"
    | "file_embed";

export interface ContentBlock {
    id: string;
    assignmentId: string;
    userId: string;
    type: ContentBlockType;
    content: string;
    metadata: Record<string, any>;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContentBlockInput {
    assignmentId: string;
    type: ContentBlockType;
    content: string;
    metadata?: Record<string, any>;
    sortOrder?: number;
}

export interface UpdateContentBlockInput {
    type?: ContentBlockType;
    content?: string;
    metadata?: Record<string, any>;
    sortOrder?: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Get all blocks for an assignment
 */
export async function getBlocks(assignmentId: string): Promise<ContentBlock[]> {
    const response = await api.get<{ data: ContentBlock[] }>(`/api/blocks/assignment/${assignmentId}`);
    return response.data.data;
}

/**
 * Create a new content block
 */
export async function createBlock(input: CreateContentBlockInput): Promise<ContentBlock> {
    const response = await api.post<{ data: ContentBlock }>('/api/blocks', input);
    return response.data.data;
}

/**
 * Update a content block
 */
export async function updateBlock(
    blockId: string,
    data: UpdateContentBlockInput
): Promise<ContentBlock> {
    const response = await api.patch<{ data: ContentBlock }>(`/api/blocks/${blockId}`, data);
    return response.data.data;
}

/**
 * Delete a content block
 */
export async function deleteBlock(blockId: string): Promise<void> {
    await api.delete(`/api/blocks/${blockId}`);
}

/**
 * Reorder blocks
 */
export async function reorderBlocks(
    assignmentId: string,
    blockIds: string[]
): Promise<void> {
    await api.post(`/api/blocks/assignment/${assignmentId}/reorder`, { blockIds });
}

/**
 * Create multiple blocks (bulk)
 */
export async function createBlocksBulk(assignmentId: string, blocks: any[]): Promise<ContentBlock[]> {
    const response = await api.post<{ data: ContentBlock[] }>('/api/blocks/bulk', { assignmentId, blocks });
    return response.data.data;
}

export const blocksApi = {
    getBlocks,
    createBlock,
    createBlocksBulk,
    updateBlock,
    deleteBlock,
    reorderBlocks,
};
