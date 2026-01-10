import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import { FullScreenLoader } from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NexusPlayer from '../components/course/NexusPlayer';
import NexusViewer from '../components/course/NexusViewer';
import type { Course, Chapter, Enrollment, Avatar } from '../types';
import { RewardModal } from '../components/common/RewardModal';

export default function CoursePlayer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [loading, setLoading] = useState(true);

    // Reward Modal State
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [rewardData, setRewardData] = useState<{ xp: number; avatar: Avatar | null }>({ xp: 0, avatar: null });

    // Player State
    const [activeChapterIndex, setActiveChapterIndex] = useState(0);
    const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            // Use Secure Content Endpoint
            const { data } = await api.get(`/courses/${id}/content`);
            setCourse(data.course); // Backend returns object { course, chapters, userProgress }
            setChapters(data.chapters || []);
            setEnrollment(data.userProgress);
        } catch (error: any) {
            console.error('Failed to load course:', error);
            if (error.response?.status === 403) {
                showToast('You must be enrolled to access this content', 'error');
                navigate(`/courses/${id}`);
            } else {
                showToast('Failed to load course content', 'error');
                navigate('/courses');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMaterialCompletion = async (materialId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking checkbox
        if (!enrollment) return;

        // Optimistic Update (Material IDs only)
        const isCompleted = enrollment.completed_material_ids?.includes(materialId);
        const newCompletedIds = isCompleted
            ? enrollment.completed_material_ids?.filter(id => id !== materialId)
            : [...(enrollment.completed_material_ids || []), materialId];

        // Partially update state optimistically
        setEnrollment(prev => prev ? { ...prev, completed_material_ids: newCompletedIds } : null);

        try {
            const { data } = await api.post(`/courses/${id}/materials/${materialId}/toggle`);

            // Sync full state from server response (Progress & Completed Chapters)
            setEnrollment(prev => prev ? {
                ...prev,
                progress: data.progress,
                completed_chapter_ids: data.completedChapters,
                status: data.progress === 100 ? 'completed' : (data.progress < 100 && prev.status === 'completed' ? 'active' : prev.status)
            } : null);

        } catch (error) {
            console.error("Failed to toggle completion", error);
            // Revert on failure
            fetchCourse();
        }
    };

    if (loading) return <FullScreenLoader />;
    if (!course) return null;

    const currentChapter = chapters[activeChapterIndex];
    const currentMaterial = currentChapter?.materials?.[activeMaterialIndex];
    const progress = enrollment?.progress || 0;

    return (
        <div className="flex h-screen bg-nexus-black overflow-hidden font-sans text-white">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col shrink-0 relative`}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <div>
                        <h2 className="text-white font-bold text-lg tracking-tight">Course Content</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-nexus-green transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs text-nexus-green font-mono">{progress}%</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <Icon icon="mdi:close" width="24" />
                    </button>
                </div>

                {/* Chapter List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {chapters.map((chapter, cIndex) => (
                        <div key={chapter._id} className="border-b border-white/5 last:border-0">
                            <div className="px-6 py-4 bg-white/5">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Chapter {cIndex + 1}
                                </h3>
                                <p className="text-sm font-semibold text-gray-200">{chapter.title}</p>
                            </div>

                            <div className="py-2">
                                {chapter.materials?.map((material, mIndex) => {
                                    const isActive = cIndex === activeChapterIndex && mIndex === activeMaterialIndex;
                                    const isCompleted = enrollment?.completed_material_ids?.includes(material._id || '');

                                    return (
                                        <div
                                            key={mIndex}
                                            className={`relative group flex items-center px-6 py-3 cursor-pointer transition-colors ${isActive ? 'bg-nexus-green/10 border-r-2 border-nexus-green' : 'hover:bg-white/5'
                                                }`}
                                            onClick={() => {
                                                setActiveChapterIndex(cIndex);
                                                setActiveMaterialIndex(mIndex);
                                            }}
                                        >
                                            {/* Checkbox */}
                                            <button
                                                onClick={(e) => material._id && toggleMaterialCompletion(material._id, e)}
                                                className={`mr-4 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${isCompleted
                                                    ? 'bg-nexus-green border-nexus-green text-black'
                                                    : 'border-gray-600 hover:border-nexus-green text-transparent'
                                                    }`}
                                            >
                                                <Icon icon="mdi:check" width="14" strokeWidth="3" />
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Icon
                                                        icon={material.type === 'video' ? 'mdi:play-circle-outline' : 'mdi:file-document-outline'}
                                                        className={isActive ? 'text-nexus-green' : 'text-gray-500'}
                                                        width="16"
                                                    />
                                                    <span className={`truncate ${isActive ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                        {material.title}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!chapter.materials || chapter.materials.length === 0) && (
                                    <p className="text-xs text-gray-600 px-6 py-2 italic">No materials yet</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Back to Course */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <Link to={`/courses/${id}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                        <Icon icon="mdi:arrow-left" /> Back to Course Info
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 to-black">

                {/* Header */}
                <div className="h-20 flex items-center px-8 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`mr-6 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 ${sidebarOpen ? 'hidden md:block' : ''}`}
                    >
                        <Icon icon={sidebarOpen ? "mdi:menu-open" : "mdi:menu"} width="24" />
                    </button>

                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            {currentMaterial?.title || course.title}
                            {enrollment?.completed_material_ids?.includes(currentMaterial?._id || '') && (
                                <span className="px-2 py-0.5 bg-nexus-green/20 text-nexus-green text-xs rounded-full border border-nexus-green/30 font-mono uppercase tracking-wider">
                                    Completed
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {course.title} <span className="mx-2 text-gray-600">/</span> Chapter {activeChapterIndex + 1}
                        </p>
                    </div>

                    {/* XP / Gamification Widget */}
                    <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm flex items-center gap-3">
                        <div className="p-1.5 bg-nexus-green/20 rounded-full text-nexus-green">
                            <Icon icon="mdi:star-four-points" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total XP</p>
                            <p className="text-sm font-bold text-white leading-none">{Math.floor(user?.xp_points || 0)}</p>
                        </div>
                    </div>
                </div>


                {/* Content Area */}
                <div className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                    <div className="max-w-6xl mx-auto p-8">

                        {currentMaterial ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Viewer Container */}
                                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-0">
                                    {currentMaterial.type === 'video' ? (
                                        <NexusPlayer
                                            src={currentMaterial.url}
                                            poster={course.thumbnail_url}
                                            autoPlay={false}
                                        />
                                    ) : (
                                        <NexusViewer
                                            type={currentMaterial.type}
                                            url={currentMaterial.url}
                                            title={currentMaterial.title}
                                        />
                                    )}
                                </div>
                                <div className="flex gap-4 mb-10 w-full justify-evenly">
                                    {enrollment?.completed_chapter_ids?.includes(currentChapter._id) &&
                                        !enrollment?.claimed_chapter_ids?.includes(currentChapter._id) && (
                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 animate-pulse flex-1">
                                                <h4 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
                                                    <Icon icon="mdi:trophy" /> Chapter Completed!
                                                </h4>
                                                <p className="text-sm text-gray-300 mb-4">
                                                    You've finished this chapter. Claim your XP reward now!
                                                </p>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const { data } = await api.post(`/courses/${id}/chapters/${currentChapter._id}/claim`);
                                                            if (data.success) {
                                                                showToast(`Claimed ${data.claimedXp} XP!`, 'success');

                                                                // Sync XP and Level
                                                                updateUser({
                                                                    xp_points: data.newTotalXp,
                                                                    level: data.newLevel,
                                                                    avatar_unlock_tokens: data.newTokens
                                                                });

                                                                // Update local state for claimed rewards
                                                                setEnrollment(prev => prev ? {
                                                                    ...prev,
                                                                    claimed_chapter_ids: [...(prev.claimed_chapter_ids || []), currentChapter._id]
                                                                } : null);

                                                                if (data.leveledUp) {
                                                                    showToast(`Level Up! Earned ${data.tokensEarned} Token(s)`, 'success');
                                                                }
                                                            }
                                                        } catch (e) {
                                                            console.error(e);
                                                            showToast('Failed to claim reward', 'error');
                                                        }
                                                    }}
                                                    className="w-full py-2 px-4 rounded-lg font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Icon icon="mdi:hand-coin" /> Claim {currentChapter.xp_reward} XP
                                                </button>
                                            </div>
                                        )}

                                    {enrollment?.progress === 100 && !enrollment?.is_course_reward_claimed && (
                                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 animate-pulse flex-1">
                                            <h4 className="font-bold text-purple-500 mb-2 flex items-center gap-2">
                                                <Icon icon="mdi:crown" /> Course Completed!
                                            </h4>
                                            <p className="text-sm text-gray-300 mb-4">
                                                Congratulations! Claim your course completion rewards (XP & Avatar).
                                            </p>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const { data } = await api.post(`/courses/${id}/claim-rewards`);
                                                        if (data.success) {
                                                            // Update global user state (XP & Level)
                                                            updateUser({
                                                                xp_points: data.newTotalXp,
                                                                level: data.newLevel,
                                                                avatar_unlock_tokens: data.newTokens
                                                            });

                                                            setEnrollment(prev => prev ? { ...prev, is_course_reward_claimed: true } : null);

                                                            // Show Reward Modal
                                                            setRewardData({ xp: data.claimedXp, avatar: data.rewardAvatar });
                                                            setShowRewardModal(true);

                                                            if (data.leveledUp) {
                                                                showToast(`Level Up! Earned ${data.tokensEarned} Token(s)`, 'success');
                                                            }
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                        showToast('Failed to claim rewards', 'error');
                                                    }
                                                }}
                                                className="w-full py-3 px-4 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                            >
                                                <Icon icon="mdi:gift" /> Claim Rewards
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Description / Context */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <Icon icon="mdi:text-box-outline" className="text-nexus-green" />
                                                About this lesson
                                            </h3>
                                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {currentMaterial.description || "No description provided for this lesson."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Card */}
                                    <div className="lg:col-span-1 space-y-4">
                                        <div className="bg-nexus-green/5 border border-nexus-green/20 rounded-2xl p-6 sticky top-8 z-10">
                                            <h4 className="font-bold text-white mb-4">Lesson Actions</h4>

                                            <button
                                                onClick={(e) => currentMaterial._id && toggleMaterialCompletion(currentMaterial._id, e)}
                                                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${enrollment?.completed_material_ids?.includes(currentMaterial._id || '')
                                                    ? 'bg-nexus-green text-black hover:bg-white'
                                                    : 'bg-white/10 text-white hover:bg-nexus-green hover:text-black'
                                                    }`}
                                            >
                                                {enrollment?.completed_material_ids?.includes(currentMaterial._id || '') ? (
                                                    <>
                                                        <Icon icon="mdi:check-circle" className="text-xl" /> Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        <Icon icon="mdi:circle-outline" className="text-xl" /> Mark as Done
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-xs text-center text-gray-500 mt-3">
                                                Completing this lesson contributes to your course progress and XP.
                                            </p>
                                        </div>

                                        {/* CXP Claim Reward UI */}


                                        {/* Course Completion Claim */}

                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-60">
                                <Icon icon="mdi:play-box-outline" width="80" className="mb-4" />
                                <p className="text-xl font-light">Select a lesson from the sidebar to start</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="h-20 border-t border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between px-8 z-10">
                    <button
                        className="flex items-center gap-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
                        disabled={activeChapterIndex === 0 && activeMaterialIndex === 0}
                        onClick={() => {
                            if (activeMaterialIndex > 0) {
                                setActiveMaterialIndex(prev => prev - 1);
                            } else if (activeChapterIndex > 0) {
                                setActiveChapterIndex(prev => prev - 1);
                                setActiveMaterialIndex(chapters[activeChapterIndex - 1].materials?.length ? chapters[activeChapterIndex - 1].materials!.length - 1 : 0);
                            }
                        }}
                    >
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-nexus-green/20 transition-colors">
                            <Icon icon="mdi:chevron-left" width="24" className="text-white" />
                        </div>
                        <span className="font-medium hidden sm:block">Previous Lesson</span>
                    </button>

                    <button
                        className="flex items-center gap-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
                        disabled={
                            activeChapterIndex === chapters.length - 1 &&
                            activeMaterialIndex === (chapters[activeChapterIndex].materials?.length || 0) - 1
                        }
                        onClick={() => {
                            const currentChap = chapters[activeChapterIndex];
                            if (currentChap.materials && activeMaterialIndex < currentChap.materials.length - 1) {
                                setActiveMaterialIndex(prev => prev + 1);
                            } else if (activeChapterIndex < chapters.length - 1) {
                                setActiveChapterIndex(prev => prev + 1);
                                setActiveMaterialIndex(0);
                            }
                        }}
                    >
                        <span className="font-medium hidden sm:block">Next Lesson</span>
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-nexus-green/20 transition-colors">
                            <Icon icon="mdi:chevron-right" width="24" className="text-white" />
                        </div>
                    </button>
                </div>
            </div>

            <RewardModal
                isOpen={showRewardModal}
                onClose={() => setShowRewardModal(false)}
                xpEarned={rewardData.xp}
                avatar={rewardData.avatar}
            />
        </div>
    );
}
