import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import type { Avatar, User } from '../types';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Icon } from '@iconify/react';
import { MAJORS, SEMESTERS } from '../constants/onboarding';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export default function Profile() {
    const { t, i18n } = useTranslation();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const [unlockedAvatars, setUnlockedAvatars] = useState<Avatar[]>([]);
    const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarSearch, setAvatarSearch] = useState('');

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

    // Profile Tabs
    const [activeTab, setActiveTab] = useState<'following' | 'friends' | 'requests' | 'followers' | 'settings'>('following');

    // Friends & Requests
    const [friends, setFriends] = useState<User[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]); // Using any for request object structure wrapper
    const [followers, setFollowers] = useState<User[]>([]); // For Tutors
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);

    // Privacy Settings State
    const [privacySettings, setPrivacySettings] = useState({
        show_nexons: true,
        show_courses: true
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    useEffect(() => {
        if (activeTab === 'friends') fetchFriends();
        if (activeTab === 'requests') fetchRequests();
        if (activeTab === 'followers' && user?.role === 'tutor') fetchMyFollowers();
        if (activeTab === 'settings' && user) {
            // Load current settings
            setPrivacySettings({
                show_nexons: user.privacy_settings?.show_nexons ?? true,
                show_courses: user.privacy_settings?.show_courses ?? true
            });
        }
    }, [activeTab, user]);

    // Initial fetch for counters
    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const fetchFriends = async () => {
        setIsLoadingFriends(true);
        try {
            const res = await api.get('/social/friends');
            setFriends(res.data);
        } catch (error) {
            console.error('Failed to fetch friends', error);
        } finally {
            setIsLoadingFriends(false);
        }
    };

    // Fetch users who follow ME (Tutor only)
    const fetchMyFollowers = async () => {
        setIsLoadingFollowers(true);
        try {
            const res = await api.get('/social/followers/me');
            setFollowers(res.data);
        } catch (error) {
            console.error('Failed to fetch followers', error);
        } finally {
            setIsLoadingFollowers(false);
        }
    };

    const fetchRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const res = await api.get('/social/friends/requests');
            setPendingRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            if (action === 'accept') {
                await api.post(`/social/friends/accept/${requestId}`);
                showToast('Friend request accepted!', 'success');
                // Refresh both lists
                fetchRequests();
            } else {
                await api.delete(`/social/friends/request/${requestId}`);
                showToast('Friend request rejected', 'info');
                fetchRequests();
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Action failed', 'error');
        }
    };

    const handlePrivacySave = async () => {
        setIsSavingSettings(true);
        try {
            // We use updateUserProfile endpoint
            const res = await api.put('/user/profile', {
                privacy_settings: privacySettings
            });
            updateUser(res.data);
            showToast('Privacy settings updated!', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to save settings', 'error');
        } finally {
            setIsSavingSettings(false);
        }
    };

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
            if (avatar.type === 'reward' && avatar.unlock_condition === 'token') {
                if ((user.avatar_unlock_tokens || 0) > 0) {
                    handleUnlockAvatar(avatar);
                } else {
                    showToast(t('profile.noTokens'), 'error');
                }

            } else if (avatar.unlock_condition === 'course_completion') {
                if (avatar.required_course_title) {
                    showToast(`Complete course: "${avatar.required_course_title}" to unlock!`, 'info');
                } else {
                    showToast('Complete the associated course to unlock this Nexon.', 'info');
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
            setUnlockedAvatars(prev => prev.map(a => a._id === avatar._id ? { ...a, is_unlocked: true } : a));
            updateUser({ avatar_unlock_tokens: res.data.avatar_unlock_tokens });
            showToast(t('profile.avatarUnlocked'), 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to unlock', 'error');
        } finally {
            setIsUnlocking(false);
        }
    };

    if (!user) return null;

    const [activeCategory, setActiveCategory] = useState<'all' | 'male' | 'female' | 'general' | 'admin'>('all');

    const filteredAvatars = unlockedAvatars.filter(avatar => {
        const matchesSearch = !avatarSearch || avatar.name.toLowerCase().includes(avatarSearch.toLowerCase());
        const matchesCondition = filter === 'all' || (filter === 'unlocked' ? avatar.is_unlocked : !avatar.is_unlocked);
        const matchesCategory = activeCategory === 'all' || (avatar.category || 'general') === activeCategory;

        return matchesSearch && matchesCondition && matchesCategory;
    });




    const [following, setFollowing] = useState<User[]>([]);
    const [isLoadingFollowing, setIsLoadingFollowing] = useState(true);

    useEffect(() => {
        fetchFollowing();
    }, []);

    const fetchFollowing = async () => {
        try {
            const res = await api.get('/social/following');
            setFollowing(res.data);
        } catch (error) {
            console.error('Failed to fetch following', error);
        } finally {
            setIsLoadingFollowing(false);
        }
    };

    const handleUnfollow = async (tutorId: string) => {
        try {
            await api.delete(`/social/follow/${tutorId}`);
            setFollowing(prev => prev.filter(t => t._id !== tutorId));
            showToast('Unfollowed tutor', 'info');
        } catch (error) {
            showToast('Failed to unfollow', 'error');
        }
    };



    // Level Progress Calculation
    // Formula: Linear 500 XP per level
    const XP_PER_LEVEL = 500;
    // const currentLevel = user.level || 1;

    // XP gained IN THIS level
    // e.g. 1250 XP -> Level 3 (1000 XP base). Current Level XP = 250.
    const currentLevelXP = user.xp_points % XP_PER_LEVEL;

    // XP needed to complete THIS level is always 500
    const xpForNextLevel = XP_PER_LEVEL;

    // Percentage
    let progressPercent = (currentLevelXP / xpForNextLevel) * 100;
    progressPercent = Math.max(0, Math.min(100, progressPercent));

    return (
        <div className="min-h-screen bg-nexus-black px-4 py-8 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header Profile Card */}
                {/* Header Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a] p-0 shadow-2xl"
                >
                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-nexus-green/10 via-green-900/10 to-transparent opacity-50" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-nexus-green/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start gap-8">

                        {/* Avatar Section */}
                        <div className="relative group shrink-0 mx-auto md:mx-0">
                            <div className="relative w-40 h-40">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-nexus-green/20 rounded-full blur-xl group-hover:bg-nexus-green/30 transition-all duration-500" />

                                {/* Avatar Ring */}
                                <div className="relative w-full h-full rounded-full p-[3px] bg-gradient-to-b from-nexus-green to-transparent">
                                    <div className="w-full h-full rounded-full bg-nexus-black  relative">
                                        <img
                                            src={user.current_avatar_url || user.avatar_url || '/Icons/M Glitch Nexon.png'}
                                            alt="Profile"
                                            className="w-full h-full transition-transform duration-500 group-hover:scale-110 p-5"
                                        />
                                        {/* Edit Overlay */}
                                        <div
                                            onClick={() => setIsAvatarModalOpen(true)}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px] rounded-full"
                                        >
                                            <Icon icon="mdi:camera" className="text-white text-2xl mb-1" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t('profile.changeAvatar')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Level Badge */}
                                <div className="absolute -bottom-2 -right-2 bg-black rounded-xl p-1 shadow-lg border border-nexus-green/30">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-nexus-green to-green-600 rounded-lg">
                                        <span className="text-[10px] font-bold text-black uppercase tracking-wider">Level</span>
                                        <span className="text-lg font-black text-black leading-none">{user.level || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* XP Below Avatar */}
                            <div className="mt-4 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-0.5">{t('profile.totalXP')}</p>
                                <p className="text-xl font-bold text-white tabular-nums">{user.xp_points.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Info & Stats */}
                        <div className="flex-1 w-full relative">
                            {/* Top Row: Name & Edit */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 text-center md:text-left">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                                        {user.first_name} <span className="text-gray-500">{user.last_name}</span>
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                            <span className="text-nexus-green text-lg">@</span>
                                            <span className="text-sm font-bold text-gray-300">{user.username}</span>
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-gray-600" />
                                        <span className="text-sm font-medium text-nexus-green uppercase tracking-wider text-[11px] border border-nexus-green/20 px-2 py-0.5 rounded bg-nexus-green/5">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/onboarding'}
                                    className="border-white/10 hover:border-nexus-green/50 hover:bg-nexus-green/10 text-gray-300 hover:text-white transition-all shrink-0 self-center md:self-start"
                                >
                                    <Icon icon="mdi:pencil-outline" className="mr-2" />
                                    {t('profile.editProfile')}
                                </Button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.04] transition-colors relative group overflow-hidden">
                                    <div className={`${i18n.language === "en" ? "right-0" : "left-0"} absolute top-0  p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                        <Icon icon="mdi:school-outline" className="text-4xl text-white" />
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{t('profile.major')}</p>
                                    <p className="text-lg font-bold text-white truncate">
                                        {user.major
                                            ? t(`onboarding.${MAJORS.find(m => m.value === user.major)?.labelKey || 'majors.other'}`)
                                            : <span className="text-gray-600 italic">{t('profile.notSet')}</span>}
                                    </p>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.04] transition-colors relative group overflow-hidden">
                                    <div className={`${i18n.language === "en" ? "right-0" : "left-0"} absolute top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                        <Icon icon="mdi:calendar-clock" className="text-4xl text-white" />
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{t('profile.semester')}</p>
                                    <p className="text-lg font-bold text-white">
                                        {user.semester
                                            ? t(`onboarding.${SEMESTERS.find(s => s.value === user.semester)?.labelKey || 'unknown'}`)
                                            : <span className="text-gray-600 italic">{t('profile.notSet')}</span>}
                                    </p>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 relative group overflow-hidden sm:col-span-2 lg:col-span-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{t('profile.nextLevel')}</p>
                                            <p className="text-xs text-nexus-green font-mono mt-0.5">{Math.round(progressPercent)}% Complete</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-500 font-mono">
                                                {currentLevelXP}/{xpForNextLevel} XP
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-nexus-green to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                        />
                                    </div>

                                    {/* Dev Tools / Level Indicators */}
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Lvl {user.level}</span>

                                        {/* Test Button - Hidden but accessible style */}
                                        {/* <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    const { data } = await api.post('/user/test/add-xp', { xp: 50 });
                                                    updateUser({ ...data });
                                                    if (data.leveledUp) {
                                                        showToast(`Level Up! Earned ${data.tokensEarned} Token(s)`, 'success');
                                                    } else {
                                                        showToast(`Added 50 XP`, 'success');
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                            className="px-2 py-0.5 rounded text-[9px] bg-white/5 text-gray-500 hover:text-nexus-green hover:bg-nexus-green/10 transition-colors border border-transparent hover:border-nexus-green/30"
                                            title="Dev: Add 50 XP"
                                        >
                                            +XP
                                        </button> */}

                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Lvl {user.level + 1}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            {user.bio && (
                                <div className="relative pl-4 border-l-2 border-nexus-green/30">
                                    <p className="text-gray-400 italic text-sm md:text-base leading-relaxed">
                                        "{user.bio}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Content Tabs */}
                <div className="mb-8 border-b border-white/10">
                    <div className="flex gap-8">
                        {user?.role === 'tutor' && (
                            <button
                                onClick={() => setActiveTab('followers')}
                                className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'followers' ? 'text-nexus-green' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Followers
                                {activeTab === 'followers' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-nexus-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                    />
                                )}
                            </button>
                        )}
                        {['following', 'friends', 'requests', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === tab ? 'text-nexus-green' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'requests' && pendingRequests.length > 0 && (
                                    <span className="ml-2 bg-nexus-green text-black text-[10px] px-1.5 py-0.5 rounded-full">
                                        {pendingRequests.length}
                                    </span>
                                )}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-nexus-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                    />
                                )}
                            </button>
                        ))}

                        {/* Tutors only: Followers Tab */}

                    </div>
                </div>

                {/* Tab Panels */}
                <AnimatePresence mode="wait">
                    {activeTab === 'followers' && user?.role === 'tutor' && (
                        <motion.div
                            key="followers"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Icon icon="mdi:account-group" className="text-blue-500" />
                                My Followers
                            </h2>

                            {isLoadingFollowers ? (
                                <div className="text-center py-12 text-gray-500">Loading followers...</div>
                            ) : followers.length === 0 ? (
                                <div className="text-center py-12 bg-nexus-card/30 rounded-2xl border border-white/5">
                                    <Icon icon="mdi:account-off-outline" className="text-4xl text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">You don't have any followers yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {followers.map((follower) => (
                                        <div key={follower._id} className="bg-nexus-card/50 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/30 transition-all group cursor-pointer" onClick={() => window.location.href = `/users/${follower._id}`}>
                                            <div className="relative w-12 h-12">
                                                <div className="w-full h-full rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-purple-500">
                                                    <img
                                                        src={follower.current_avatar_url || `https://ui-avatars.com/api/?name=${follower.username}`}
                                                        alt={follower.username}
                                                        className="w-full h-full rounded-full object-cover border-2 border-black p-1"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                    {follower.first_name ? `${follower.first_name} ${follower.last_name || ''}` : follower.username}
                                                </h3>
                                                <p className="text-xs text-gray-400">Level {follower.level || 0}
                                                    <span className="capitalize text-blue-400"> {follower.role}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'following' && (
                        <motion.div
                            key="following"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Icon icon="mdi:account-group-outline" className="text-nexus-green" />
                                Tutors & Mentors
                            </h2>

                            {isLoadingFollowing ? (
                                <div className="h-40 flex items-center justify-center">
                                    <Loader text="Loading..." />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {following.map(tutor => (
                                        <div key={tutor._id} className="bg-nexus-card/50 border border-white/10 rounded-xl p-5 flex items-center gap-4 group hover:bg-white/5 transition-all">
                                            <Link to={`/tutors/${tutor._id}`} className="block relative shrink-0">
                                                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-nexus-green to-blue-500 group-hover:scale-105 transition-transform">
                                                    <img
                                                        src={tutor.current_avatar_url || `https://ui-avatars.com/api/?name=${tutor.username}`}
                                                        alt={tutor.username}
                                                        className="w-full h-full rounded-full object-cover border-2 border-black p-2"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-[9px] font-bold text-nexus-green border border-nexus-green/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    Lvl {tutor?.level}
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <Link to={`/tutors/${tutor._id}`} className="hover:text-nexus-green transition-colors">
                                                    <h3 className="text-white font-bold truncate break-words">
                                                        {tutor.first_name ? `${tutor.first_name} ${tutor.last_name}` : tutor.username}
                                                    </h3>
                                                </Link>
                                                <p className="text-gray-400 text-xs font-bold truncate">@{tutor.username}</p>
                                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider truncate mt-0.5">
                                                    {tutor.expertise || "Tutor"}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleUnfollow(tutor._id)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                                                title="Unfollow"
                                            >
                                                <Icon icon="mdi:account-minus" width="20" />
                                            </button>
                                        </div>
                                    ))}
                                    {following.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                                            You are not following anyone yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'friends' && (
                        <motion.div
                            key="friends"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Icon icon="mdi:account-heart-outline" className="text-pink-500" />
                                Your Friends
                            </h2>

                            {isLoadingFriends ? (
                                <div className="h-40 flex items-center justify-center">
                                    <Loader text="Loading friends..." />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {friends.map(friend => (
                                        <div key={friend._id} className="bg-nexus-card/50 border border-white/10 rounded-xl p-5 flex items-center gap-4 group hover:bg-white/5 transition-all">
                                            <Link to={`/users/${friend._id}`} className="block relative shrink-0">
                                                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:scale-105 transition-transform">
                                                    <img
                                                        src={friend.current_avatar_url || `https://ui-avatars.com/api/?name=${friend.username}`}
                                                        alt={friend.username}
                                                        className="w-full h-full rounded-full object-cover border-2 border-black p-2"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-[9px] font-bold text-nexus-green border border-nexus-green/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    Lvl {friend.level || 0}
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <Link to={`/users/${friend._id}`} className="hover:text-nexus-green transition-colors">
                                                    <h3 className="text-white font-bold truncate break-words">
                                                        {friend.first_name ? `${friend.first_name} ${friend.last_name}` : friend.username}
                                                    </h3>
                                                </Link>
                                                <p className="text-gray-400 text-xs font-bold truncate">@{friend.username}</p>
                                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider truncate mt-0.5">
                                                    {friend.role}
                                                </p>
                                            </div>
                                            {/* Could add remove friend here but maybe safer in profile details or explicit action */}
                                        </div>
                                    ))}
                                    {friends.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                                            No friends yet. Add friends from their profiles!
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Icon icon="mdi:account-clock-outline" className="text-yellow-500" />
                                Friend Requests
                            </h2>

                            {isLoadingRequests ? (
                                <div className="text-center py-12 text-gray-500">Loading requests...</div>
                            ) : pendingRequests.length === 0 ? (
                                <div className="text-center py-12 bg-nexus-card/30 rounded-2xl border border-white/5">
                                    <Icon icon="mdi:email-outline" className="text-4xl text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No pending friend requests.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingRequests.map((req) => (
                                        <div key={req._id} className="bg-nexus-card/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-black p-0.5">
                                                    <img
                                                        src={req.requester_id.current_avatar_url || `https://ui-avatars.com/api/?name=${req.requester_id.username}`}
                                                        alt={req.requester_id.username}
                                                        className="w-full h-full rounded-full object-cover p-2"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{req.requester_id.first_name || req.requester_id.username}</h3>
                                                    <p className="text-xs text-gray-400">@{req.requester_id.username}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRequestAction(req._id, 'accept')}
                                                    className="p-2 bg-nexus-green/10 text-nexus-green rounded-lg hover:bg-nexus-green/20 transition-colors"
                                                    title="Accept"
                                                >
                                                    <Icon icon="mdi:check" />
                                                </button>
                                                <button
                                                    onClick={() => handleRequestAction(req._id, 'reject')}
                                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    title="Reject"
                                                >
                                                    <Icon icon="mdi:close" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Icon icon="mdi:shield-account" className="text-gray-400" />
                                Privacy Settings
                            </h3>
                            <div className="bg-nexus-card/30 border border-white/10 rounded-2xl p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Publicly Show Nexons</h4>
                                        <p className="text-gray-400 text-sm">Allow others to see your unlocked avatar collection.</p>
                                    </div>
                                    <button
                                        onClick={() => setPrivacySettings(p => ({ ...p, show_nexons: !p.show_nexons }))}
                                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${privacySettings.show_nexons ? 'bg-nexus-green' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${privacySettings.show_nexons ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                <div className="h-px bg-white/5" />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Publicly Show Courses</h4>
                                        <p className="text-gray-400 text-sm">Allow others to see which courses you are enrolled in and have completed.</p>
                                    </div>
                                    <button
                                        onClick={() => setPrivacySettings(p => ({ ...p, show_courses: !p.show_courses }))}
                                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${privacySettings.show_courses ? 'bg-nexus-green' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${privacySettings.show_courses ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={handlePrivacySave}
                                        disabled={isSavingSettings}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSavingSettings ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:content-save" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}


                </AnimatePresence>

                <AnimatePresence>
                    {isAvatarModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl border border-nexus-card bg-nexus-black shadow-2xl flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="flex flex-col border-b border-nexus-card bg-black/20 p-6 pb-0 z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-nexus-white flex items-center gap-3">
                                                <Icon icon="mdi:robot-happy" className="text-nexus-green" />
                                                {t('profile.selectNexon')}
                                            </h2>
                                            <p className="text-gray-400 text-sm mt-1">Choose your identity in the Nexus.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {user.avatar_unlock_tokens && user.avatar_unlock_tokens > 0 && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                    <Icon icon="mdi:ticket-confirmation" className="text-yellow-500" />
                                                    <span className="text-sm font-bold text-yellow-500">
                                                        {user.avatar_unlock_tokens} Tokens
                                                    </span>
                                                </div>
                                            )}
                                            <button onClick={() => setIsAvatarModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                                <Icon icon="mdi:close" className="h-6 w-6 text-red-500" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                        {/* Category Tabs */}
                                        <div className="flex gap-2 p-1 bg-black/40 rounded-xl w-fit">
                                            {['all', 'male', 'female', 'general', ...(user.role === 'admin' ? ['admin'] : [])].map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setActiveCategory(cat as any)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeCategory === cat
                                                        ? 'bg-nexus-green text-black shadow-lg'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Filters */}
                                        <div className="flex items-center gap-3 bg-nexus-card/30 p-1.5 rounded-xl border border-white/5">
                                            <Icon icon="mdi:magnify" className="text-gray-400 ml-2" />
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                value={avatarSearch}
                                                onChange={(e) => setAvatarSearch(e.target.value)}
                                                className="bg-transparent border-none outline-none text-white text-sm w-32 focus:w-48 transition-all placeholder:text-gray-500"
                                            />
                                            <div className="h-6 w-px bg-white/10 mx-1" />
                                            <select
                                                value={filter}
                                                onChange={(e: any) => setFilter(e.target.value)}
                                                className="bg-transparent border-none outline-none text-gray-300 text-sm font-medium cursor-pointer hover:text-white"
                                            >
                                                <option value="all">Show All</option>
                                                <option value="unlocked">Owned</option>
                                                <option value="locked">Locked</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Body (Grid) */}
                                <div className="custom-scrollbar flex-1 overflow-y-auto p-6 bg-linear-to-b from-black/20 to-black/40">
                                    {isLoadingAvatars ? (
                                        <div className="flex h-64 items-center justify-center flex-col gap-4 text-gray-400">
                                            <Loader />
                                            <p>Loading your collection...</p>
                                        </div>
                                    ) : filteredAvatars.length === 0 ? (
                                        <div className="flex h-64 flex-col items-center justify-center text-gray-500 gap-2 border border-dashed border-white/10 rounded-2xl mx-auto max-w-lg">
                                            <Icon icon="mdi:ghost-off" className="text-4xl opacity-50" />
                                            <p>No Nexons found matching your criteria.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {filteredAvatars.map(avatar => {
                                                const canUnlock = !avatar.is_unlocked && avatar.type === 'reward' && (user.avatar_unlock_tokens || 0) > 0;
                                                const isEquipped = user.current_avatar_url === avatar.image_url;

                                                return (
                                                    <div
                                                        key={avatar._id}
                                                        onClick={() => handleAvatarClick(avatar)}
                                                        className={`relative group rounded-xl border p-3 flex flex-col items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden
                                                            ${isEquipped
                                                                ? 'bg-nexus-green/10 border-nexus-green shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                                : avatar.is_unlocked
                                                                    ? 'bg-nexus-card/40 border-white/10 hover:border-nexus-green/50 hover:bg-nexus-card/60'
                                                                    : 'bg-black/40 border-white/5 opacity-70 hover:opacity-100'
                                                            }
                                                        `}
                                                    >
                                                        {/* Status Badge */}
                                                        <div className="absolute top-2 right-2 z-10">
                                                            {isEquipped && <Icon icon="mdi:check-circle" className="text-nexus-green text-xl" />}
                                                            {!avatar.is_unlocked && !canUnlock && <Icon icon="mdi:lock" className="text-gray-500 text-lg" />}
                                                            {canUnlock && <Icon icon="mdi:lock-open-variant" className="text-yellow-500 animate-pulse text-lg" />}
                                                        </div>

                                                        {/* Avatar Image */}
                                                        <div className="relative w-24 h-24 mb-2 group-hover:scale-105 transition-transform my-4">
                                                            <img
                                                                src={avatar.image_url}
                                                                alt={avatar.name}
                                                                className={`w-full h-full object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] ${!avatar.is_unlocked && !canUnlock ? 'grayscale brightness-50' : ''}`}
                                                            />
                                                        </div>

                                                        {/* Name */}
                                                        <h4 className={`text-[10px] font-bold text-center uppercase tracking-wider mb-1 px-1 truncate w-full ${isEquipped ? 'text-nexus-green' : 'text-gray-300'}`}>
                                                            {avatar.name.replace(/\(.\)/, '')}
                                                        </h4>

                                                        {/* Unlock Info / Type */}
                                                        <div className="text-[9px] text-center w-full min-h-[14px]">
                                                            {avatar.is_unlocked ? (
                                                                <span className="text-gray-500 font-medium">Owned</span>
                                                            ) : (
                                                                <span className={`${canUnlock ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}>
                                                                    {avatar.unlock_condition === 'level_up' && `Lvl ${avatar.required_level}+`}
                                                                    {avatar.unlock_condition === 'token' && 'Redeem Token'}
                                                                    {avatar.unlock_condition === 'course_completion' && 'Course Reward'}
                                                                    {avatar.unlock_condition === 'none' && 'Locked'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Hover Action Overlay */}
                                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20">
                                                            {avatar.is_unlocked ? (
                                                                <span className="text-nexus-green font-bold text-xs uppercase border border-nexus-green px-3 py-1 rounded-full bg-black/50">
                                                                    {isEquipped ? 'Equipped' : 'Equip'}
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {canUnlock ? (
                                                                        <button className="bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full hover:scale-105 transition-transform flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                                                                            <Icon icon="mdi:key-variant" /> Unlock
                                                                        </button>
                                                                    ) : (
                                                                        <div className="text-center">
                                                                            <Icon icon="mdi:lock" className="text-gray-400 mx-auto mb-1 text-lg" />
                                                                            <p className="text-[10px] text-gray-300 leading-tight px-2 font-medium">
                                                                                {avatar.unlock_condition === 'level_up' && `Reach Level ${avatar.required_level}`}
                                                                                {avatar.unlock_condition === 'token' && `Requires Token`}
                                                                                {avatar.unlock_condition === 'course_completion' && `Complete Course`}
                                                                                {avatar.unlock_condition === 'none' && `Not Available`}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
