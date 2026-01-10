import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import type { Avatar, User } from '../types';
import { FullScreenLoader } from '../components/ui/Loader';
import { MAJORS, SEMESTERS } from '../constants/onboarding';

export default function Profile() {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    // const navigate = useNavigate();

    // --- State Management ---
    const [unlockedAvatars, setUnlockedAvatars] = useState<Avatar[]>([]);
    const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarSearch, setAvatarSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'male' | 'female' | 'general' | 'admin'>('all');
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
    const [isUnlocking, setIsUnlocking] = useState(false);

    // Profile Tabs
    const [activeTab, setActiveTab] = useState<'overview' | 'following' | 'friends' | 'requests' | 'settings'>('overview');

    // Social Data
    const [friends, setFriends] = useState<User[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);

    // Loading States
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
    const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

    // Privacy Settings
    const [privacySettings, setPrivacySettings] = useState({
        show_nexons: true,
        show_courses: true
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // --- Effects ---

    useEffect(() => {
        if (user) {
            fetchAvatars();
            fetchRequests(); // Always fetch requests to show badge
            // Initialize privacy settings
            setPrivacySettings({
                show_nexons: user.privacy_settings?.show_nexons ?? true,
                show_courses: user.privacy_settings?.show_courses ?? true
            });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'friends') fetchFriends();
        if (activeTab === 'requests') fetchRequests();
        if (activeTab === 'following') fetchFollowing();
        if (activeTab === 'overview' && user?.role === 'tutor') fetchMyFollowers(); // Show followers in overview for tutors? Or keep separate? 
        // Let's keep followers as a sub-section or separate tab. The original plan had 'followers' tab for tutors.
        // Let's add 'followers' to the tabs list if tutor.
    }, [activeTab]);

    // Additional check for Tutor Followers if they are on that tab (if we add it back explicitly)
    useEffect(() => {
        if (user?.role === 'tutor') {
            fetchMyFollowers();
        }
    }, [user]);


    // --- Data Fetching ---

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

    const fetchFollowing = async () => {
        setIsLoadingFollowing(true);
        try {
            const res = await api.get('/social/following');
            setFollowing(res.data);
        } catch (error) {
            console.error('Failed to fetch following', error);
        } finally {
            setIsLoadingFollowing(false);
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

    // --- Actions ---

    const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            if (action === 'accept') {
                await api.post(`/social/friends/accept/${requestId}`);
                showToast('Friend request accepted!', 'success');
                fetchRequests();
                fetchFriends(); // Refresh friends list too
            } else {
                await api.delete(`/social/friends/request/${requestId}`);
                showToast('Friend request rejected', 'info');
                fetchRequests();
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Action failed', 'error');
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

    const handlePrivacySave = async () => {
        setIsSavingSettings(true);
        try {
            const res = await api.put('/user/profile', {
                privacy_settings: privacySettings
            });
            updateUser(res.data);
            showToast('Privacy protocols updated.', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to save settings', 'error');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleAvatarClick = async (avatar: Avatar) => {
        if (!user) return;
        if (avatar.is_unlocked) {
            try {
                const res = await api.put('/user/avatar', { avatar_id: avatar._id });
                updateUser({ current_avatar_url: res.data.current_avatar_url });
                showToast(t('profile.avatarUpdated'), 'success');
                setIsAvatarModalOpen(false);
            } catch (error: any) {
                showToast(error.response?.data?.message || 'Failed to update avatar', 'error');
            }
        } else {
            if (avatar.type === 'reward' && avatar.unlock_condition === 'token') {
                if ((user.avatar_unlock_tokens || 0) > 0) {
                    handleUnlockAvatar(avatar);
                } else {
                    showToast(t('profile.noTokens'), 'error');
                }
            } else if (avatar.unlock_condition === 'course_completion') {
                showToast(avatar.required_course_title ? `Complete mission: "${avatar.required_course_title}" to unlock!` : 'Complete the required mission to unlock.', 'info');
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
            showToast('Access Granted: New Avatar Unlocked', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Unlock Failed', 'error');
        } finally {
            setIsUnlocking(false);
        }
    };

    // --- Derived State ---
    const filteredAvatars = unlockedAvatars.filter(avatar => {
        const matchesSearch = !avatarSearch || avatar.name.toLowerCase().includes(avatarSearch.toLowerCase());
        const matchesCondition = filter === 'all' || (filter === 'unlocked' ? avatar.is_unlocked : !avatar.is_unlocked);
        const matchesCategory = activeCategory === 'all' || (avatar.category || 'general') === activeCategory;
        return matchesSearch && matchesCondition && matchesCategory;
    });

    const XP_PER_LEVEL = 500;
    const currentLevelXP = ((user?.xp_points || 0) % XP_PER_LEVEL);
    const progressPercent = Math.min(100, Math.max(0, (currentLevelXP / XP_PER_LEVEL) * 100));

    if (!user) return <FullScreenLoader />;

    return (
        <div className="min-h-screen bg-nexus-black pt-28 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[900px] h-[900px] bg-blue-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[700px] h-[700px] bg-nexus-green/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl p-8 sm:p-12 shadow-2xl"
                >
                    {/* Inner Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                        {/* 3D Flip Avatar */}
                        <div
                            className="relative w-40 h-40 group/avatar cursor-pointer shrink-0 perspective-1000"
                            onClick={() => setIsAvatarModalOpen(true)}
                        >
                            <div className="w-full h-full transition-all duration-700 text-center [transform-style:preserve-3d] group-hover/avatar:[transform:rotateY(180deg)] shadow-[0_0_50px_rgba(59,130,246,0.2)] rounded-full">
                                {/* Front Face */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-[4px] bg-gradient-to-r from-blue-500 via-purple-500 to-nexus-green [backface-visibility:hidden]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-black relative">
                                        <img
                                            src={user.current_avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                            alt={user.username}
                                            className="w-full h-full object-cover p-2"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                            <Icon icon="mdi:camera" className="text-white text-3xl drop-shadow-lg" />
                                        </div>
                                    </div>
                                </div>
                                {/* Back Face */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-[4px] bg-gradient-to-r from-nexus-green via-blue-500 to-purple-500 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-gradient-to-b from-gray-900 to-black relative flex flex-col items-center justify-center">
                                        <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                                        <span className="text-4xl font-black text-white relative z-10">{user.level || 1}</span>
                                        <span className="text-[9px] uppercase font-bold text-blue-400 tracking-widest relative z-10">Level</span>
                                    </div>
                                </div>
                            </div>
                            {/* Edit Badge */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-nexus-green text-black text-[10px] uppercase font-black px-4 py-1.5 rounded-full border border-white/20 hover:scale-105 transition-transform z-30 shadow-lg tracking-wider">
                                Edit
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center md:justify-start gap-4 tracking-tight">
                                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                                    {user.role === 'admin' && <Icon icon="mdi:shield-crown" className="text-red-500" width="32" />}
                                    {user.role === 'tutor' && <Icon icon="mdi:school" className="text-nexus-green" width="32" />}
                                </h1>
                                <div className="flex flex-col md:flex-row items-center gap-3 mt-2">
                                    <p className="text-gray-500 text-sm font-bold tracking-wider uppercase">@{user.username}</p>
                                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-700" />
                                    <Link to={`/users/${user._id}`} className="text-blue-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border-b border-blue-400/30 hover:border-white">
                                        View Public Profile
                                    </Link>
                                </div>
                            </div>

                            {user.bio && (
                                <p className="text-gray-300 max-w-2xl mx-auto md:mx-0 leading-relaxed text-lg font-light border-l-2 border-white/10 pl-4 md:pl-0 md:border-l-0">
                                    "{user.bio}"
                                </p>
                            )}

                            {/* Academic Details - WITH EDIT BUTTON */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Major</p>
                                    <p className="text-white font-bold text-sm">
                                        {user.major ? t(`onboarding.${MAJORS.find(m => m.value === user.major)?.labelKey || 'majors.other'}`) : 'Not Set'}
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Semester</p>
                                    <p className="text-white font-bold text-sm">
                                        {user.semester ? t(`onboarding.${SEMESTERS.find(s => s.value === user.semester)?.labelKey || 'unknown'}`) : 'Not Set'}
                                    </p>
                                </div>

                                <Link to="/onboarding" className="bg-white/5 hover:bg-nexus-green/20 border border-white/10 hover:border-nexus-green/50 px-4 py-2 rounded-xl flex items-center gap-2 group transition-all">
                                    <Icon icon="mdi:pencil" className="text-gray-400 group-hover:text-nexus-green" />
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">Edit Profile</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Holographic Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/5">
                        {/* Level Progress */}
                        <div className="bg-black/20 rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon icon="mdi:target" className="text-4xl text-nexus-green" />
                            </div>
                            <div className="flex justify-between items-end mb-2 relative z-10">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Progress to Lvl {user.level ? user.level + 1 : 2}</p>
                                    <p className="text-2xl font-black text-white">{Math.floor(progressPercent)}%</p>
                                </div>
                                <span className="text-nexus-green font-mono text-xs">{currentLevelXP}/{XP_PER_LEVEL} XP</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden relative z-10">
                                <div
                                    className="h-full bg-nexus-green shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Total XP */}
                        <div className="bg-black/20 rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon icon="mdi:star-four-points" className="text-4xl text-purple-500" />
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Experience</p>
                            <p className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">
                                {user.xp_points?.toLocaleString() || 0} <span className="text-sm font-bold text-gray-600">XP</span>
                            </p>
                        </div>

                        {/* Tokens */}
                        <div className="bg-black/20 rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon icon="mdi:ticket-confirmation" className="text-4xl text-yellow-500" />
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Nexon Tokens</p>
                            <p className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">
                                {user.avatar_unlock_tokens || 0} <span className="text-sm font-bold text-gray-600">TIX</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-8 border-b border-white/10 no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview', icon: 'mdi:view-dashboard-outline' },
                        { id: 'following', label: 'Following', icon: 'mdi:account-group' },
                        { id: 'friends', label: 'Friends', icon: 'mdi:account-heart' },
                        { id: 'requests', label: 'Requests', icon: 'mdi:account-clock', count: pendingRequests.length },
                        { id: 'settings', label: 'System', icon: 'mdi:cog-outline' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 px-2 group relative flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === tab.id ? 'text-nexus-green' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            <Icon icon={tab.icon} className="text-lg" />
                            <span className="font-bold uppercase tracking-wider text-xs">{tab.label}</span>
                            {tab.count ? (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-nexus-green text-black' : 'bg-white/10 text-white'}`}>
                                    {tab.count}
                                </span>
                            ) : null}

                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeProfileTabMain"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-nexus-green shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                                />
                            )}
                        </button>
                    ))}
                    {user.role === 'tutor' && (
                        /* Tutors see followers in overview, but we could add tab here if needed */
                        null
                    )}
                </div>

                {/* Content Panel */}
                <AnimatePresence mode="wait">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Tutor Followers Data */}
                            {user.role === 'tutor' &&
                                isLoadingFollowers ? (
                                <div className="py-20 flex justify-center"><Icon icon="mdi:loading" className="animate-spin text-4xl text-nexus-green" /></div>
                            ) : (
                                <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                            <Icon icon="mdi:account-group" className="text-blue-500" />
                                            Active Followers
                                        </h3>
                                        <span className="text-xs text-gray-500 font-mono">{followers.length} CADETS</span>
                                    </div>
                                    )


                                    {followers.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
                                            <p className="text-sm font-bold uppercase tracking-wide">No followers registered yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {followers.map((f) => (
                                                <Link to={`/users/${f._id}`} key={f._id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 hover:border-blue-500/30 transition-all group">
                                                    <img
                                                        src={f.current_avatar_url || `https://ui-avatars.com/api/?name=${f.username}`}
                                                        className="w-10 h-10 rounded-full border border-white/10 group-hover:border-blue-500/50 transition-colors"
                                                        alt={f.username}
                                                    />
                                                    <div className="overflow-hidden">
                                                        <p className="text-white font-bold text-sm truncate group-hover:text-blue-400 transition-colors">{f.first_name} {f.last_name}</p>
                                                        <p className="text-[12px] text-nexus-green uppercase tracking-wider font-bold">{f.username}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Lvl {f.level || 0}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Basic Quick Links / Empty Overview State */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link to="/my-courses" className="bg-gradient-to-br from-nexus-green/20 to-black border border-nexus-green/30 rounded-3xl p-8 flex flex-col items-start justify-between hover:scale-[1.02] transition-transform group h-64">
                                    <div className="p-4 bg-nexus-green text-black rounded-2xl mb-4 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-shadow">
                                        <Icon icon="mdi:school" className="text-3xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">My Missions</h3>
                                        <p className="text-gray-400 text-sm font-medium">Resume your training and track progress.</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-nexus-green font-bold uppercase tracking-widest text-xs">
                                        Access Dashboard <Icon icon="mdi:arrow-right" />
                                    </div>
                                </Link>

                                <div
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="bg-gradient-to-br from-purple-500/20 to-black border border-purple-500/30 rounded-3xl p-8 flex flex-col items-start justify-between hover:scale-[1.02] transition-transform group cursor-pointer h-64"
                                >
                                    <div className="p-4 bg-purple-500 text-white rounded-2xl mb-4 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-shadow">
                                        <Icon icon="mdi:robot-happy" className="text-3xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Nexon Armory</h3>
                                        <p className="text-gray-400 text-sm font-medium">Unlock new avatars and manage your identity.</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-xs">
                                        Open Collection <Icon icon="mdi:arrow-right" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* FRIENDS TAB */}
                    {activeTab === 'friends' && (
                        <motion.div
                            key="friends"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                <span className="p-2 bg-pink-500/20 rounded-lg text-pink-500"><Icon icon="mdi:account-heart" /></span>
                                Allies ({friends.length})
                            </h2>

                            {isLoadingFriends ? (
                                <div className="py-20 flex justify-center"><Icon icon="mdi:loading" className="animate-spin text-4xl text-nexus-green" /></div>
                            ) : friends.length === 0 ? (
                                <div className="text-center py-20 bg-black/40 rounded-3xl border border-white/10">
                                    <Icon icon="mdi:account-off-outline" className="text-5xl text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No Allies Found</h3>
                                    <p className="text-gray-400">Expand your network by visiting other user profiles.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {friends.map(friend => (
                                        <Link to={`/users/${friend._id}`} key={friend._id} className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:border-pink-500/50 hover:bg-white/5 transition-all group">
                                            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-r from-pink-500 to-purple-500 mb-4 group-hover:scale-105 transition-transform">
                                                <img
                                                    src={friend.current_avatar_url || `https://ui-avatars.com/api/?name=${friend.username}`}
                                                    className="w-full h-full rounded-full object-cover border-2 border-black"
                                                />
                                            </div>
                                            <h3 className="text-white font-bold text-lg group-hover:text-pink-400 transition-colors truncate w-full">
                                                {friend.first_name ? `${friend.first_name} ${friend.last_name}` : friend.username}
                                            </h3>
                                            <p className="text-nexus-green text-xs font-bold uppercase tracking-widest mb-1">{friend.role}</p>
                                            <p className="text-gray-500 text-xs">Lvl {friend.level || 0}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* FOLLOWING TAB */}
                    {activeTab === 'following' && (
                        <motion.div
                            key="following"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                <span className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><Icon icon="mdi:account-group" /></span>
                                Mentors ({following.length})
                            </h2>

                            {isLoadingFollowing ? (
                                <div className="py-20 flex justify-center"><Icon icon="mdi:loading" className="animate-spin text-4xl text-nexus-green" /></div>
                            ) : following.length === 0 ? (
                                <div className="text-center py-20 bg-black/40 rounded-3xl border border-white/10">
                                    <Icon icon="mdi:school-outline" className="text-5xl text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">You are not following any tutors.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {following.map(tutor => (
                                        <div key={tutor._id} className="bg-black/40 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-500/50 transition-all group">
                                            <Link to={`/tutors/${tutor._id}`} className="shrink-0 relative">
                                                <div className="w-16 h-16 rounded-full bg-blue-500/20 p-0.5">
                                                    <img
                                                        src={tutor.current_avatar_url || `https://ui-avatars.com/api/?name=${tutor.username}`}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                </div>
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/tutors/${tutor._id}`} className="text-white font-bold hover:text-blue-400 transition-colors truncate block">
                                                    {tutor.first_name} {tutor.last_name}
                                                </Link>
                                                <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-2">{tutor.expertise || "Tutor"}</p>
                                                <button
                                                    onClick={() => handleUnfollow(tutor._id)}
                                                    className="text-[10px] text-red-500 hover:text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase font-bold"
                                                >
                                                    Unfollow
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* REQUESTS TAB */}
                    {activeTab === 'requests' && (
                        <motion.div key="requests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                <span className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Icon icon="mdi:account-clock" /></span>
                                Incoming Transmissions
                            </h2>
                            {isLoadingRequests ? (
                                <div className="py-20 flex justify-center"><Icon icon="mdi:loading" className="animate-spin text-4xl text-nexus-green" /></div>
                            ) : pendingRequests.length === 0 ? (
                                <div className="text-center py-20 bg-black/40 rounded-3xl border border-white/10">
                                    <Icon icon="mdi:radar" className="text-5xl text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">No pending requests detected.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {pendingRequests.map((req) => (
                                        <div key={req._id} className="bg-black/40 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                                            <Link to={`/users/${req.requester_id._id}`} className="flex items-center gap-3">
                                                <img
                                                    src={req.requester_id.current_avatar_url || `https://ui-avatars.com/api/?name=${req.requester_id.username}`}
                                                    className="w-12 h-12 rounded-full border border-white/10"
                                                />
                                                <div>
                                                    <p className="text-white font-bold text-sm">{req.requester_id.username}</p>
                                                    <p className="text-xs text-nexus-green uppercase font-bold tracking-wider">Requested Access</p>
                                                </div>
                                            </Link>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleRequestAction(req._id, 'accept')} className="p-2 bg-nexus-green/20 text-nexus-green rounded-lg hover:bg-nexus-green hover:text-black transition-colors">
                                                    <Icon icon="mdi:check" />
                                                </button>
                                                <button onClick={() => handleRequestAction(req._id, 'reject')} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                    <Icon icon="mdi:close" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                <span className="p-2 bg-gray-700/50 rounded-lg text-gray-300"><Icon icon="mdi:shield-account" /></span>
                                System Protocols
                            </h2>
                            <div className="bg-black/40 border border-white/10 rounded-3xl p-8 max-w-2xl">
                                <div className="space-y-8">
                                    {/* Toggle Nexon Visibility */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-lg mb-1">Public Nexon Registry</h4>
                                            <p className="text-gray-400 text-xs">Allow other operatives to view your unlocked avatar collection.</p>
                                        </div>
                                        <button
                                            onClick={() => setPrivacySettings(p => ({ ...p, show_nexons: !p.show_nexons }))}
                                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${privacySettings.show_nexons ? 'bg-nexus-green shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-800'}`}
                                        >
                                            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${privacySettings.show_nexons ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    {/* Toggle Course Visibility */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-lg mb-1">Mission Log Visibility</h4>
                                            <p className="text-gray-400 text-xs">Allow others to see your enrolled courses and completion status.</p>
                                        </div>
                                        <button
                                            onClick={() => setPrivacySettings(p => ({ ...p, show_courses: !p.show_courses }))}
                                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${privacySettings.show_courses ? 'bg-nexus-green shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-800'}`}
                                        >
                                            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${privacySettings.show_courses ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handlePrivacySave}
                                        disabled={isSavingSettings}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest mt-6"
                                    >
                                        {isSavingSettings ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:content-save" />}
                                        Update Protocols
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* AVATAR MODAL (ARMORY STYLE) */}
            <AnimatePresence>
                {isAvatarModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-6xl h-[85vh] bg-nexus-black border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative"
                        >
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

                            {/* Header */}
                            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/50 relative z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 flex items-center gap-3">
                                        <Icon icon="mdi:robot" className="text-nexus-green" />
                                        Nexon Armory
                                    </h2>
                                    <p className="text-gray-400 text-sm font-bold tracking-wide">Select your digital identity</p>
                                </div>
                                <button onClick={() => setIsAvatarModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <Icon icon="mdi:close" className="text-2xl text-white" />
                                </button>
                            </div>

                            {/* Filters & Content */}
                            <div className="flex-1 flex overflow-hidden relative z-10">
                                {/* Sidebar */}
                                <div className="w-64 border-r border-white/10 p-6 space-y-8 bg-black/20 hidden md:block">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Availability</p>
                                        <div className="space-y-2">
                                            {['all', 'unlocked', 'locked'].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setFilter(f as any)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-nexus-green text-black' : 'text-gray-400 hover:bg-white/5'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Category</p>
                                        <div className="space-y-2">
                                            {['all', 'male', 'female', 'general', ...(user.role === "admin" ? ['admin'] : [])].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setActiveCategory(f as any)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeCategory === f ? 'bg-nexus-green text-black' : 'text-gray-400 hover:bg-white/5'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Search Database</p>
                                        <div className="relative">
                                            <Icon icon="mdi:magnify" className="absolute left-3 top-3 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="SEARCH..."
                                                value={avatarSearch}
                                                onChange={(e) => setAvatarSearch(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 text-white text-xs font-bold focus:border-nexus-green focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Grid */}
                                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                    {isLoadingAvatars ? (
                                        <FullScreenLoader />
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                            {filteredAvatars.map(avatar => {
                                                const isEquipped = user.current_avatar_url === avatar.image_url;
                                                return (
                                                    <div
                                                        key={avatar._id}
                                                        className={`relative aspect-[3/4] rounded-2xl p-4 border transition-all duration-300 group flex flex-col items-center justify-between
                                                            ${isEquipped
                                                                ? 'bg-nexus-green/10 border-nexus-green shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                                                : avatar.is_unlocked
                                                                    ? 'bg-white/5 border-white/10 hover:border-white/50 hover:bg-white/10'
                                                                    : 'bg-black/40 border-white/5 opacity-60 hover:opacity-100 hover:border-yellow-500/50'
                                                            }
                                                        `}
                                                        onClick={() => handleAvatarClick(avatar)}
                                                    >
                                                        {/* Status Badge */}
                                                        {isEquipped && (
                                                            <div className="absolute top-3 right-3 bg-nexus-green text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full z-10">
                                                                Active
                                                            </div>
                                                        )}
                                                        {!avatar.is_unlocked && (
                                                            <div className="absolute top-3 right-3 bg-black/80 text-yellow-500 border border-yellow-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
                                                                <Icon icon="mdi:lock" />
                                                                {avatar.unlock_condition === 'token' ? `${avatar.token_cost || 1} TIX` : 'Locked'}
                                                            </div>
                                                        )}

                                                        <div className="relative w-full aspect-square mb-2 group-hover:scale-105 transition-transform duration-300">
                                                            <img
                                                                src={avatar.image_url}
                                                                className={`w-full h-full object-contain filter ${!avatar.is_unlocked ? 'grayscale contrast-125' : ''}`}
                                                                alt={avatar.name}
                                                            />
                                                        </div>

                                                        <div className="text-center w-full">
                                                            <p className={`text-xs font-bold uppercase tracking-wider truncate mb-2 ${isEquipped ? 'text-nexus-green' : 'text-white'}`}>
                                                                {avatar.name}
                                                            </p>

                                                            {avatar.is_unlocked ? (
                                                                <button className={`w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                                                                    ${isEquipped ? 'bg-nexus-green text-black' : 'bg-white/10 text-gray-300 hover:bg-white hover:text-black'}
                                                                 `}>
                                                                    {isEquipped ? 'Equipped' : 'Equip'}
                                                                </button>
                                                            ) : (
                                                                <button disabled={isUnlocking} className="w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black border border-yellow-500/30 transition-all flex items-center justify-center gap-1">
                                                                    {isUnlocking ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:lock-open-variant" />}
                                                                    Unlock
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
