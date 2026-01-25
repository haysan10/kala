/**
 * Toast Notification System
 * 
 * A beautiful, accessible toast notification system for KALA
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss with progress bar
 * - Stacked notifications
 * - Action buttons
 * - Smooth animations
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    X,
    Loader2,
} from 'lucide-react';

// ==================== TYPES ====================

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastAction {
    label: string;
    onClick: () => void;
}

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number; // ms, 0 = no auto-dismiss
    action?: ToastAction;
    dismissible?: boolean;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    updateToast: (id: string, toast: Partial<Toast>) => void;
    // Convenience methods
    success: (title: string, message?: string, options?: Partial<Toast>) => string;
    error: (title: string, message?: string, options?: Partial<Toast>) => string;
    warning: (title: string, message?: string, options?: Partial<Toast>) => string;
    info: (title: string, message?: string, options?: Partial<Toast>) => string;
    loading: (title: string, message?: string) => string;
    promise: <T>(
        promise: Promise<T>,
        messages: { loading: string; success: string; error: string }
    ) => Promise<T>;
}

// ==================== CONTEXT ====================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// ==================== PROVIDER ====================

interface ToastProviderProps {
    children: React.ReactNode;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    maxToasts?: number;
}

export function ToastProvider({
    children,
    position = 'top-right',
    maxToasts = 5,
}: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = generateId();
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? (toast.type === 'loading' ? 0 : 5000),
            dismissible: toast.dismissible ?? true,
        };

        setToasts((prev) => {
            const updated = [newToast, ...prev];
            return updated.slice(0, maxToasts);
        });

        return id;
    }, [maxToasts]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    }, []);

    // Convenience methods
    const success = useCallback(
        (title: string, message?: string, options?: Partial<Toast>) =>
            addToast({ type: 'success', title, message, ...options }),
        [addToast]
    );

    const error = useCallback(
        (title: string, message?: string, options?: Partial<Toast>) =>
            addToast({ type: 'error', title, message, duration: 8000, ...options }),
        [addToast]
    );

    const warning = useCallback(
        (title: string, message?: string, options?: Partial<Toast>) =>
            addToast({ type: 'warning', title, message, ...options }),
        [addToast]
    );

    const info = useCallback(
        (title: string, message?: string, options?: Partial<Toast>) =>
            addToast({ type: 'info', title, message, ...options }),
        [addToast]
    );

    const loading = useCallback(
        (title: string, message?: string) =>
            addToast({ type: 'loading', title, message, duration: 0, dismissible: false }),
        [addToast]
    );

    const promise = useCallback(
        async <T,>(
            promiseToResolve: Promise<T>,
            messages: { loading: string; success: string; error: string }
        ): Promise<T> => {
            const id = loading(messages.loading);
            try {
                const result = await promiseToResolve;
                updateToast(id, {
                    type: 'success',
                    title: messages.success,
                    duration: 5000,
                    dismissible: true,
                });
                return result;
            } catch (err) {
                updateToast(id, {
                    type: 'error',
                    title: messages.error,
                    message: err instanceof Error ? err.message : 'An unexpected error occurred',
                    duration: 8000,
                    dismissible: true,
                });
                throw err;
            }
        },
        [loading, updateToast]
    );

    const value: ToastContextValue = {
        toasts,
        addToast,
        removeToast,
        updateToast,
        success,
        error,
        warning,
        info,
        loading,
        promise,
    };

    // Position classes
    const positionClasses: Record<string, string> = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast Container */}
            <div
                className={`fixed z-[9999] flex flex-col gap-3 pointer-events-none ${positionClasses[position]}`}
                aria-live="polite"
                aria-label="Notifications"
            >
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onDismiss={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// ==================== TOAST ITEM ====================

interface ToastItemProps {
    toast: Toast;
    onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const [progress, setProgress] = useState(100);

    // Auto-dismiss timer
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const startTime = Date.now();
            const endTime = startTime + toast.duration;

            const timer = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, endTime - now);
                const percent = (remaining / toast.duration!) * 100;
                setProgress(percent);

                if (percent <= 0) {
                    clearInterval(timer);
                    onDismiss();
                }
            }, 50);

            return () => clearInterval(timer);
        }
    }, [toast.duration, onDismiss]);

    // Toast styles by type
    const styles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; iconBg: string }> = {
        success: {
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-green-500',
            icon: <CheckCircle2 size={20} />,
            iconBg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        },
        error: {
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-red-500',
            icon: <XCircle size={20} />,
            iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        },
        warning: {
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-amber-500',
            icon: <AlertTriangle size={20} />,
            iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        },
        info: {
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-blue-500',
            icon: <Info size={20} />,
            iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        },
        loading: {
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-indigo-500',
            icon: <Loader2 size={20} className="animate-spin" />,
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        },
    };

    const style = styles[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
                pointer-events-auto w-[380px] max-w-[calc(100vw-2rem)]
                rounded-2xl shadow-2xl border-l-4 overflow-hidden
                ${style.bg} ${style.border}
            `}
            role="alert"
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg}`}>
                        {style.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {toast.title}
                        </h4>
                        {toast.message && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                {toast.message}
                            </p>
                        )}
                        {toast.action && (
                            <button
                                onClick={toast.action.onClick}
                                className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>

                    {/* Dismiss Button */}
                    {toast.dismissible && (
                        <button
                            onClick={onDismiss}
                            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {toast.duration && toast.duration > 0 && (
                <div className="h-1 bg-gray-100 dark:bg-gray-800">
                    <motion.div
                        className={`h-full ${toast.type === 'success' ? 'bg-green-500' :
                                toast.type === 'error' ? 'bg-red-500' :
                                    toast.type === 'warning' ? 'bg-amber-500' :
                                        toast.type === 'info' ? 'bg-blue-500' :
                                            'bg-indigo-500'
                            }`}
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.05 }}
                    />
                </div>
            )}
        </motion.div>
    );
}

// ==================== CONFIRMATION DIALOG ====================

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    type = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            icon: <AlertTriangle size={24} />,
            iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            icon: <AlertTriangle size={24} />,
            iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
            button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        },
        info: {
            icon: <Info size={24} />,
            iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        },
    };

    const style = typeStyles[type];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${style.iconBg}`}>
                            {style.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${style.button}`}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ==================== HOOK FOR CONFIRMATION ====================

export function useConfirm() {
    const [state, setState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        confirmLabel: string;
        cancelLabel: string;
        loading: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        loading: false,
        onConfirm: () => { },
    });

    const confirm = useCallback(
        (options: {
            title: string;
            message: string;
            type?: 'danger' | 'warning' | 'info';
            confirmLabel?: string;
            cancelLabel?: string;
        }): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    title: options.title,
                    message: options.message,
                    type: options.type || 'danger',
                    confirmLabel: options.confirmLabel || 'Confirm',
                    cancelLabel: options.cancelLabel || 'Cancel',
                    loading: false,
                    onConfirm: () => {
                        setState((prev) => ({ ...prev, isOpen: false }));
                        resolve(true);
                    },
                });

                // Handle close/cancel
                const handleClose = () => {
                    setState((prev) => ({ ...prev, isOpen: false }));
                    resolve(false);
                };

                // Store close handler
                setState((prev) => ({ ...prev, onClose: handleClose }));
            });
        },
        []
    );

    const ConfirmDialogComponent = (
        <ConfirmDialog
            isOpen={state.isOpen}
            onClose={() => setState((prev) => ({ ...prev, isOpen: false }))}
            onConfirm={state.onConfirm}
            title={state.title}
            message={state.message}
            type={state.type}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            loading={state.loading}
        />
    );

    return { confirm, ConfirmDialog: ConfirmDialogComponent };
}

export default ToastProvider;
