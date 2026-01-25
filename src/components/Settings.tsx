import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserSettings {
    id: string;
    userId: string;
    aiProvider: 'gemini' | 'grok';
    geminiApiKey: string | null;
    grokApiKey: string | null;
    aiTemperature: number;
    aiMaxTokens: number;
    aiTopP: number;
    language: 'en' | 'id';
    thinkingMode: 'socratic' | 'guided' | 'exploratory';
    hintLevel: 'minimal' | 'moderate' | 'generous';
    // Advanced AI Behavior
    strictNoAnswers: boolean;
    detailedCourseMode: boolean;
    courseCitationStyle: 'academic' | 'web' | 'both';
    includeSourceLinks: boolean;
    customSystemPrompt: string | null;
    emailNotifications: boolean;
    pushNotifications: boolean;
}

interface AIStatus {
    hasGemini: boolean;
    hasGrok: boolean;
    activeProvider: 'gemini' | 'grok';
    canUseFallback: boolean;
    message: string;
    taskSpecialization: Record<string, { provider: string; reason: string }>;
}

interface ValidationState {
    validating: boolean;
    valid: boolean | null;
    message: string;
}

interface SettingsProps {
    onNavigate?: (view: any) => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ onNavigate }) => {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [aiProvider, setAiProvider] = useState<'gemini' | 'grok'>('gemini');
    const [geminiKey, setGeminiKey] = useState('');
    const [grokKey, setGrokKey] = useState('');
    const [language, setLanguage] = useState<'en' | 'id'>('id');
    const [thinkingMode, setThinkingMode] = useState<'socratic' | 'guided' | 'exploratory'>('socratic');
    const [hintLevel, setHintLevel] = useState<'minimal' | 'moderate' | 'generous'>('minimal');
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(true);

    // Advanced AI Settings
    const [strictNoAnswers, setStrictNoAnswers] = useState(true);
    const [detailedCourseMode, setDetailedCourseMode] = useState(true);
    const [courseCitationStyle, setCourseCitationStyle] = useState<'academic' | 'web' | 'both'>('academic');
    const [includeSourceLinks, setIncludeSourceLinks] = useState(true);
    const [customSystemPrompt, setCustomSystemPrompt] = useState('');

    // Validation states
    const [geminiValidation, setGeminiValidation] = useState<ValidationState>({ validating: false, valid: null, message: '' });
    const [grokValidation, setGrokValidation] = useState<ValidationState>({ validating: false, valid: null, message: '' });

    useEffect(() => {
        fetchSettings();
        fetchAIStatus();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('kala_token');
            const response = await fetch(`/api/user/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch settings');

            const data = await response.json();
            if (data.success) {
                setSettings(data.data);
                // Populate form
                setAiProvider(data.data.aiProvider || 'gemini');
                setGeminiKey(data.data.geminiApiKey || '');
                setGrokKey(data.data.grokApiKey || '');
                setLanguage(data.data.language || 'id');
                setThinkingMode(data.data.thinkingMode || 'socratic');
                setHintLevel(data.data.hintLevel || 'minimal');
                setEmailNotif(data.data.emailNotifications ?? true);
                setPushNotif(data.data.pushNotifications ?? true);

                // Advanced AI Settings
                setStrictNoAnswers(data.data.strictNoAnswers ?? true);
                setDetailedCourseMode(data.data.detailedCourseMode ?? true);
                setCourseCitationStyle(data.data.courseCitationStyle || 'academic');
                setIncludeSourceLinks(data.data.includeSourceLinks ?? true);
                setCustomSystemPrompt(data.data.customSystemPrompt || '');

                // Set validation status based on existing keys
                if (data.data.geminiApiKey && data.data.geminiApiKey.startsWith('****')) {
                    setGeminiValidation({ validating: false, valid: true, message: 'API key tersimpan' });
                }
                if (data.data.grokApiKey && data.data.grokApiKey.startsWith('****')) {
                    setGrokValidation({ validating: false, valid: true, message: 'API key tersimpan' });
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Gagal memuat pengaturan' });
        } finally {
            setLoading(false);
        }
    };

    const fetchAIStatus = async () => {
        try {
            const token = localStorage.getItem('kala_token');
            const response = await fetch(`/api/user/ai-status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAiStatus(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching AI status:', error);
        }
    };

    const validateApiKey = async (provider: 'gemini' | 'grok', apiKey: string) => {
        // Skip if key is masked (already saved)
        if (apiKey.startsWith('****')) return;

        // Skip if key is empty
        if (!apiKey.trim()) {
            if (provider === 'gemini') {
                setGeminiValidation({ validating: false, valid: null, message: '' });
            } else {
                setGrokValidation({ validating: false, valid: null, message: '' });
            }
            return;
        }

        // Set validating state
        if (provider === 'gemini') {
            setGeminiValidation({ validating: true, valid: null, message: 'Memvalidasi...' });
        } else {
            setGrokValidation({ validating: true, valid: null, message: 'Memvalidasi...' });
        }

        try {
            const token = localStorage.getItem('kala_token');
            const response = await fetch(`/api/user/validate-api-key`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ provider, apiKey }),
            });

            const data = await response.json();

            if (provider === 'gemini') {
                setGeminiValidation({
                    validating: false,
                    valid: data.success,
                    message: data.success ? '✓ API key valid!' : data.error || 'API key tidak valid'
                });
            } else {
                setGrokValidation({
                    validating: false,
                    valid: data.success,
                    message: data.success ? '✓ API key valid!' : data.error || 'API key tidak valid'
                });
            }
        } catch (error) {
            const errorMsg = 'Gagal memvalidasi API key';
            if (provider === 'gemini') {
                setGeminiValidation({ validating: false, valid: false, message: errorMsg });
            } else {
                setGrokValidation({ validating: false, valid: false, message: errorMsg });
            }
        }
    };

    const handleSave = async () => {
        // Check if at least one API key is provided
        const hasNewGemini = geminiKey && !geminiKey.startsWith('****');
        const hasNewGrok = grokKey && !grokKey.startsWith('****');
        const hasExistingGemini = geminiKey.startsWith('****');
        const hasExistingGrok = grokKey.startsWith('****');

        // Warn if no valid key
        if (!hasNewGemini && !hasNewGrok && !hasExistingGemini && !hasExistingGrok) {
            setMessage({ type: 'error', text: 'Minimal satu API key diperlukan untuk menggunakan fitur AI' });
            return;
        }

        // Check validation status for new keys
        if (hasNewGemini && geminiValidation.valid === false) {
            setMessage({ type: 'error', text: 'API key Gemini tidak valid. Silakan perbaiki sebelum menyimpan.' });
            return;
        }
        if (hasNewGrok && grokValidation.valid === false) {
            setMessage({ type: 'error', text: 'API key Grok tidak valid. Silakan perbaiki sebelum menyimpan.' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('kala_token');
            const response = await fetch(`/api/user/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    aiProvider,
                    geminiApiKey: geminiKey,
                    grokApiKey: grokKey,
                    language,
                    thinkingMode,
                    hintLevel,
                    emailNotifications: emailNotif,
                    pushNotifications: pushNotif,
                    // Advanced AI Settings
                    strictNoAnswers,
                    detailedCourseMode,
                    courseCitationStyle,
                    includeSourceLinks,
                    customSystemPrompt: customSystemPrompt.trim() || null,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
                fetchSettings(); // Refresh to get masked keys
                fetchAIStatus(); // Refresh AI status
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal menyimpan pengaturan' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' });
        } finally {
            setSaving(false);
        }
    };

    const clearApiKey = async (provider: 'gemini' | 'grok') => {
        try {
            const token = localStorage.getItem('kala_token');
            await fetch(`/api/user/settings/api-key/${provider}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (provider === 'gemini') {
                setGeminiKey('');
                setGeminiValidation({ validating: false, valid: null, message: '' });
            } else {
                setGrokKey('');
                setGrokValidation({ validating: false, valid: null, message: '' });
            }

            fetchAIStatus();
            setMessage({ type: 'success', text: `API key ${provider} berhasil dihapus` });
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menghapus API key' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-sm font-bold uppercase tracking-widest">Hydrating Settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-t-primary pb-32 transition-colors">
            <div className="max-w-4xl space-y-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-3"
                >
                    <h1 className="text-5xl font-black tracking-tighter text-t-primary uppercase italic">
                        Settings
                    </h1>
                    <p className="text-t-tertiary font-medium text-lg">Configure your intelligent academic environment.</p>
                </motion.div>

                {/* Message */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className={`p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                : 'bg-red-500/20 border border-red-500/50 text-red-400'
                                }`}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Status Card */}
                {aiStatus && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-secondary border border-soft rounded-[2rem] p-8 shadow-sm"
                    >
                        <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-t-primary uppercase tracking-tight">
                            Status AI
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className={`p-6 rounded-2xl ${aiStatus.hasGemini ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-tertiary border border-soft'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${aiStatus.hasGemini ? 'bg-emerald-500 animate-pulse' : 'bg-t-muted'}`}></span>
                                    <span className="font-black uppercase tracking-widest text-xs text-t-primary">Google Gemini</span>
                                </div>
                                <p className="text-sm text-t-secondary mt-2 font-medium">
                                    {aiStatus.hasGemini ? 'Connected & Active' : 'Disconnected'}
                                </p>
                            </div>

                            <div className={`p-6 rounded-2xl ${aiStatus.hasGrok ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-tertiary border border-soft'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${aiStatus.hasGrok ? 'bg-emerald-500 animate-pulse' : 'bg-t-muted'}`}></span>
                                    <span className="font-black uppercase tracking-widest text-xs text-t-primary">xAI Grok</span>
                                </div>
                                <p className="text-sm text-t-secondary mt-2 font-medium">
                                    {aiStatus.hasGrok ? 'Connected & Active' : 'Disconnected'}
                                </p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl text-sm font-medium ${aiStatus.canUseFallback ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
                            💡 {aiStatus.message}
                        </div>
                    </motion.section>
                )}

                {/* AI Provider Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary border border-soft rounded-[2rem] p-8 shadow-sm"
                >
                    <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-t-primary uppercase tracking-tight">
                        AI Configuration Options
                    </h2>
                    <p className="text-t-secondary text-sm mb-6 font-medium">
                        Anda dapat menggunakan satu atau kedua provider AI. KALA akan otomatis memilih AI yang optimal untuk setiap tugas.
                    </p>

                    <div className="space-y-6">
                        {/* Provider Selection */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-t-tertiary mb-3">
                                Primary AI Provider
                            </label>
                            <select
                                value={aiProvider}
                                onChange={(e) => setAiProvider(e.target.value as 'gemini' | 'grok')}
                                className="w-full px-4 py-3.5 bg-primary border border-medium rounded-xl text-sm font-bold text-t-primary focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:outline-none transition-all"
                            >
                                <option value="gemini">Google Gemini (Recommended for Analysis)</option>
                                <option value="grok">xAI Grok (Recommended for Chat)</option>
                            </select>
                            <p className="text-xs text-t-muted mt-2 font-medium">
                                Provider utama untuk tugas yang tidak memiliki preferensi khusus
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-xs text-t-tertiary">Butuh bantuan mendapatkan API key?</span>
                                <button
                                    onClick={() => onNavigate?.('documentation')}
                                    className="text-xs font-bold text-blue-500 hover:underline"
                                >
                                    Lihat Panduan Dokumentasi
                                </button>
                            </div>
                        </div>

                        {/* Gemini API Key */}
                        <div className="p-5 bg-tertiary rounded-2xl border border-soft">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-t-primary flex items-center gap-2">
                                    <span className="text-lg">💎</span> Gemini API Key
                                </label>
                                {geminiKey.startsWith('****') && (
                                    <button
                                        onClick={() => clearApiKey('gemini')}
                                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Hapus Key
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => {
                                        setGeminiKey(e.target.value);
                                        setGeminiValidation({ validating: false, valid: null, message: '' });
                                    }}
                                    placeholder="AIzaSy..."
                                    className="flex-1 px-4 py-3.5 bg-primary border border-medium rounded-xl text-sm font-bold text-t-primary placeholder:text-t-muted focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                                {!geminiKey.startsWith('****') && geminiKey.trim() && (
                                    <button
                                        onClick={() => validateApiKey('gemini', geminiKey)}
                                        disabled={geminiValidation.validating}
                                        className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                                    >
                                        {geminiValidation.validating ? '...' : 'Validasi'}
                                    </button>
                                )}
                            </div>
                            {/* Validation Status */}
                            {geminiValidation.message && (
                                <p className={`text-xs font-bold mt-3 ${geminiValidation.valid === true ? 'text-green-600 dark:text-green-400' : geminiValidation.valid === false ? 'text-red-600 dark:text-red-400' : 'text-t-muted'}`}>
                                    {geminiValidation.message}
                                </p>
                            )}
                            <p className="text-xs text-t-muted mt-3 font-medium">
                                Dapatkan API key di <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Google AI Studio</a>
                            </p>
                        </div>

                        {/* Grok API Key */}
                        <div className="p-5 bg-tertiary rounded-2xl border border-soft">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-t-primary flex items-center gap-2">
                                    <span className="text-lg">⚡</span> Grok API Key
                                </label>
                                {grokKey.startsWith('****') && (
                                    <button
                                        onClick={() => clearApiKey('grok')}
                                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Hapus Key
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="password"
                                    value={grokKey}
                                    onChange={(e) => {
                                        setGrokKey(e.target.value);
                                        setGrokValidation({ validating: false, valid: null, message: '' });
                                    }}
                                    placeholder="xai-..."
                                    className="flex-1 px-4 py-3.5 bg-primary border border-medium rounded-xl text-sm font-bold text-t-primary placeholder:text-t-muted focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                                {!grokKey.startsWith('****') && grokKey.trim() && (
                                    <button
                                        onClick={() => validateApiKey('grok', grokKey)}
                                        disabled={grokValidation.validating}
                                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                                    >
                                        {grokValidation.validating ? '...' : 'Validasi'}
                                    </button>
                                )}
                            </div>
                            {/* Validation Status */}
                            {grokValidation.message && (
                                <p className={`text-xs font-bold mt-3 ${grokValidation.valid === true ? 'text-green-600 dark:text-green-400' : grokValidation.valid === false ? 'text-red-600 dark:text-red-400' : 'text-t-muted'}`}>
                                    {grokValidation.message}
                                </p>
                            )}
                            <p className="text-xs text-t-muted mt-3 font-medium">
                                Dapatkan API key di <a href="https://console.x.ai/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">xAI Console</a>
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* Integrations Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary border border-soft rounded-[2rem] p-8 shadow-sm"
                >
                    <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-t-primary uppercase tracking-tight">
                        Integrations
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-5 bg-tertiary rounded-2xl border border-soft">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2">
                                    <svg viewBox="0 0 87.3 78" className="w-full h-full">
                                        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l18.25-30.5-6.3-10.9-19.1 31.45z" fill="#0066da" />
                                        <path d="M43.65 25 18.2 25 5.7 46.65c-1.4.8-2.5 1.9-3.3 3.3l25.5 44.25h18.45l26-45.15H43.65z" fill="#00ac47" />
                                        <path d="M73.55 76.8c1.4-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-53.7l12.95 22.25 27 1.55z" fill="#ea4335" />
                                        <path d="M43.65 25h27.85c1.55 0 3.1.4 4.5 1.2l-13.6 23.55-18.75 32.5h-26l26-57.25z" fill="#0055ff" />
                                        <path d="M43.65 25 21.45 61.2 11.25 78h48.35L87.3 32.5 73.55 8.7C72.2 6.35 69.75 5 67 5H18.2l25.45 20z" fill="#ffba00" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-t-primary flex items-center gap-2">
                                        Google Drive
                                        {/* TODO: Check connection status from backend */}
                                        <span className="px-2 py-0.5 rounded-full bg-t-muted/10 text-t-muted text-[10px] uppercase tracking-wider">Cloud Storage</span>
                                    </h3>
                                    <p className="text-xs text-t-secondary mt-1 max-w-md">
                                        Sync assignments and resources directly to your Google Drive.
                                        Requires additional permission.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    // Redirect to Google Drive Auth flow
                                    window.location.href = `/api/auth/google/drive`;
                                }}
                                className="px-5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl text-xs font-bold uppercase tracking-widest text-t-primary transition-colors shadow-sm"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Language & Notifications */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary border border-soft rounded-[2rem] p-8 shadow-sm"
                >
                    <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-t-primary uppercase tracking-tight">
                        Language & Notifications
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-t-tertiary mb-3">
                                AI Response Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'en' | 'id')}
                                className="w-full px-4 py-3.5 bg-primary border border-medium rounded-xl text-sm font-bold text-t-primary focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:outline-none transition-all"
                            >
                                <option value="id">Bahasa Indonesia</option>
                                <option value="en">English (US)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between py-5 border-t border-soft">
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight text-t-primary">Email Notifications</p>
                                <p className="text-xs text-t-muted font-medium mt-1">Receive important updates via email.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={emailNotif}
                                    onChange={(e) => setEmailNotif(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-tertiary border border-soft peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-t-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 peer-checked:after:bg-white"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between py-5 border-t border-soft">
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight text-t-primary">Push Notifications</p>
                                <p className="text-xs text-t-muted font-medium mt-1">Get real-time browser alerts.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={pushNotif}
                                    onChange={(e) => setPushNotif(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-tertiary border border-soft peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-t-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 peer-checked:after:bg-white"></div>
                            </label>
                        </div>
                    </div>
                </motion.section>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start gap-4"
                >
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-10 py-5 bg-accent text-primary rounded-full font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button
                        onClick={fetchSettings}
                        className="px-10 py-5 bg-secondary text-t-primary border border-soft rounded-full font-black text-xs uppercase tracking-widest hover:bg-tertiary transition-all"
                    >
                        Reset
                    </button>
                </motion.div>
            </div>
        </div >
    );
};

export default SettingsPage;
