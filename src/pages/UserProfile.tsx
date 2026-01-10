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
    enrolledCourses?: any[]; // Full population is complex, simplifing for display
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
    if (!profile) return <div className="min-h-screen bg-nexus-black pt-24 text-center text-white">User not found</div>;

    const isMe = currentUser?._id === profile.user._id;

    return (
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-nexus-card/50 p-8 sm:p-12 mb-8">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="relative w-40 h-40 mb-6 group cursor-pointer perspective-1000">
                            <div className="w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                                {/* Front */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-1 bg-gradient-to-r from-nexus-green to-blue-500 [backface-visibility:hidden]">
                                    <img
                                        src={profile.user.current_avatar_url || `https://ui-avatars.com/api/?name=${profile.user.username}`}
                                        alt={profile.user.username}
                                        className="p-3 w-full h-full rounded-full object-cover border-4 border-black bg-black"
                                    />
                                </div>
                                {/* Back (Rank/Level) */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-1 bg-gradient-to-r from-blue-500 to-nexus-green [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center bg-black">
                                    <div className="w-full h-full rounded-full bg-black border-4 border-black flex flex-col items-center justify-center text-white">
                                        <span className="text-3xl font-bold">{profile.user.level || 1}</span>
                                        <span className="text-[10px] uppercase text-gray-400">Level</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/90 text-sm uppercase font-bold text-white px-4 py-1.5 rounded-full border border-nexus-green/30 text-nexus-green backdrop-blur-md whitespace-nowrap z-30 shadow-lg">
                                Lvl {profile.user.level || 0}
                            </div>
                        </div>

                        {/* Name & Role */}
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {profile.user.first_name || profile.user.username} {profile.user.last_name}
                        </h1>
                        <p className="text-gray-400 font-medium text-lg mb-6">@{profile.user.username} • <span className='capitalize'>{profile.user.role}</span></p>

                        {/* Bio */}
                        {profile.user.bio && (
                            <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed italic">
                                "{profile.user.bio}"
                            </p>
                        )}

                        {/* Action Buttons */}
                        {!isMe && (
                            <div className="flex gap-4">
                                {profile.friendStatus === 'none' && (
                                    <button
                                        onClick={() => handleFriendAction('add')}
                                        disabled={actionLoading}
                                        className="bg-nexus-green text-black px-8 py-2.5 rounded-full font-bold hover:bg-nexus-green/90 transition-all flex items-center gap-2"
                                    >
                                        {actionLoading ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:account-plus" />}
                                        Add Friend
                                    </button>
                                )}

                                {profile.friendStatus === 'pending_outgoing' && (
                                    <button
                                        onClick={() => handleFriendAction('cancel')}
                                        disabled={actionLoading}
                                        className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-8 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-yellow-500/20 transition-all"
                                    >
                                        {actionLoading ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:close" />}
                                        Cancel Request
                                    </button>
                                )}

                                {profile.friendStatus === 'pending_incoming' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleFriendAction('accept')}
                                            disabled={actionLoading}
                                            className="bg-nexus-green text-black px-6 py-2.5 rounded-full font-bold hover:bg-nexus-green/90 transition-all flex items-center gap-2"
                                        >
                                            {actionLoading ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:check" />}
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleFriendAction('cancel')}
                                            disabled={actionLoading}
                                            className="bg-red-500/10 text-red-500 border border-red-500/30 px-6 py-2.5 rounded-full font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
                                        >
                                            <Icon icon="mdi:close" />
                                            Decline
                                        </button>
                                    </div>
                                )}

                                {profile.friendStatus === 'accepted' && (
                                    <button
                                        className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-8 py-2.5 rounded-full font-bold flex items-center gap-2 cursor-default"
                                    >
                                        <Icon icon="mdi:check" /> Friends
                                    </button>
                                )}
                            </div>
                        )}

                        {profile.user.role === 'tutor' && (
                            <div className="mt-6">
                                <button
                                    onClick={() => window.location.href = `/tutors/${profile.user._id}`}
                                    className="px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full font-bold hover:bg-blue-600/30 transition-all flex items-center gap-2 mx-auto"
                                >
                                    <Icon icon="mdi:school" />
                                    View Tutor Profile
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tab Stats */}
                    <div className="flex justify-center mt-12 border-t border-white/10 pt-8 gap-12">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{profile.enrolledCourses?.length || 0}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Enrolled</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{profile.completedCourses?.length || 0}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{profile.unlockedAvatars?.length || 0}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Nexons</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <div className="mb-8 border-b border-white/10">
                    <div className="flex gap-8">
                        {['overview', 'courses'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === tab ? 'text-nexus-green' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab === 'overview' ? 'Overview & Nexons' : 'Enrolled Courses'}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabProfile"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-nexus-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Nexon Collection */}
                            <div className="bg-nexus-card/30 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Icon icon="mdi:robot-happy" className="text-purple-500" />
                                    Nexon Collection
                                </h3>

                                {profile.unlockedAvatars && profile.unlockedAvatars.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                        {profile.unlockedAvatars.map((ua) => (
                                            <div key={ua._id} className="group relative aspect-square bg-nexus-card/50 rounded-xl p-2 border border-white/10 hover:border-purple-500/50 transition-all flex items-center justify-center">
                                                <img
                                                    src={ua.avatar_id?.image_url}
                                                    alt={ua.avatar_id?.name}
                                                    className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur text-center text-[10px] py-1 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl">
                                                    {ua.avatar_id?.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        {profile.user.privacy_settings?.show_nexons === false ? (
                                            <div className="flex flex-col items-center">
                                                <Icon icon="mdi:lock" className="text-3xl text-gray-600 mb-2" />
                                                <p className="text-gray-400">This collection is kept private.</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No unlocked Nexons yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Achievements */}
                                <div className="bg-nexus-card/30 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:trophy-outline" className="text-yellow-500" />
                                        Achievements
                                    </h3>
                                    {profile.completedCourses && profile.completedCourses.length > 0 ? (
                                        <div className="space-y-3">
                                            {profile.completedCourses.map((uc) => (
                                                <div key={uc._id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                                        <Icon icon="mdi:medal" className="text-xl" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">Course Completed</h4>
                                                        <p className="text-xs text-gray-400">{uc.course_id?.title}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        profile.user.privacy_settings?.show_courses === false ? (
                                            <p className="text-gray-500 text-center py-8">Achievements are private.</p>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">No public achievements yet.</p>
                                        )
                                    )}
                                </div>

                                {/* Academic Info */}
                                <div className="bg-nexus-card/30 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:school-outline" className="text-blue-500" />
                                        Academic Info
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-gray-400">Major</span>
                                            <span className="text-white font-medium">{profile.user.major || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-gray-400">Semester</span>
                                            <span className="text-white font-medium">{profile.user.semester || 'Not set'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'courses' && (
                        <motion.div
                            key="courses"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Icon icon="mdi:book-open-page-variant" className="text-nexus-green" />
                                Enrolled Courses
                            </h2>

                            {profile.enrolledCourses && profile.enrolledCourses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Simplified Course Cards for User Profile */}
                                    {profile.enrolledCourses.map((uc) => (
                                        <Link to={`/courses/${uc.course_id?._id}`} key={uc._id} className="block group">
                                            <div className="bg-nexus-card/50 border border-white/10 rounded-2xl overflow-hidden hover:border-nexus-green/30 transition-all h-full flex flex-col">
                                                <div className="relative h-40 overflow-hidden">
                                                    <img
                                                        src={uc.course_id?.thumbnail_url || 'https://placehold.co/600x400/1a1a1a/FFF?text=Course'}
                                                        alt={uc.course_id?.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-white text-xs px-2 py-1 rounded-md border border-white/10">
                                                        {uc.course_id?.level || 'All Levels'}
                                                    </div>
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <p className="text-nexus-green text-xs font-bold uppercase tracking-wider mb-2">{uc.course_id?.category || 'General'}</p>
                                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{uc.course_id?.title}</h3>

                                                    <div className="mt-auto flex items-center gap-2 pt-4 border-t border-white/5">
                                                        <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                            {/* We might not have tutor avatar here depending on populate depth, use fallback */}
                                                            <div className="w-full h-full bg-gray-600" />
                                                        </div>
                                                        <p className="text-xs text-gray-400">
                                                            {uc.course_id?.tutor_id?.first_name
                                                                ? `${uc.course_id?.tutor_id?.first_name} ${uc.course_id?.tutor_id?.last_name || ''}`
                                                                : (uc.course_id?.tutor_id?.username || 'Instructor')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="bg-black/50 p-3 flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-nexus-green rounded-full"
                                                            style={{ width: `${uc.progress || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-white font-mono">{uc.progress || 0}%</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-nexus-card/30 rounded-2xl border border-white/5">
                                    {profile.user.privacy_settings?.show_courses === false ? (
                                        <>
                                            <Icon icon="mdi:lock" className="text-4xl text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-400">Enrolled courses are kept private.</p>
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:book-off-outline" className="text-4xl text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-400">Not enrolled in any courses yet.</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
