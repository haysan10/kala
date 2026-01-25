/**
 * Documentation & Setup Guide Page
 * 
 * Comprehensive guide for:
 * - Getting Gemini API Key (free)
 * - Getting Grok API Key
 * - Setting up Google Drive integration
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Key, CloudIcon, ChevronDown, ChevronRight,
    ExternalLink, Copy, Check, AlertCircle, Sparkles,
    HardDrive, Settings, Shield, Link as LinkIcon
} from 'lucide-react';

type GuideSection = 'gemini' | 'grok' | 'drive' | null;

const DocumentationPage: React.FC = () => {
    const [expandedSection, setExpandedSection] = useState<GuideSection>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const toggleSection = (section: GuideSection) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="min-h-screen text-t-primary pb-32 transition-colors">
            <div className="max-w-4xl space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-3"
                >
                    <h1 className="text-5xl font-black tracking-tighter text-t-primary uppercase italic">
                        Documentation
                    </h1>
                    <p className="text-t-tertiary font-medium text-lg">
                        Setup guides and integration instructions for KALA
                    </p>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <button
                        onClick={() => toggleSection('gemini')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${expandedSection === 'gemini'
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : 'bg-secondary border-soft hover:border-blue-500/30'
                            }`}
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <h3 className="font-bold text-t-primary">Google Gemini</h3>
                        <p className="text-xs text-t-secondary mt-1">Get your free API key</p>
                    </button>

                    <button
                        onClick={() => toggleSection('grok')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${expandedSection === 'grok'
                            ? 'bg-purple-500/10 border-purple-500/50'
                            : 'bg-secondary border-soft hover:border-purple-500/30'
                            }`}
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                            <Key className="text-white" size={24} />
                        </div>
                        <h3 className="font-bold text-t-primary">xAI Grok</h3>
                        <p className="text-xs text-t-secondary mt-1">Alternative AI provider</p>
                    </button>

                    <button
                        onClick={() => toggleSection('drive')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${expandedSection === 'drive'
                            ? 'bg-green-500/10 border-green-500/50'
                            : 'bg-secondary border-soft hover:border-green-500/30'
                            }`}
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3">
                            <HardDrive className="text-white" size={24} />
                        </div>
                        <h3 className="font-bold text-t-primary">Google Drive</h3>
                        <p className="text-xs text-t-secondary mt-1">Sync your files</p>
                    </button>
                </motion.div>

                {/* Expanded Sections */}
                <AnimatePresence mode="wait">
                    {/* Gemini API Guide */}
                    {expandedSection === 'gemini' && (
                        <motion.section
                            key="gemini"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-secondary border border-soft rounded-[2rem] p-8 shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="text-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-t-primary">Mendapatkan Google Gemini API Key (GRATIS)</h2>
                                    <p className="text-sm text-t-secondary">Gemini adalah AI dari Google untuk analisis dan pembuatan konten</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Step 1 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Buka Google AI Studio</h3>
                                        <p className="text-sm text-t-secondary mb-3">
                                            Kunjungi halaman Google AI Studio untuk mendapatkan API key gratis.
                                        </p>
                                        <a
                                            href="https://aistudio.google.com/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors"
                                        >
                                            <ExternalLink size={16} />
                                            Buka Google AI Studio
                                        </a>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Login dengan Google Account</h3>
                                        <p className="text-sm text-t-secondary">
                                            Gunakan akun Google yang sama dengan yang Anda gunakan untuk KALA.
                                            Pastikan akun sudah berusia minimal 18 tahun.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Klik "Create API Key"</h3>
                                        <p className="text-sm text-t-secondary mb-3">
                                            Pada halaman API Keys, klik tombol "Create API Key in new project" atau pilih project yang sudah ada.
                                        </p>
                                        <div className="p-4 bg-tertiary rounded-xl border border-soft">
                                            <p className="text-xs text-t-muted mb-2 font-medium">Contoh format API Key:</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-3 py-2 bg-primary rounded-lg text-sm font-mono text-t-primary">
                                                    AIzaSyB1234567890abcdefghijklmnop
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard('AIzaSyB1234567890abcdefghijklmnop')}
                                                    className="p-2 rounded-lg hover:bg-primary transition-colors text-t-muted"
                                                >
                                                    {copiedText === 'AIzaSyB1234567890abcdefghijklmnop' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">4</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Simpan API Key di KALA</h3>
                                        <p className="text-sm text-t-secondary mb-3">
                                            Copy API key yang baru dibuat, lalu buka <strong>Settings → AI Configuration</strong> di KALA dan paste di field "Gemini API Key".
                                        </p>
                                        <a
                                            href="/settings"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary hover:bg-primary text-t-primary border border-soft rounded-xl font-medium text-sm transition-colors"
                                        >
                                            <Settings size={16} />
                                            Buka Settings
                                        </a>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm">Batas Gratis (Free Tier)</h4>
                                            <ul className="text-sm text-t-secondary mt-2 space-y-1">
                                                <li>• <strong>15 requests/menit</strong> untuk Gemini 1.5 Flash</li>
                                                <li>• <strong>1.500 requests/hari</strong> untuk penggunaan normal</li>
                                                <li>• Output hingga <strong>8.192 tokens</strong> per request</li>
                                                <li>• Gratis selamanya untuk penggunaan personal</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* Grok API Guide */}
                    {expandedSection === 'grok' && (
                        <motion.section
                            key="grok"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-secondary border border-soft rounded-[2rem] p-8 shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                    <Key className="text-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-t-primary">Mendapatkan xAI Grok API Key</h2>
                                    <p className="text-sm text-t-secondary">Grok adalah AI dari xAI (Elon Musk) untuk percakapan natural</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Step 1 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Buka xAI Console</h3>
                                        <p className="text-sm text-t-secondary mb-3">
                                            Kunjungi halaman xAI Console untuk mendaftarkan akun dan mendapatkan API key.
                                        </p>
                                        <a
                                            href="https://console.x.ai/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium text-sm transition-colors"
                                        >
                                            <ExternalLink size={16} />
                                            Buka xAI Console
                                        </a>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Daftar atau Login</h3>
                                        <p className="text-sm text-t-secondary">
                                            Buat akun baru atau login jika sudah punya akun. Anda bisa login dengan email atau akun X (Twitter).
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Buat API Key Baru</h3>
                                        <p className="text-sm text-t-secondary mb-3">
                                            Masuk ke menu "API Keys" dan buat key baru. Berikan nama yang mudah diingat seperti "KALA App".
                                        </p>
                                        <div className="p-4 bg-tertiary rounded-xl border border-soft">
                                            <p className="text-xs text-t-muted mb-2 font-medium">Contoh format API Key:</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-3 py-2 bg-primary rounded-lg text-sm font-mono text-t-primary">
                                                    xai-abc123def456ghi789jkl012mno345
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard('xai-abc123def456ghi789jkl012mno345')}
                                                    className="p-2 rounded-lg hover:bg-primary transition-colors text-t-muted"
                                                >
                                                    {copiedText === 'xai-abc123def456ghi789jkl012mno345' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">4</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Tambahkan Kredit (Jika Diperlukan)</h3>
                                        <p className="text-sm text-t-secondary">
                                            xAI memberikan kredit gratis untuk pengguna baru. Jika habis, Anda perlu menambahkan kredit untuk melanjutkan penggunaan.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 5 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">5</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Simpan API Key di KALA</h3>
                                        <p className="text-sm text-t-secondary mb-3">
                                            Copy API key, lalu buka <strong>Settings → AI Configuration</strong> di KALA dan paste di field "Grok API Key".
                                        </p>
                                        <a
                                            href="/settings"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary hover:bg-primary text-t-primary border border-soft rounded-xl font-medium text-sm transition-colors"
                                        >
                                            <Settings size={16} />
                                            Buka Settings
                                        </a>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-purple-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <h4 className="font-bold text-purple-600 dark:text-purple-400 text-sm">Keunggulan Grok</h4>
                                            <ul className="text-sm text-t-secondary mt-2 space-y-1">
                                                <li>• <strong>Realtime knowledge</strong> - Terintegrasi dengan X (Twitter)</li>
                                                <li>• <strong>Percakapan natural</strong> - Lebih santai dan humoris</li>
                                                <li>• <strong>Tidak ada filter berlebihan</strong> - Jawaban lebih langsung</li>
                                                <li>• Cocok untuk brainstorming dan diskusi</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* Google Drive Integration Guide */}
                    {expandedSection === 'drive' && (
                        <motion.section
                            key="drive"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-secondary border border-soft rounded-[2rem] p-8 shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                                    <HardDrive className="text-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-t-primary">Integrasi Google Drive</h2>
                                    <p className="text-sm text-t-secondary">Sinkronkan file tugas Anda ke Google Drive</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Overview */}
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <CloudIcon className="text-green-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <h4 className="font-bold text-green-600 dark:text-green-400 text-sm">Tentang Integrasi Google Drive</h4>
                                            <p className="text-sm text-t-secondary mt-2">
                                                Dengan menghubungkan Google Drive, KALA dapat secara otomatis menyimpan backup tugas dan file Anda ke cloud.
                                                Ini membutuhkan izin tambahan terpisah dari login biasa.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 1 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Buka Settings KALA</h3>
                                        <p className="text-sm text-t-secondary mb-3">
                                            Pergi ke halaman Settings di KALA dan scroll ke bagian "Integrations".
                                        </p>
                                        <a
                                            href="/settings"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-colors"
                                        >
                                            <Settings size={16} />
                                            Buka Settings
                                        </a>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Klik "Connect" pada Google Drive</h3>
                                        <p className="text-sm text-t-secondary">
                                            Di bagian Integrations, klik tombol <strong>Connect</strong> di samping Google Drive.
                                            Anda akan diarahkan ke halaman login Google.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-t-primary mb-2">Berikan Izin ke KALA</h3>
                                        <p className="text-sm text-t-secondary mb-3">
                                            Google akan menanyakan apakah Anda mengizinkan KALA untuk mengakses file di Google Drive.
                                            Klik "Allow" atau "Izinkan" untuk melanjutkan.
                                        </p>
                                        <div className="p-4 bg-tertiary rounded-xl border border-soft">
                                            <p className="text-xs text-t-muted mb-2 font-medium">Izin yang diminta:</p>
                                            <ul className="text-sm text-t-secondary space-y-1">
                                                <li className="flex items-center gap-2">
                                                    <Shield size={14} className="text-green-500" />
                                                    <span>View and manage files created by this app</span>
                                                </li>
                                            </ul>
                                            <p className="text-xs text-t-muted mt-3">
                                                ⓘ KALA hanya dapat mengakses file yang dibuat oleh KALA sendiri, bukan seluruh Google Drive Anda.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Technical Masterclass Section */}
                                <div className="mt-12 space-y-8">
                                    <div className="flex items-center gap-3 border-b border-soft pb-4">
                                        <Shield className="text-blue-500" size={24} />
                                        <h3 className="text-xl font-black text-t-primary uppercase tracking-tighter">Technical Masterclass: Google Cloud Setup</h3>
                                    </div>

                                    <div className="space-y-10">
                                        {/* Stage 1 */}
                                        <div className="relative pl-12">
                                            <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">1</div>
                                            <h4 className="font-bold text-t-primary text-lg mb-2">Project Creation</h4>
                                            <p className="text-sm text-t-secondary mb-4">Mulai dengan membuat identitas aplikasi Anda di ekosistem Google.</p>
                                            <ul className="space-y-3 text-xs text-t-muted">
                                                <li className="flex gap-2"><span>•</span> Buka <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-500 underline">Google Cloud Console</a>.</li>
                                                <li className="flex gap-2"><span>•</span> Klik "Select a project" → <strong>New Project</strong>.</li>
                                                <li className="flex gap-2"><span>•</span> Beri nama <code>KALA Academic OS</code> dan klik Create.</li>
                                            </ul>
                                        </div>

                                        {/* Stage 2 */}
                                        <div className="relative pl-12">
                                            <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">2</div>
                                            <h4 className="font-bold text-t-primary text-lg mb-2">Enabling the Drive API</h4>
                                            <p className="text-sm text-t-secondary mb-4">Secara default, project baru tidak memiliki akses ke layanan apapun.</p>
                                            <ul className="space-y-3 text-xs text-t-muted">
                                                <li className="flex gap-2"><span>•</span> Di sidebar kiri, pilih <strong>APIs & Services</strong> → <strong>Library</strong>.</li>
                                                <li className="flex gap-2"><span>•</span> Cari <code>Google Drive API</code> di kolom pencarian.</li>
                                                <li className="flex gap-2"><span>•</span> Klik pada hasilnya dan pilih tombol biru <strong>ENABLE</strong>. Tunggu hingga proses aktivasi selesai.</li>
                                            </ul>
                                        </div>

                                        {/* Stage 3 */}
                                        <div className="relative pl-12">
                                            <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">3</div>
                                            <h4 className="font-bold text-t-primary text-lg mb-2">Configure OAuth Consent Screen</h4>
                                            <p className="text-sm text-t-secondary mb-4">Ini adalah layar yang muncul saat Anda klik "Connect" di KALA.</p>
                                            <div className="bg-tertiary p-5 rounded-2xl border border-soft space-y-4">
                                                <div className="text-xs">
                                                    <span className="font-bold text-t-primary block mb-1">User Type Selection:</span>
                                                    <p className="text-t-muted">Pilih <strong>External</strong> jika Anda menggunakan Gmail biasa (@gmail.com). Pilih <strong>Internal</strong> hanya jika Anda berada di organisasi Workspace sekolah/kantor.</p>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-bold text-t-primary block mb-1">App Information:</span>
                                                    <p className="text-t-muted">Isi App name (KALA), User support email, dan Developer contact info (email Anda).</p>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-bold text-t-primary block mb-1">Scopes (Sangat Penting):</span>
                                                    <p className="text-t-muted">Klik "Add or Remove Scopes" dan masukkan scope manual: <code>https://www.googleapis.com/auth/drive.file</code>. Scope ini memberikan izin KALA untuk mengelola file yang DIBUAT oleh KALA saja (aman bagi privasi).</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stage 4 */}
                                        <div className="relative pl-12">
                                            <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">4</div>
                                            <h4 className="font-bold text-t-primary text-lg mb-2">Test Users (Anti-Blocked!)</h4>
                                            <p className="text-sm text-t-secondary mb-4">Langkah yang paling sering terlupakan yang menyebabkan error 403.</p>
                                            <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl">
                                                <p className="text-xs text-t-primary font-medium leading-relaxed">
                                                    Karena aplikasi Anda dalam status "Testing", Google tidak akan mengizinkan siapapun login kecuali alamat emailnya ada di daftar ini.
                                                    <br /><br />
                                                    <strong>Langkah:</strong> Scroll ke bawah di tab OAuth consent screen → Ketemu bagian <strong>Test users</strong> → Klik <strong>ADD USERS</strong> → Masukkan email Gmail Anda → Klik SAVE.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stage 5 */}
                                        <div className="relative pl-12">
                                            <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">5</div>
                                            <h4 className="font-bold text-t-primary text-lg mb-2">Create Credentials</h4>
                                            <p className="text-sm text-t-secondary mb-4">Mendapatkan Client ID dan Secret untuk dihubungkan ke platform.</p>
                                            <ul className="space-y-3 text-xs text-t-muted">
                                                <li className="flex gap-2"><span>•</span> Ke menu <strong>Credentials</strong> → <strong>+ Create Credentials</strong> → <strong>OAuth client ID</strong>.</li>
                                                <li className="flex gap-2"><span>•</span> Application type: <strong>Web application</strong>.</li>
                                                <li className="flex gap-2"><span>•</span> Authorized redirect URIs: <code className="bg-primary px-2 py-1 rounded">http://localhost:3001/api/auth/google/callback</code> (Ganti dengan domain production jika dideploy).</li>
                                                <li className="flex gap-2"><span>•</span> Klik Create. Simpan <strong>Client ID</strong> dan <strong>Client Secret</strong> Anda baik-baik di file <code>.env</code> backend Anda.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                    )}
                </AnimatePresence>

                {/* Storage Info Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-secondary border border-soft rounded-[2rem] p-8 shadow-sm"
                >
                    <h2 className="text-xl font-black mb-6 text-t-primary uppercase tracking-tight flex items-center gap-3">
                        <HardDrive className="text-blue-500" size={24} />
                        Tentang Penyimpanan File
                    </h2>

                    <div className="space-y-4">
                        <div className="p-4 bg-tertiary rounded-xl border border-soft">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-t-primary">Batas Penyimpanan Lokal</span>
                                <span className="text-2xl font-black text-blue-500">50 MB</span>
                            </div>
                            <p className="text-sm text-t-secondary">
                                Setiap akun KALA memiliki batas penyimpanan lokal 50 MB untuk file yang diupload.
                                Untuk penyimpanan lebih besar, gunakan integrasi Google Drive.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm mb-2">Format File Didukung</h4>
                                <p className="text-xs text-t-secondary">
                                    PDF, Word, Excel, PowerPoint, gambar (JPG, PNG, GIF), video, audio, dan file teks.
                                </p>
                            </div>
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <h4 className="font-bold text-green-600 dark:text-green-400 text-sm mb-2">Maksimal per File</h4>
                                <p className="text-xs text-t-secondary">
                                    Setiap file maksimal berukuran 50 MB. Untuk file lebih besar, gunakan Google Drive.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Need Help */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-soft rounded-[2rem]"
                >
                    <BookOpen className="mx-auto mb-4 text-blue-500" size={40} />
                    <h3 className="text-xl font-black text-t-primary mb-2">Butuh Bantuan Lebih?</h3>
                    <p className="text-t-secondary text-sm mb-4">
                        Jika mengalami kendala, hubungi tim support kami atau kirim email ke support@kala.app
                    </p>
                    <a
                        href="mailto:support@kala.app"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-full font-bold text-sm"
                    >
                        Hubungi Support
                    </a>
                </motion.section>
            </div>
        </div>
    );
};

export default DocumentationPage;
