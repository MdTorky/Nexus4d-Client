import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import type { Avatar } from '../types';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Icon } from '@iconify/react';
import { MAJORS, SEMESTERS } from '../constants/onboarding';

import { useTranslation } from 'react-i18next'; // Added import

export default function Profile() {
    const { t, i18n } = useTranslation(); // Added destructuring
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const [unlockedAvatars, setUnlockedAvatars] = useState<Avatar[]>([]);
    const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const res = await api.get('/user/avatars');
                setUnlockedAvatars(res.data);
            } catch (error) {
                console.error('Failed to fetch avatars', error);
            } finally {
                setIsLoadingAvatars(false);
            }
        };

        if (user) {
            fetchAvatars();
        }
    }, [user]);

    const handleAvatarSelect = async (avatar: Avatar) => {
        if (!avatar.is_unlocked) return;

        try {
            const res = await api.put('/user/avatar', { avatar_id: avatar._id });
            updateUser({ current_avatar_url: res.data.current_avatar_url });
            showToast('Avatar updated!', 'success');
            setIsAvatarModalOpen(false);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update avatar', 'error');
        }
    };

    if (!user) return null;

    // Calculate progress for next level
    const nextLevelXp = Math.pow(user.level + 1, 2) * 100;
    const currentLevelXp = Math.pow(user.level, 2) * 100;
    const progress = ((user.xp_points - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

    return (
        <div className="min-h-screen bg-nexus-black px-4 py-8 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 overflow-hidden rounded-2xl border border-nexus-card bg-nexus-card/50 p-8 backdrop-blur-sm"
                >
                    <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                        {/* Avatar & Level */}
                        <div className="relative text-center group">
                            <div className="rounded-full relative inline-block border-4 bg-black object-cover border-nexus-green">
                                <img
                                    src={user.current_avatar_url || user.avatar_url || '/Icons/M Glitch Nexon.png'}
                                    alt="Profile"
                                    className="h-32 w-32 p-4"
                                />
                                {/* Edit Overlay */}
                                <div
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    <span className="text-xs font-bold text-white">{t('profile.changeAvatar')}</span>
                                </div>

                                <div className="absolute bottom-0 left-0 mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-nexus-green font-bold text-nexus-black shadow-lg">
                                    {user.level || 0}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-400">{t('profile.totalXP')}</p>
                                <p className="text-xl font-bold text-nexus-white">{user.xp_points}</p>
                            </div>
                        </div>

                        {/* Info & Stats */}
                        <div className={`${i18n.language === 'ar' ? 'flex-1 space-y-6 text-center md:text-right' : 'flex-1 space-y-6 text-center md:text-left'}`}>
                            <div>
                                <h1 className="text-3xl font-bold text-nexus-white">{user.first_name} {user.last_name}</h1>
                                <p className="text-nexus-green">@{user.username} • {user.role}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-lg bg-black/40 p-4">
                                    <p className="text-xs text-gray-400">{t('profile.major')}</p>
                                    <p className="font-semibold text-nexus-white">
                                        {user.major
                                            ? t(`onboarding.${MAJORS.find(m => m.value === user.major)?.labelKey || 'majors.other'}`)
                                            : t('profile.notSet')}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-black/40 p-4">
                                    <p className="text-xs text-gray-400">{t('profile.semester')}</p>
                                    <p className="font-semibold text-nexus-white">
                                        {user.semester
                                            ? t(`onboarding.${SEMESTERS.find(s => s.value === user.semester)?.labelKey || 'unknown'}`) // fallback if not found
                                            : t('profile.notSet')}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-black/40 p-4">
                                    <p className="text-xs text-gray-400">{t('profile.nextLevel')}</p>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-700">
                                        <div
                                            className="h-full bg-nexus-green transition-all duration-500"
                                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {user.bio && (
                                <p className="max-w-2xl text-gray-300 italic">"{user.bio}"</p>
                            )}
                        </div>

                        <div>
                            <Button variant="outline" onClick={() => window.location.href = '/onboarding'}>{t('profile.editProfile')}</Button>
                        </div>
                    </div>
                </motion.div>

                {/* Avatar Selection Modal */}
                {isAvatarModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl border border-nexus-card bg-nexus-black"
                        >
                            <div className="flex items-center justify-between border-b border-nexus-card p-6">
                                <h2 className="text-xl font-bold text-nexus-white">{t('profile.selectNexon')}</h2>
                                <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-white">{t('profile.close')}</button>
                            </div>

                            <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-6 space-y-8">
                                {isLoadingAvatars ? (
                                    <div className="flex justify-center py-12">
                                        <Loader />
                                    </div>
                                ) : (
                                    <>
                                        {/* Male Nexons */}
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold text-nexus-green">{t('profile.maleNexons')}</h3>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                                {unlockedAvatars.filter(a => a.name.includes('(M)')).map((avatar) => (
                                                    <div
                                                        key={avatar._id}
                                                        onClick={() => handleAvatarSelect(avatar)}
                                                        className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${user.current_avatar_url === avatar.image_url
                                                            ? 'border-nexus-green bg-nexus-green/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                            : avatar.is_unlocked
                                                                ? 'border-transparent bg-nexus-card/30 hover:border-nexus-gray hover:bg-nexus-card/50'
                                                                : 'border-transparent bg-black/30 opacity-40 cursor-not-allowed grayscale'
                                                            }`}
                                                    >
                                                        <img
                                                            src={avatar.image_url}
                                                            alt={avatar.name}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="mb-3 h-24 w-full object-contain"
                                                        />
                                                        <p className="truncate text-center text-[10px] font-medium uppercase tracking-wider whitespace-pre-wrap text-gray-400">
                                                            {avatar.name.replace(' (M)', '')}
                                                        </p>

                                                        {!avatar.is_unlocked && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="rounded-full bg-black/60 p-2 backdrop-blur-sm">
                                                                    <Icon icon="mdi:lock" className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Female Nexons */}
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold text-nexus-green">{t('profile.femaleNexons')}</h3>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                                {unlockedAvatars.filter(a => a.name.includes('(F)')).map((avatar) => (
                                                    <div
                                                        key={avatar._id}
                                                        onClick={() => handleAvatarSelect(avatar)}
                                                        className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${user.current_avatar_url === avatar.image_url
                                                            ? 'border-nexus-green bg-nexus-green/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                            : avatar.is_unlocked
                                                                ? 'border-transparent bg-nexus-card/30 hover:border-nexus-gray hover:bg-nexus-card/50'
                                                                : 'border-transparent bg-black/30 opacity-40 cursor-not-allowed grayscale'
                                                            }`}
                                                    >
                                                        <img
                                                            src={avatar.image_url}
                                                            alt={avatar.name}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="mb-3 h-24 w-full object-contain"
                                                        />
                                                        <p className="truncate text-center text-[10px] font-medium uppercase tracking-wider whitespace-pre-wrap text-gray-400">
                                                            {avatar.name.replace(' (F)', '')}
                                                        </p>

                                                        {!avatar.is_unlocked && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="rounded-full bg-black/60 p-2 backdrop-blur-sm">
                                                                    <Icon icon="mdi:lock" className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
