import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: 'email' | 'google' | 'github';
    providerId?: string;
    createdAt: string;
    updatedAt: string;
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('kala_token');
            const response = await fetch(`/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            if (data.success) {
                setProfile(data.data);
                setName(data.data.name);
                setAvatarUrl(data.data.avatar || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Gagal memuat profil' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('kala_token');
            const response = await fetch(`/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    avatar: avatarUrl || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setProfile(data.data);
                setEditing(false);
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal memperbarui profil' });
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' });
        } finally {
            setSaving(false);
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'google':
                return '🔵';
            case 'github':
                return '⚫';
            default:
                return '📧';
        }
    };

    const getProviderLabel = (provider: string) => {
        switch (provider) {
            case 'google':
                return 'Google';
            case 'github':
                return 'GitHub';
            default:
                return 'Email';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-sm font-bold uppercase tracking-widest">Waking Profile...</span>
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
                        Profile
                    </h1>
                    <p className="text-t-tertiary font-medium text-lg">Manage your academic identity and data.</p>
                </motion.div>

                {/* Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                            : 'bg-red-500/20 border border-red-500/50 text-red-400'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-secondary border border-soft rounded-[2rem] p-10 shadow-sm"
                >
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-tertiary border border-soft p-1">
                                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center overflow-hidden">
                                    {profile?.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl md:text-5xl text-t-primary font-bold">
                                            {profile?.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-grow">
                            {!editing ? (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-t-primary">{profile?.name}</h2>
                                    <p className="text-t-secondary mb-3">{profile?.email}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold flex items-center gap-2">
                                            <span>{getProviderIcon(profile?.provider || 'email')}</span>
                                            <span>{getProviderLabel(profile?.provider || 'email')}</span>
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-t-tertiary mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-primary border border-medium rounded-xl text-sm font-bold text-t-primary placeholder:text-t-muted focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:outline-none transition-all"
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-t-tertiary mb-2">
                                            Avatar URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-primary border border-medium rounded-xl text-sm font-bold text-t-primary placeholder:text-t-muted focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditing(false);
                                                setName(profile?.name || '');
                                                setAvatarUrl(profile?.avatar || '');
                                            }}
                                            className="px-6 py-3 bg-tertiary hover:bg-primary text-t-primary border border-soft rounded-xl font-bold text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Account Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-secondary border border-soft rounded-[2rem] p-10 shadow-sm"
                >
                    <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-t-primary">Account Information</h3>

                    <div className="space-y-1">
                        <div className="flex justify-between py-4 border-b border-soft">
                            <span className="text-t-tertiary font-medium">Email</span>
                            <span className="font-bold text-t-primary">{profile?.email}</span>
                        </div>

                        <div className="flex justify-between py-4 border-b border-soft">
                            <span className="text-t-tertiary font-medium">Authentication Method</span>
                            <span className="font-bold text-t-primary flex items-center gap-2">
                                <span>{getProviderIcon(profile?.provider || 'email')}</span>
                                {getProviderLabel(profile?.provider || 'email')}
                            </span>
                        </div>

                        <div className="flex justify-between py-4 border-b border-soft">
                            <span className="text-t-tertiary font-medium">Member Since</span>
                            <span className="font-bold text-t-primary">
                                {profile?.createdAt
                                    ? new Date(profile.createdAt).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '-'}
                            </span>
                        </div>

                        <div className="flex justify-between py-4">
                            <span className="text-t-tertiary font-medium">Last Updated</span>
                            <span className="font-bold text-t-primary">
                                {profile?.updatedAt
                                    ? new Date(profile.updatedAt).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '-'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Password Section - Only for email users */}
                {profile?.provider === 'email' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-secondary border border-soft rounded-[2rem] p-10 shadow-sm"
                    >
                        <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-t-primary">Security</h3>
                        <p className="text-t-secondary mb-6 font-medium">
                            Manage your password and security settings
                        </p>
                        <button className="px-6 py-3 bg-tertiary hover:bg-primary text-t-primary border border-soft rounded-xl font-bold text-sm transition-colors">
                            Change Password
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
