/**
 * CourseCard Component
 * 
 * Displays a course/matakuliah card with progress and visual customization
 */

import React from 'react';
import { CourseWithStats } from '../types';
import { calculateCourseProgress, getProgressColor } from '../services/coursesApi';

interface CourseCardProps {
    course: CourseWithStats;
    onClick?: () => void;
    onEdit?: () => void;
    onArchive?: () => void;
    isSelected?: boolean;
    variant?: 'default' | 'compact' | 'mini';
}

export default function CourseCard({
    course,
    onClick,
    onEdit,
    onArchive,
    isSelected = false,
    variant = 'default',
}: CourseCardProps) {
    const progress = calculateCourseProgress(course);
    const progressColor = getProgressColor(progress);

    if (variant === 'mini') {
        return (
            <button
                onClick={onClick}
                className={`
          flex items-center gap-2 px-3 py-2 rounded-xl transition-all
          ${isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
        `}
                style={{ borderLeft: `3px solid ${course.color}` }}
            >
                <span className="text-lg">{course.icon}</span>
                <span className="text-sm font-medium truncate">{course.name}</span>
                {course.assignmentCount > 0 && (
                    <span className="text-xs text-gray-400">({course.assignmentCount})</span>
                )}
            </button>
        );
    }

    if (variant === 'compact') {
        return (
            <div
                onClick={onClick}
                className={`
          flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          ${isSelected ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'}
        `}
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${course.color}20` }}
                >
                    {course.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-gray-900 dark:text-white">
                        {course.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {course.assignmentCount} tugas • {progress}% selesai
                    </p>
                </div>
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: progressColor }}
                />
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`
        relative group rounded-2xl overflow-hidden cursor-pointer
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : ''}
      `}
        >
            {/* Color Header Strip */}
            <div
                className="h-2 w-full"
                style={{ backgroundColor: course.color }}
            />

            {/* Cover Image or Gradient */}
            <div
                className="h-24 relative flex items-center justify-center"
                style={{
                    background: course.coverImage
                        ? `url(${course.coverImage}) center/cover`
                        : `linear-gradient(135deg, ${course.color}40, ${course.color}10)`,
                }}
            >
                <span className="text-5xl filter drop-shadow-md">{course.icon}</span>

                {/* Actions Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm hover:bg-white dark:hover:bg-gray-700"
                        >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    )}
                    {onArchive && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onArchive(); }}
                            className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm hover:bg-white dark:hover:bg-gray-700"
                        >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title & Code */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {course.name}
                        </h3>
                        {course.code && (
                            <p className="text-xs font-mono text-gray-500 uppercase">
                                {course.code}
                            </p>
                        )}
                    </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {course.semester && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {course.semester}
                        </span>
                    )}
                    {course.instructor && (
                        <span className="flex items-center gap-1 truncate">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {course.instructor}
                        </span>
                    )}
                    {course.credits && (
                        <span>{course.credits} SKS</span>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">{course.assignmentCount}</span> Tugas
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                            <span className="font-semibold">{course.completedCount}</span> Selesai
                        </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: progressColor }}>
                        {progress}%
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: progressColor,
                        }}
                    />
                </div>
            </div>

            {/* Archived Badge */}
            {course.isArchived && (
                <div className="absolute top-4 left-4 px-2 py-0.5 bg-gray-900/70 text-white text-xs rounded-full">
                    Diarsipkan
                </div>
            )}
        </div>
    );
}
