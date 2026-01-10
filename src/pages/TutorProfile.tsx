import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { FullScreenLoader } from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Course, User } from '../types';
import CourseCard from '../components/course/CourseCard';

interface TutorProfileData {
    tutor: User;
    stats: {
        followers: number;
        courses: number;
    };
    courses: Course[];
    isFollowing: boolean;
    unlockedAvatars?: {
        _id: string;
        avatar_id: {
            _id: string;
            name: string;
            image_url: string;
        };
    }[];
}

export default function TutorProfile() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<TutorProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/social/tutors/${id}`);
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch tutor profile:', error);
            showToast('Failed to load tutor profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!user) {
            showToast('Please login to follow tutors', 'info');
            return;
        }
        if (!profile) return;

        setFollowLoading(true);
        try {
            if (profile.isFollowing) {
                await api.delete(`/social/follow/${id}`);
                setProfile(prev => prev ? ({ ...prev, isFollowing: false, stats: { ...prev.stats, followers: prev.stats.followers - 1 } }) : null);
                showToast('Unfollowed tutor', 'info');
            } else {
                await api.post(`/social/follow/${id}`);
                setProfile(prev => prev ? ({ ...prev, isFollowing: true, stats: { ...prev.stats, followers: prev.stats.followers + 1 } }) : null);
                showToast('Following tutor!', 'success');
            }
        } catch (error) {
            console.error('Follow action failed:', error);
            showToast('Failed to update follow status', 'error');
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return <FullScreenLoader />;
    if (!profile) return <div className="text-white text-center pt-32">Tutor not found</div>;

    return (
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-nexus-green/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
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
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-nexus-green/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left">

                        {/* 3D Flip Avatar - PRESERVED & ENHANCED */}
                        <div className="relative w-40 h-40 group/avatar cursor-pointer shrink-0 perspective-1000">
                            <div className="w-full h-full transition-all duration-700 text-center [transform-style:preserve-3d] group-hover/avatar:[transform:rotateY(180deg)] shadow-[0_0_50px_rgba(34,197,94,0.2)] rounded-full">

                                {/* Front Face: Real Photo */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-[4px] bg-gradient-to-r from-nexus-green via-blue-500 to-purple-500 [backface-visibility:hidden]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-black relative">
                                        <img
                                            src={profile.tutor.tutor_profile_image || profile.tutor.current_avatar_url || `https://ui-avatars.com/api/?name=${profile.tutor.username}`}
                                            alt={profile.tutor.username}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Scanline Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px] mix-blend-overlay opacity-30 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Back Face: Nexon Avatar */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-[4px] bg-gradient-to-r from-purple-500 via-blue-500 to-nexus-green [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-black bg-gradient-to-b from-gray-900 to-black relative flex items-center justify-center">
                                        <div className="absolute inset-0 bg-nexus-green/20 animate-pulse" />
                                        <img
                                            src={profile.tutor.current_avatar_url || `https://ui-avatars.com/api/?name=${profile.tutor.username}`}
                                            alt="Nexon"
                                            className="w-[90%] h-[90%] object-contain relative z-10 drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Level Badge */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-[10px] uppercase font-black text-white px-4 py-1.5 rounded-full border border-nexus-green/50 text-nexus-green backdrop-blur-md whitespace-nowrap z-30 shadow-[0_0_20px_rgba(34,197,94,0.4)] tracking-widest">
                                Lvl {profile.tutor.level || 1}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-5">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center md:justify-start gap-4 tracking-tight">
                                    {profile.tutor.first_name
                                        ? `${profile.tutor.first_name} ${profile.tutor.last_name}`
                                        : profile.tutor.username
                                    }
                                    <Icon icon="mdi:check-decagram" className="text-blue-500 filter drop-shadow-[0_0_10px_#3b82f6]" width="32" />
                                </h1>
                                <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
                                    <p className="text-gray-500 text-sm font-bold tracking-wider uppercase">@{profile.tutor.username}</p>
                                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-700" />
                                    <p className="text-nexus-green text-sm font-bold uppercase tracking-widest bg-nexus-green/10 px-3 py-1 rounded-lg border border-nexus-green/20">
                                        {profile.tutor.expertise || profile.tutor.major || "Expert Instructor"}
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-300 max-w-2xl mx-auto md:mx-0 leading-relaxed text-lg font-light border-l-2 border-white/10 pl-4 md:pl-0 md:border-l-0">
                                {profile.tutor.bio || "No bio available."}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
                                <div className="flex gap-8">
                                    <div className="text-center md:text-left group cursor-default">
                                        <p className="text-3xl font-black text-white group-hover:text-nexus-green transition-colors">{profile.stats.followers}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Followers</p>
                                    </div>
                                    <div className="w-px bg-white/10 h-10" />
                                    <div className="text-center md:text-left group cursor-default">
                                        <p className="text-3xl font-black text-white group-hover:text-nexus-green transition-colors">{profile.stats.courses}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Missions</p>
                                    </div>
                                </div>

                                <div className="flex-1 flex gap-4 w-full sm:w-auto">
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading || (user?._id === profile.tutor._id)}
                                        className={`flex-1 sm:flex-initial px-8 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm
                                            ${profile.isFollowing
                                                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/5'
                                                : 'bg-nexus-green text-black hover:bg-nexus-green/90 shadow-[0_0_25px_rgba(57,255,20,0.3)] hover:shadow-[0_0_35px_rgba(57,255,20,0.5)]'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {followLoading ? (
                                            <Icon icon="mdi:loading" className="animate-spin text-xl" />
                                        ) : profile.isFollowing ? (
                                            <>
                                                <Icon icon="mdi:account-check" className="text-xl" /> Following
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="mdi:account-plus" className="text-xl" /> Follow Protocol
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Nexons Collection */}
                {profile.unlockedAvatars && profile.unlockedAvatars.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm"
                    >
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                            <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Icon icon="mdi:robot-happy" /></span>
                            Unlocks Collection
                        </h2>
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
                    </motion.div>
                )}

                {/* Courses Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <span className="p-2 bg-nexus-green/20 rounded-lg text-nexus-green"><Icon icon="mdi:school" /></span>
                            Active Missions
                        </h2>
                        <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">{profile.courses.length} Deployed</span>
                    </div>

                    {profile.courses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profile.courses.map((course, index) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <CourseCard course={{ ...course, tutor_id: profile.tutor }} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-sm">
                            <Icon icon="mdi:folder-search-outline" className="text-5xl mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-bold">No active missions detected.</p>
                            <p className="text-sm">This instructor hasn't deployed any courses yet.</p>
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
}
