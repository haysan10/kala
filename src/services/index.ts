/**
 * KALA - Services Index
 * 
 * This file exports all services for easier imports.
 * Import services like: import { geminiService, authService } from '@/services'
 */

// ===== Core API Services =====
export * from './api';
export * from './authService';

// ===== AI Services =====
export * from './geminiService';

// ===== Domain Services =====
export * from './assignmentService';
export * from './calendarApi';
export * from './coursesApi';
export * from './storageApi';
export * from './blocksApi';

// ===== Utility Services =====
export * from './exportApi';
export * from './exportService';
export * from './templateService';
