import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
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
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-nexus-card/50 p-8 sm:p-12">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-nexus-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        {/* 3D Flip Avatar */}
                        <div className="relative w-32 h-32 md:w-40 md:h-40 group/avatar cursor-pointer shrink-0 perspective-1000">
                            <div className="w-full h-full transition-all duration-700 text-center [transform-style:preserve-3d] group-hover/avatar:[transform:rotateY(180deg)]">

                                {/* Front Face: Real Photo */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-[3px] bg-gradient-to-r from-nexus-green to-blue-500 [backface-visibility:hidden]">
                                    <img
                                        src={profile.tutor.tutor_profile_image || profile.tutor.current_avatar_url || `https://ui-avatars.com/api/?name=${profile.tutor.username}`}
                                        alt={profile.tutor.username}
                                        className="w-full h-full rounded-full object-cover border-4 border-black bg-black"
                                    />
                                </div>

                                {/* Back Face: Nexon Avatar */}
                                <div className="absolute inset-0 w-full h-full rounded-full p-[3px] bg-gradient-to-r from-blue-500 to-nexus-green [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                    <img
                                        src={profile.tutor.current_avatar_url || `https://ui-avatars.com/api/?name=${profile.tutor.username}`}
                                        alt="Nexon"
                                        className="w-full h-full rounded-full object-contain border-4 border-black bg-gradient-to-b from-gray-800 to-black p-2"
                                    />
                                </div>
                            </div>

                            {/* Level Badge */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/90 text-[10px] uppercase font-bold text-white px-3 py-1 rounded-full border border-nexus-green/30 text-nexus-green backdrop-blur-md whitespace-nowrap z-30 shadow-lg">
                                Lvl {profile.tutor.level || 1}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                                    {profile.tutor.first_name
                                        ? `${profile.tutor.first_name} ${profile.tutor.last_name}`
                                        : profile.tutor.username
                                    }
                                    <Icon icon="mdi:check-decagram" className="text-blue-400" width="24" />
                                </h1>
                                <p className="text-gray-400 text-sm font-medium">@{profile.tutor.username}</p>
                                <p className="text-nexus-green text-lg font-medium mt-1">
                                    {profile.tutor.expertise || profile.tutor.major || "Expert Instructor"}
                                </p>
                            </div>

                            <p className="text-gray-300 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                                {profile.tutor.bio}
                            </p>

                            <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                                <div className="text-center md:text-left">
                                    <p className="text-2xl font-bold text-white">{profile.stats.followers}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">Followers</p>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-center md:text-left">
                                    <p className="text-2xl font-bold text-white">{profile.stats.courses}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">Courses</p>
                                </div>

                                <div className="ml-4">
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading || (user?._id === profile.tutor._id)}
                                        className={`px-8 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${profile.isFollowing
                                            ? 'bg-white/10 text-white hover:bg-white/20'
                                            : 'bg-nexus-green text-black hover:bg-nexus-green/90 shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {followLoading ? (
                                            <Icon icon="mdi:loading" className="animate-spin" />
                                        ) : profile.isFollowing ? (
                                            <>
                                                <Icon icon="mdi:account-check" /> Following
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="mdi:account-plus" /> Follow
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => window.location.href = `/users/${profile.tutor._id}`}
                                className="mt-4 text-sm text-gray-400 hover:text-white underline transition-colors flex items-center gap-1"
                            >
                                View Personal Profile <Icon icon="mdi:arrow-right" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nexons Collection */}
                {profile.unlockedAvatars && profile.unlockedAvatars.length > 0 && (
                    <div className="animate-fade-in-up delay-100">
                        <h2 className="text-2xl font-bold text-nexus-white mb-6 flex items-center gap-2">
                            <Icon icon="mdi:robot-happy" className="text-purple-500" />
                            Nexon Collection
                        </h2>
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
                    </div>
                )}

                {/* Courses Section */}
                <div>
                    <h2 className="text-2xl font-bold text-nexus-white mb-6 flex items-center gap-2">
                        <Icon icon="mdi:school" className="text-nexus-green" />
                        Courses by {profile.tutor.first_name || profile.tutor.username}
                    </h2>

                    {profile.courses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {profile.courses.map((course) => (
                                <CourseCard key={course._id} course={{ ...course, tutor_id: profile.tutor }} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl bg-nexus-card/30">
                            No courses available yet.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
