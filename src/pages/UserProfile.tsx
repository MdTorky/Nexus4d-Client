import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { FullScreenLoader } from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { User } from '../types';

interface PublicUserProfile {
    user: User;
    friendStatus: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted' | 'rejected';
    requestId?: string;
    unlockedAvatars?: {
        _id: string;
        avatar_id: {
            _id: string;
            name: string;
            image_url: string;
        };
    }[];
    enrolledCourses?: any[];
    completedCourses?: any[];
}

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'courses'>('overview');

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/social/users/${id}`);
            if (data.friendStatus === 'friends') data.friendStatus = 'accepted';
            setProfile(data);
        } catch (error: any) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFriendAction = async (action: 'add' | 'cancel' | 'accept') => {
        if (!currentUser) {
            showToast('Please login to continue', 'info');
            return;
        }
        setActionLoading(true);
        try {
            if (action === 'add') {
                await api.post(`/social/friends/request/${id}`);
                setProfile(prev => prev ? ({ ...prev, friendStatus: 'pending_outgoing' }) : null);
                showToast('Friend request sent!', 'success');
            } else if (action === 'cancel') {
                if (profile?.requestId) {
                    await api.delete(`/social/friends/request/${profile.requestId}`);
                    setProfile(prev => prev ? ({ ...prev, friendStatus: 'none', requestId: undefined }) : null);
                    showToast('Request cancelled', 'info');
                }
            } else if (action === 'accept') {
                if (profile?.requestId) {
                    await api.post(`/social/friends/accept/${profile.requestId}`);
                    setProfile(prev => prev ? ({ ...prev, friendStatus: 'accepted' }) : null);
                    showToast('Friend request accepted!', 'success');
                }
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Action failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <FullScreenLoader />;
    if (!profile) return <div className="min-h-screen bg-nexus-black pt-32 text-center text-white font-bold text-xl uppercase tracking-widest">User not found</div>;

    const isMe = currentUser?._id === profile.user._id;

    return (
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[900px] h-[900px] bg-blue-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[700px] h-[700px] bg-nexus-green/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">

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
                        <div className="relative w-40 h-40 group/avatar cursor-pointer shrink-0 perspective-1000">
                            <div className="w-full h-full transition-all duration-700 text-center [transform-style:preserve-3d] group-hover/avatar:[transform:rotateY(180deg)] shadow-[0_0_50px_rgba(59,130,246,0.2)] rounded-full">

                                {/* Front Face: Real Photo */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-[4px] bg-gradient-to-r from-blue-500 via-purple-500 to-nexus-green [backface-visibility:hidden]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-black relative">
                                        <img
                                            src={profile.user.current_avatar_url || profile.user.avatar_url || `https://ui-avatars.com/api/?name=${profile.user.username}`}
                                            alt={profile.user.username}
                                            className="w-full h-full object-cover p-3"
                                        />
                                        {/* Scanline Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px] mix-blend-overlay opacity-30 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Back Face: Rank */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-[4px] bg-gradient-to-r from-nexus-green via-blue-500 to-purple-500 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-gradient-to-b from-gray-900 to-black relative flex flex-col items-center justify-center">
                                        <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                                        <span className="text-4xl font-black text-white relative z-10">{profile.user.level || 1}</span>
                                        <span className="text-[9px] uppercase font-bold text-blue-400 tracking-widest relative z-10">Level</span>
                                    </div>
                                </div>
                            </div>

                            {/* Level Badge */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-[10px] uppercase font-black text-white px-4 py-1.5 rounded-full border border-blue-500/50 text-blue-400 backdrop-blur-md whitespace-nowrap z-30 shadow-[0_0_20px_rgba(59,130,246,0.4)] tracking-widest">
                                Lvl {profile.user.level || 1} {profile.user.role === 'tutor' ? 'Master' : 'Cadet'}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-5">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center md:justify-start gap-4 tracking-tight">
                                    {profile.user.first_name ? `${profile.user.first_name} ${profile.user.last_name}` : profile.user.username}
                                    {profile.user.role === 'admin' && <Icon icon="mdi:shield-crown" className="text-red-500" width="32" />}
                                    {profile.user.role === 'tutor' && <Icon icon="mdi:school" className="text-nexus-green" width="32" />}
                                </h1>
                                <div className="flex flex-col md:flex-row items-center gap-3 mt-2">
                                    <p className="text-gray-500 text-sm font-bold tracking-wider uppercase">@{profile.user.username}</p>
                                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-700" />
                                    <p className="text-blue-400 text-sm font-bold uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                                        {profile.user.role}
                                    </p>
                                    {profile.friendStatus === 'accepted' && (
                                        <p className="text-nexus-green text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Icon icon="mdi:check-circle" /> Friend
                                        </p>
                                    )}
                                </div>
                            </div>

                            {profile.user.bio && (
                                <p className="text-gray-300 max-w-2xl mx-auto md:mx-0 leading-relaxed text-lg font-light border-l-2 border-white/10 pl-4 md:pl-0 md:border-l-0">
                                    "{profile.user.bio}"
                                </p>
                            )}

                            {/* Action Buttons */}
                            {!isMe && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                    {profile.friendStatus === 'none' && (
                                        <button
                                            onClick={() => handleFriendAction('add')}
                                            disabled={actionLoading}
                                            className="px-8 py-3 bg-nexus-green text-black rounded-xl font-black hover:bg-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2 uppercase tracking-wide text-sm"
                                        >
                                            {actionLoading ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:account-plus" />}
                                            Add Friend
                                        </button>
                                    )}

                                    {profile.friendStatus === 'pending_outgoing' && (
                                        <button
                                            onClick={() => handleFriendAction('cancel')}
                                            disabled={actionLoading}
                                            className="px-8 py-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-500/20 transition-all uppercase tracking-wide text-sm"
                                        >
                                            {actionLoading ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:close" />}
                                            Cancel Request
                                        </button>
                                    )}

                                    {profile.friendStatus === 'pending_incoming' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleFriendAction('accept')}
                                                disabled={actionLoading}
                                                className="px-6 py-3 bg-nexus-green text-black rounded-xl font-black hover:bg-white transition-all flex items-center gap-2 uppercase tracking-wide text-sm"
                                            >
                                                {actionLoading ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:check" />}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleFriendAction('cancel')}
                                                disabled={actionLoading}
                                                className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl font-bold hover:bg-red-500/20 transition-all flex items-center gap-2 uppercase tracking-wide text-sm"
                                            >
                                                <Icon icon="mdi:close" /> Decline
                                            </button>
                                        </div>
                                    )}

                                    {profile.user.role === 'tutor' && (
                                        <Link
                                            to={`/tutors/${profile.user._id}`}
                                            className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2 uppercase tracking-wide text-sm"
                                        >
                                            <Icon icon="mdi:school" /> View Tutor Profile
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 border-t border-white/5 mt-10 pt-8 max-w-3xl mx-auto md:mx-0">
                        <div className="text-center md:text-left group cursor-default">
                            <p className="text-3xl font-black text-white group-hover:text-nexus-green transition-colors">{profile.enrolledCourses?.length || 0}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Enrolled</p>
                        </div>
                        <div className="w-px bg-white/10 h-full mx-auto hidden md:block" />
                        <div className="text-center md:text-left group cursor-default">
                            <p className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">{profile.completedCourses?.length || 0}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Completed</p>
                        </div>
                        <div className="w-px bg-white/10 h-full mx-auto hidden md:block" />
                        <div className="text-center md:text-left group cursor-default">
                            <p className="text-3xl font-black text-white group-hover:text-purple-400 transition-colors">{profile.unlockedAvatars?.length || 0}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Nexons</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-white/10 pb-1">
                    {['overview', 'courses'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 px-4 text-sm font-black uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-nexus-green' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab === 'overview' ? 'Overview' : 'Missions'}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeProfileTab"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-nexus-green shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Nexons */}
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                                    <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Icon icon="mdi:robot-happy" /></span>
                                    Nexon Collection
                                </h3>

                                {/* Privacy Guard */}
                                {profile.user.privacy_settings?.show_nexons === false ? (
                                    <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-black/20">
                                        <Icon icon="mdi:lock-outline" className="text-5xl text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold">Collection Encrypted</p>
                                        <p className="text-xs text-gray-600 uppercase tracking-wider mt-1">User privacy settings enabled</p>
                                    </div>
                                ) : profile.unlockedAvatars && profile.unlockedAvatars.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                        {profile.unlockedAvatars.map((ua) => (
                                            <div key={ua._id} className="group relative aspect-square bg-black/40 rounded-2xl p-3 border border-white/5 hover:border-purple-500/50 hover:bg-purple-900/10 transition-all flex items-center justify-center cursor-pointer overflow-hidden">
                                                <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <img
                                                    src={ua.avatar_id?.image_url}
                                                    alt={ua.avatar_id?.name}
                                                    className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-transform duration-300 relative z-10"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/90 backdrop-blur-md text-center text-[9px] py-1.5 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 uppercase font-bold tracking-wider z-20">
                                                    {ua.avatar_id?.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>No unlocked Nexons yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Academic & Achievements */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                                        <span className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Icon icon="mdi:trophy-outline" /></span>
                                        Achievements
                                    </h3>

                                    {profile.user.privacy_settings?.show_courses === false ? (
                                        <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl bg-black/20">
                                            <Icon icon="mdi:lock-outline" className="mb-2 mx-auto text-2xl opacity-50" />
                                            <span className="text-xs uppercase tracking-widest font-bold">Private Data</span>
                                        </div>
                                    ) : profile.completedCourses && profile.completedCourses.length > 0 ? (
                                        <div className="space-y-4">
                                            {profile.completedCourses.map((uc, i) => (
                                                <div key={uc._id || i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg text-black shadow-lg shadow-yellow-500/20">
                                                        <Icon icon="mdi:medal" className="text-xl" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">Course Completed</h4>
                                                        <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{uc.course_id?.title}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">No medals earned yet.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                                        <span className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><Icon icon="mdi:school-outline" /></span>
                                        Academic Intel
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Major</span>
                                            <span className="text-white font-bold">{profile.user.major || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Semester</span>
                                            <span className="text-white font-bold">{profile.user.semester || 'Not set'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="courses"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {profile.user.privacy_settings?.show_courses === false ? (
                                <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-black/20">
                                    <Icon icon="mdi:lock-alert-outline" className="text-6xl text-gray-700 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Restricted Access</h3>
                                    <p className="text-gray-500">This user's course history is classified.</p>
                                </div>
                            ) : profile.enrolledCourses && profile.enrolledCourses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {profile.enrolledCourses.map((uc) => (
                                        <Link to={`/courses/${uc.course_id?._id}`} key={uc._id} className="block group">
                                            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-nexus-green/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all h-full flex flex-col group-hover:-translate-y-1 duration-300">
                                                <div className="relative h-48 overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60" />
                                                    <img
                                                        src={uc.course_id?.thumbnail_url || 'https://placehold.co/600x400/1a1a1a/FFF?text=Mission'}
                                                        alt={uc.course_id?.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                                                        {uc.course_id?.level || 'Unknown Lvl'}
                                                    </div>
                                                </div>

                                                <div className="p-5 flex-1 flex flex-col">
                                                    <p className="text-nexus-green text-[10px] font-black uppercase tracking-widest mb-2">{uc.course_id?.category || 'General'}</p>
                                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-nexus-green transition-colors">
                                                        {uc.course_id?.title}
                                                    </h3>

                                                    <div className="mt-auto pt-4 border-t border-white/5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Progress</span>
                                                            <span className="text-[10px] text-nexus-green font-mono font-bold">{uc.progress || 0}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-nexus-green shadow-[0_0_10px_nexus-green]"
                                                                style={{ width: `${uc.progress || 0}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl bg-black/20">
                                    <Icon icon="mdi:book-off-outline" className="text-5xl mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-bold">No active missions.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
