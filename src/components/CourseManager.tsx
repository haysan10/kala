/**
 * CourseManager Component
 * 
 * Full course management UI with create, edit, list, and organize functionality
 */

import React, { useState, useEffect } from 'react';
import { CourseWithStats, Course } from '../types';
import CourseCard from './CourseCard';
import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseArchive,
    getIconSuggestions,
    CreateCourseInput,
    UpdateCourseInput,
    IconSuggestion,
    COURSE_COLORS,
    getSuggestedIcon,
} from '../services/coursesApi';
import { useToast, ConfirmDialog } from './ui/Toast';

interface CourseManagerProps {
    onCourseSelect?: (course: CourseWithStats | null) => void;
    selectedCourseId?: string | null;
    mode?: 'full' | 'sidebar' | 'picker';
}

interface CourseFormData {
    name: string;
    code: string;
    description: string;
    color: string;
    icon: string;
    semester: string;
    instructor: string;
    credits: string;
}

const INITIAL_FORM: CourseFormData = {
    name: '',
    code: '',
    description: '',
    color: COURSE_COLORS[0],
    icon: '📚',
    semester: '',
    instructor: '',
    credits: '',
};

export default function CourseManager({
    onCourseSelect,
    selectedCourseId,
    mode = 'full',
}: CourseManagerProps) {
    const [courses, setCourses] = useState<CourseWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseWithStats | null>(null);
    const [formData, setFormData] = useState<CourseFormData>(INITIAL_FORM);
    const [saving, setSaving] = useState(false);
    const [iconSuggestions, setIconSuggestions] = useState<IconSuggestion[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<CourseWithStats | null>(null);
    const toast = useToast();

    // Common emojis for courses
    const EMOJI_OPTIONS = [
        '📚', '📖', '📐', '🧪', '💻', '🎨', '🎭', '🎵',
        '⚽', '🌍', '💼', '⚖️', '🏥', '🕌', '🔬', '📝',
        '🧮', '📊', '🗺️', '🌱', '🔧', '⚡', '🎓', '✏️',
    ];

    useEffect(() => {
        loadCourses();
        loadIconSuggestions();
    }, [showArchived]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await getCourses(showArchived);
            setCourses(data);
        } catch (err: any) {
            setError('Gagal memuat matakuliah');
            toast.error('Gagal Memuat', 'Tidak dapat memuat daftar matakuliah. Silakan coba lagi.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadIconSuggestions = async () => {
        try {
            const data = await getIconSuggestions();
            setIconSuggestions(data);
        } catch (err) {
            console.error('Failed to load icon suggestions:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.warning('Nama Diperlukan', 'Silakan masukkan nama matakuliah.');
            return;
        }

        try {
            setSaving(true);

            const baseInput = {
                name: formData.name.trim(),
                code: formData.code.trim() || undefined,
                description: formData.description.trim() || undefined,
                color: formData.color,
                icon: formData.icon,
                semester: formData.semester.trim() || undefined,
                instructor: formData.instructor.trim() || undefined,
                credits: formData.credits ? parseInt(formData.credits) : undefined,
            };

            if (editingCourse) {
                await updateCourse(editingCourse.id, baseInput as UpdateCourseInput);
                toast.success('Matakuliah Diperbarui', `"${formData.name}" berhasil diperbarui.`);
            } else {
                await createCourse(baseInput as CreateCourseInput);
                toast.success('Matakuliah Dibuat', `"${formData.name}" berhasil ditambahkan.`);
            }

            setShowModal(false);
            setEditingCourse(null);
            setFormData(INITIAL_FORM);
            loadCourses();
        } catch (err: any) {
            console.error('Failed to save course:', err);
            toast.error('Gagal Menyimpan', err.message || 'Tidak dapat menyimpan matakuliah. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (course: CourseWithStats) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            code: course.code || '',
            description: course.description || '',
            color: course.color,
            icon: course.icon,
            semester: course.semester || '',
            instructor: course.instructor || '',
            credits: course.credits?.toString() || '',
        });
        setShowModal(true);
    };

    const handleArchive = async (course: CourseWithStats) => {
        try {
            await toggleCourseArchive(course.id);
            const action = course.isArchived ? 'diaktifkan kembali' : 'diarsipkan';
            toast.success('Status Diubah', `"${course.name}" telah ${action}.`);
            loadCourses();
        } catch (err: any) {
            console.error('Failed to toggle archive:', err);
            toast.error('Gagal Mengubah', err.message || 'Tidak dapat mengubah status arsip.');
        }
    };

    const handleDelete = async (course: CourseWithStats) => {
        try {
            await deleteCourse(course.id);
            toast.success('Matakuliah Dihapus', `"${course.name}" telah dihapus. Tugas terkait tidak dihapus.`);
            setConfirmDelete(null);
            loadCourses();
            if (selectedCourseId === course.id) {
                onCourseSelect?.(null);
            }
        } catch (err: any) {
            console.error('Failed to delete course:', err);
            toast.error('Gagal Menghapus', err.message || 'Tidak dapat menghapus matakuliah.');
        }
    };

    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            // Auto-suggest icon based on name
            icon: prev.icon === '📚' ? getSuggestedIcon(name, iconSuggestions) : prev.icon,
        }));
    };

    const openNewCourseModal = () => {
        setEditingCourse(null);
        setFormData(INITIAL_FORM);
        setShowModal(true);
    };

    // Sidebar mode - compact list
    if (mode === 'sidebar') {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Matakuliah
                    </h3>
                    <button
                        onClick={openNewCourseModal}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4 text-gray-400">Memuat...</div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                        Belum ada matakuliah
                    </div>
                ) : (
                    <div className="space-y-1">
                        {/* All courses option */}
                        <button
                            onClick={() => onCourseSelect?.(null)}
                            className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left
                ${selectedCourseId === null
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                                }
              `}
                        >
                            <span className="text-lg">📋</span>
                            <span className="text-sm font-medium">Semua Tugas</span>
                        </button>

                        {courses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                variant="mini"
                                isSelected={selectedCourseId === course.id}
                                onClick={() => onCourseSelect?.(course)}
                            />
                        ))}
                    </div>
                )}

                {/* Modal for sidebar mode */}
                {showModal && renderModal()}
            </div>
        );
    }

    // Picker mode - for assignment creation
    if (mode === 'picker') {
        return (
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    {courses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            variant="compact"
                            isSelected={selectedCourseId === course.id}
                            onClick={() => onCourseSelect?.(course)}
                        />
                    ))}
                </div>
                <button
                    onClick={openNewCourseModal}
                    className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                >
                    + Tambah Matakuliah Baru
                </button>
                {showModal && renderModal()}
            </div>
        );
    }

    // Full mode - complete management UI
    function renderModal() {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {editingCourse ? 'Edit Matakuliah' : 'Tambah Matakuliah Baru'}
                        </h2>
                        <button
                            onClick={() => setShowModal(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Icon & Name Row */}
                        <div className="flex gap-3">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-2xl hover:border-indigo-400 transition-colors"
                                    style={{ backgroundColor: `${formData.color}20` }}
                                >
                                    {formData.icon}
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10 grid grid-cols-6 gap-1">
                                        {EMOJI_OPTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, icon: emoji }));
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Nama Matakuliah"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Code & Credits */}
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                placeholder="Kode (MTK101)"
                                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                            />
                            <input
                                type="number"
                                value={formData.credits}
                                onChange={(e) => setFormData(prev => ({ ...prev, credits: e.target.value }))}
                                placeholder="SKS"
                                min="1"
                                max="10"
                                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Semester & Instructor */}
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={formData.semester}
                                onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                                placeholder="Semester (Ganjil 2025)"
                                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                value={formData.instructor}
                                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                                placeholder="Nama Dosen"
                                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Deskripsi singkat (opsional)"
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />

                        {/* Color Picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Warna
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {COURSE_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            {editingCourse && (
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(editingCourse)}
                                    className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                    Hapus
                                </button>
                            )}
                            <div className="flex-1" />
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !formData.name.trim()}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Menyimpan...' : editingCourse ? 'Simpan' : 'Tambah'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Matakuliah
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Kelola mata kuliah dan organisasikan tugas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Tampilkan arsip
                    </label>
                    <button
                        onClick={openNewCourseModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Matakuliah
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
                </div>
            ) : courses.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-4xl">📚</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Belum ada matakuliah
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Tambahkan matakuliah untuk mengorganisasikan tugas-tugas Anda dengan lebih baik
                    </p>
                    <button
                        onClick={openNewCourseModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Matakuliah Pertama
                    </button>
                </div>
            ) : (
                /* Course Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isSelected={selectedCourseId === course.id}
                            onClick={() => onCourseSelect?.(course)}
                            onEdit={() => handleEdit(course)}
                            onArchive={() => handleArchive(course)}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && renderModal()}

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => {
                    if (confirmDelete) {
                        handleDelete(confirmDelete);
                    }
                }}
                title="Hapus Matakuliah?"
                message={`Apakah Anda yakin ingin menghapus "${confirmDelete?.name}"? Tugas yang terkait tidak akan dihapus, hanya dilepas dari matakuliah ini.`}
                confirmLabel="Hapus"
                cancelLabel="Batal"
                type="danger"
            />
        </div>
    );
}
