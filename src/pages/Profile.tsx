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

    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleAvatarClick = async (avatar: Avatar) => {
        if (!user) return;
        if (avatar.is_unlocked) {
            // Equip
            try {
                const res = await api.put('/user/avatar', { avatar_id: avatar._id });
                updateUser({ current_avatar_url: res.data.current_avatar_url });
                showToast(t('profile.avatarUpdated'), 'success');
                setIsAvatarModalOpen(false);
            } catch (error: any) {
                showToast(error.response?.data?.message || 'Failed to update avatar', 'error');
            }
        } else {
            // Check if can unlock
            // Condition: User has token AND meets level requirement
            // If so, show confirm dialog (implied simplistic approach for now)
            if (avatar.type === 'reward' && avatar.unlock_condition === 'token') {
                if ((user.avatar_unlock_tokens || 0) > 0) {
                    // Try to unlock
                    handleUnlockAvatar(avatar);
                } else {
                    // Just show toast why
                    showToast(t('profile.noTokens'), 'error');
                }
            } else {
                showToast(t('profile.lockedCondition', { condition: avatar.unlock_condition }), 'error');
            }
        }
    };

    const handleUnlockAvatar = async (avatar: Avatar) => {
        if (isUnlocking) return;
        setIsUnlocking(true);
        try {
            const res = await api.post('/user/avatar/unlock', { avatar_id: avatar._id });
            // Update local state
            setUnlockedAvatars(prev => prev.map(a => a._id === avatar._id ? { ...a, is_unlocked: true } : a));
            updateUser({ avatar_unlock_tokens: res.data.avatar_unlock_tokens });

            showToast(t('profile.avatarUnlocked'), 'success');
            // Optimistically set it as current? No, let user choose.
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to unlock', 'error');
        } finally {
            setIsUnlocking(false);
        }
    };

    // const handleSimulateLevelUp = async () => {
    //     try {
    //         const res = await api.post('/user/test/level-up');
    //         updateUser({
    //             level: res.data.level,
    //             xp_points: res.data.xp_points,
    //             avatar_unlock_tokens: res.data.avatar_unlock_tokens
    //         });
    //         showToast(res.data.message, 'success');
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    if (!user) return null;

    // Calculate progress for next level
    const nextLevelXp = Math.pow(user.level + 1, 2) * 100;
    const currentLevelXp = Math.pow(user.level, 2) * 100;
    const progress = ((user.xp_points - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

    const filteredAvatars = unlockedAvatars.filter(avatar => {
        if (filter === 'unlocked') return avatar.is_unlocked;
        if (filter === 'locked') return !avatar.is_unlocked;
        return true;
    });

    const maleAvatars = filteredAvatars.filter(a => a.name.includes('(M)'));
    const femaleAvatars = filteredAvatars.filter(a => a.name.includes('(F)'));

    const renderAvatarGrid = (avatars: Avatar[]) => (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {avatars.map((avatar) => {
                const canUnlock = !avatar.is_unlocked &&
                    avatar.type === 'reward' &&
                    (user.avatar_unlock_tokens || 0) > 0;

                return (
                    <div
                        key={avatar._id}
                        onClick={() => handleAvatarClick(avatar)}
                        className={`relative group cursor-pointer rounded-xl border p-4 transition-all duration-300 ${user.current_avatar_url === avatar.image_url
                            ? 'border-nexus-green bg-nexus-green/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                            : avatar.is_unlocked
                                ? 'border-nexus-card/50 bg-nexus-card/30 hover:border-nexus-green/50 hover:bg-nexus-card/60 hover:-translate-y-1'
                                : canUnlock
                                    ? 'border-yellow-500/50 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500 animate-pulse-slow'
                                    : 'border-transparent bg-black/40 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                            }`}
                    >
                        <img
                            src={avatar.image_url}
                            alt={avatar.name}
                            loading="lazy"
                            decoding="async"
                            className="mb-3 h-28 w-full object-contain drop-shadow-lg"
                        />

                        {/* Name */}
                        <p className={`truncate text-center text-[10px] font-bold uppercase tracking-widest whitespace-normal ${canUnlock ? 'text-yellow-500' : 'text-gray-400'}`}>
                            {avatar.name.replace(/\(.\)/, '')}
                        </p>

                        {/* Status Overlay */}
                        {!avatar.is_unlocked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/40 backdrop-blur-[2px] transition-opacity group-hover:opacity-0 group-hover:backdrop-blur-none">
                                {canUnlock ? (
                                    <div className="flex flex-col items-center gap-2 animate-bounce-small">
                                        <Icon icon="mdi:lock-open-variant" className="h-6 w-6 text-yellow-500" />
                                        <span className="text-[10px] font-bold text-yellow-500 bg-black/80 px-2 py-0.5 rounded">{t('profile.clickToUnlock')}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <Icon icon="mdi:lock" className="h-5 w-5 text-gray-500" />
                                        {/* Removed Level Display */}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selection Indicator */}
                        {user.current_avatar_url === avatar.image_url && (
                            <div className="absolute top-2 right-2 rounded-full bg-nexus-green p-1">
                                <Icon icon="mdi:check" className="h-3 w-3 text-black" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

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

                            {/* Dev Tool: Level Up Button */}
                            {/* <button
                                onClick={handleSimulateLevelUp}
                                className="mt-2 text-[10px] text-gray-600 hover:text-nexus-green underline"
                            >
                                {t('profile.devLevelUp')}
                            </button> */}
                        </div>

                        {/* Info & Stats */}
                        <div className={`${i18n.language === 'ar' ? 'flex-1 space-y-6 text-center md:text-right' : 'flex-1 space-y-6 text-center md:text-left'}`}>
                            <div>
                                <h1 className="text-3xl font-bold text-nexus-white">{user.first_name} {user.last_name}</h1>
                                <p className="text-nexus-green">@{user.username} • {user.role}</p>
                                {user.avatar_unlock_tokens && user.avatar_unlock_tokens > 0 ? (
                                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-500 border border-yellow-500/30">
                                        <Icon icon="mdi:star-four-points" />
                                        <span>{t('profile.unlockTokensAvailable', { count: user.avatar_unlock_tokens })}</span>
                                    </div>
                                ) : null}
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
                            className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-nexus-card bg-nexus-black shadow-2xl flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex flex-col border-b border-nexus-card bg-black/20 p-6 pb-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-nexus-white">{t('profile.selectNexon')}</h2>
                                        {/* {user.avatar_unlock_tokens && user.avatar_unlock_tokens > 0 && (
                                        {user.avatar_unlock_tokens && user.avatar_unlock_tokens > 0 && (
                                            <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                                                {user.avatar_unlock_tokens} {t('profile.tokensLeft')}
                                            </span>
                                        )}
                                        )} */}
                                    </div>
                                    <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <Icon icon="mdi:close" className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex gap-6 text-sm font-medium">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`pb-3 transition-colors ${filter === 'all' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {t('profile.filter.all')}
                                    </button>
                                    <button
                                        onClick={() => setFilter('unlocked')}
                                        className={`pb-3 transition-colors ${filter === 'unlocked' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {t('profile.filter.unlocked')}
                                    </button>
                                    <button
                                        onClick={() => setFilter('locked')}
                                        className={`pb-3 transition-colors ${filter === 'locked' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {t('profile.filter.locked')}
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="custom-scrollbar flex-1 overflow-y-auto p-6 bg-linear-to-b from-transparent to-black/30">
                                {isLoadingAvatars ? (
                                    <div className="flex h-40 items-center justify-center">
                                        <Loader text="Loading Nexons..." />
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Male Nexons */}
                                        {maleAvatars.length > 0 && (
                                            <div>
                                                <h3 className="mb-4 text-lg font-semibold text-nexus-green">{t('profile.maleNexons')}</h3>
                                                {renderAvatarGrid(maleAvatars)}
                                            </div>
                                        )}

                                        {/* Female Nexons */}
                                        {femaleAvatars.length > 0 && (
                                            <div>
                                                <h3 className="mb-4 text-lg font-semibold text-nexus-green">{t('profile.femaleNexons')}</h3>
                                                {renderAvatarGrid(femaleAvatars)}
                                            </div>
                                        )}

                                        {filteredAvatars.length === 0 && (
                                            <div className="py-12 text-center text-gray-500">
                                                {t('profile.noAvatars')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
