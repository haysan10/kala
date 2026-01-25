/**
 * Courses API Service
 * 
 * Frontend API client for course/matakuliah management
 */

import api from './api';
import { Course, CourseWithStats } from '../types';

// ==================== TYPES ====================

export interface CreateCourseInput {
    name: string;
    code?: string;
    description?: string;
    color?: string;
    icon?: string;
    semester?: string;
    instructor?: string;
    credits?: number;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
    isArchived?: boolean;
    sortOrder?: number;
    coverImage?: string | null;
}

export interface IconSuggestion {
    emoji: string;
    subjects: string[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get all courses for the current user
 */
export async function getCourses(includeArchived: boolean = false): Promise<CourseWithStats[]> {
    const response = await api.get<{ data: CourseWithStats[] }>(
        `/api/courses?includeArchived=${includeArchived}`
    );
    return response.data.data;
}

/**
 * Get a single course by ID
 */
export async function getCourse(courseId: string): Promise<CourseWithStats> {
    const response = await api.get<{ data: CourseWithStats }>(`/api/courses/${courseId}`);
    return response.data.data;
}

/**
 * Get icon suggestions for course subjects
 */
export async function getIconSuggestions(): Promise<IconSuggestion[]> {
    const response = await api.get<{ data: IconSuggestion[] }>('/api/courses/icons');
    return response.data.data;
}

/**
 * Get assignments for a specific course
 */
export async function getCourseAssignments(courseId: string): Promise<any[]> {
    const response = await api.get<{ data: any[] }>(`/api/courses/${courseId}/assignments`);
    return response.data.data;
}

/**
 * Create a new course
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
    const response = await api.post<{ data: Course }>('/api/courses', input);
    return response.data.data;
}

/**
 * Update an existing course
 */
export async function updateCourse(courseId: string, input: UpdateCourseInput): Promise<Course> {
    const response = await api.put<{ data: Course }>(`/api/courses/${courseId}`, input);
    return response.data.data;
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<void> {
    await api.delete(`/api/courses/${courseId}`);
}

/**
 * Toggle archive status for a course
 */
export async function toggleCourseArchive(courseId: string): Promise<Course> {
    const response = await api.post<{ data: Course }>(`/api/courses/${courseId}/archive`);
    return response.data.data;
}

/**
 * Reorder courses
 */
export async function reorderCourses(courseIds: string[]): Promise<void> {
    await api.post('/api/courses/reorder', { courseIds });
}

/**
 * Link an assignment to a course
 */
export async function linkAssignmentToCourse(
    assignmentId: string,
    courseId: string | null
): Promise<void> {
    await api.post(`/api/courses/link-assignment/${assignmentId}`, { courseId });
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get a suggested icon based on course name
 */
export function getSuggestedIcon(courseName: string, suggestions: IconSuggestion[]): string {
    const lowerName = courseName.toLowerCase();

    for (const suggestion of suggestions) {
        for (const subject of suggestion.subjects) {
            if (lowerName.includes(subject.toLowerCase())) {
                return suggestion.emoji;
            }
        }
    }

    return '📚'; // Default icon
}

/**
 * Format course code for display
 */
export function formatCourseCode(code?: string): string {
    if (!code) return '';
    return code.toUpperCase();
}

/**
 * Calculate course progress as percentage
 */
export function calculateCourseProgress(course: CourseWithStats): number {
    if (course.assignmentCount === 0) return 0;
    return Math.round((course.completedCount / course.assignmentCount) * 100);
}

/**
 * Get progress color based on percentage
 */
export function getProgressColor(progress: number): string {
    if (progress >= 80) return '#22c55e'; // Green
    if (progress >= 50) return '#eab308'; // Yellow
    if (progress >= 20) return '#f97316'; // Orange
    return '#ef4444'; // Red
}

/**
 * Course color presets
 */
export const COURSE_COLORS = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
];
