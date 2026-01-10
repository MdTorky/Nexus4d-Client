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
import { motion, AnimatePresence } from 'framer-motion';

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
            const { data } = await api.get(`/courses/${id}/content`);
            setCourse(data.course);
            setChapters(data.chapters || []);
            setEnrollment(data.userProgress);
        } catch (error: any) {
            console.error('Failed to load course:', error);
            if (error.response?.status === 403) {
                showToast('Access Denied. Please enroll first.', 'error');
                navigate(`/courses/${id}`);
            } else {
                showToast('Failed to load course data.', 'error');
                navigate('/courses');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMaterialCompletion = async (materialId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!enrollment) return;

        // Optimistic Update
        const isCompleted = enrollment.completed_material_ids?.includes(materialId);
        const newCompletedIds = isCompleted
            ? enrollment.completed_material_ids?.filter(id => id !== materialId)
            : [...(enrollment.completed_material_ids || []), materialId];

        setEnrollment(prev => prev ? { ...prev, completed_material_ids: newCompletedIds } : null);

        try {
            const { data } = await api.post(`/courses/${id}/materials/${materialId}/toggle`);

            // Sync full state
            setEnrollment(prev => prev ? {
                ...prev,
                progress: data.progress,
                completed_chapter_ids: data.completedChapters,
                status: data.progress === 100 ? 'completed' : (data.progress < 100 && prev.status === 'completed' ? 'active' : prev.status)
            } : null);

        } catch (error) {
            console.error("Failed to toggle completion", error);
            fetchCourse(); // Revert
        }
    };

    if (loading) return <FullScreenLoader />;
    if (!course) return null;

    const currentChapter = chapters[activeChapterIndex];
    const currentMaterial = currentChapter?.materials?.[activeMaterialIndex];
    const progress = enrollment?.progress || 0;

    return (
        <div className="flex h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black overflow-hidden font-sans text-white text-selection-nexus">
            {/* Holographic Sidebar */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 350, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full border-r border-white/5 bg-black/60 backdrop-blur-2xl flex flex-col shrink-0 relative z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
                    >
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Icon icon="mdi:view-list" className="text-nexus-green" />
                                    Mission Logs
                                </h2>
                                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-white transition-colors">
                                    <Icon icon="mdi:close" />
                                </button>
                            </div>

                            {/* Progress Widget */}
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-nexus-green/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mission Progress</span>
                                    <span className="text-lg font-black text-nexus-green">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden relative z-10">
                                    <motion.div
                                        className="h-full bg-nexus-green shadow-[0_0_10px_#22c55e]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Chapter List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {chapters.map((chapter, cIndex) => {
                                const isChapterActive = cIndex === activeChapterIndex;
                                const isChapterCompleted = enrollment?.completed_chapter_ids?.includes(chapter._id);

                                return (
                                    <div key={chapter._id} className="rounded-xl overflow-hidden border border-transparent transition-colors">
                                        <div className={`px-4 py-3 bg-white/5 flex items-center justify-between ${isChapterActive ? 'bg-white/10' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${isChapterCompleted
                                                    ? 'bg-nexus-green text-black border-nexus-green'
                                                    : isChapterActive
                                                        ? 'bg-white text-black border-white'
                                                        : 'bg-transparent text-gray-500 border-gray-700'
                                                    }`}>
                                                    {isChapterCompleted ? <Icon icon="mdi:check" /> : cIndex + 1}
                                                </div>
                                                <h3 className={`text-xs font-bold uppercase tracking-wide ${isChapterActive ? 'text-white' : 'text-gray-400'}`}>
                                                    {chapter.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="space-y-0.5 mt-0.5">
                                            {chapter.materials?.map((material, mIndex) => {
                                                const isActive = cIndex === activeChapterIndex && mIndex === activeMaterialIndex;
                                                const isCompleted = enrollment?.completed_material_ids?.includes(material._id || '');

                                                return (
                                                    <motion.div
                                                        key={mIndex}
                                                        layout
                                                        className={`relative group flex items-center px-4 py-3 cursor-pointer transition-all border-l-2 ${isActive
                                                            ? 'bg-nexus-green/10 border-nexus-green'
                                                            : 'border-transparent hover:bg-white/5 hover:border-white/20'
                                                            }`}
                                                        onClick={() => {
                                                            setActiveChapterIndex(cIndex);
                                                            setActiveMaterialIndex(mIndex);
                                                        }}
                                                    >
                                                        {isActive && (
                                                            <div className="absolute inset-0 bg-gradient-to-r from-nexus-green/10 to-transparent pointer-events-none" />
                                                        )}

                                                        {/* Status Icon */}
                                                        <div className="mr-3 relative z-10">
                                                            <button
                                                                onClick={(e) => material._id && toggleMaterialCompletion(material._id, e)}
                                                                className={`w-4 h-4 rounded flex items-center justify-center transition-all border ${isCompleted
                                                                    ? 'bg-nexus-green border-nexus-green text-black'
                                                                    : 'border-gray-600 hover:border-nexus-green text-transparent'
                                                                    }`}
                                                            >
                                                                <Icon icon="mdi:check" className="text-[10px]" strokeWidth="4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex-1 min-w-0 relative z-10">
                                                            <div className="flex items-center gap-2">
                                                                <Icon
                                                                    icon={material.type === 'video' ? 'mdi:play' : material.type === 'pdf' ? 'mdi:file-pdf' : 'mdi:file-image'}
                                                                    className={`text-sm ${isActive ? 'text-nexus-green' : 'text-gray-500'}`}
                                                                />
                                                                <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                                                    {material.title}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Duration/Type indicator could go here */}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Back to Course */}
                        <div className="p-4 border-t border-white/5 bg-black/40">
                            <Link to={`/courses/${id}`} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-wider">
                                <Icon icon="mdi:arrow-left" /> Abort Mission
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area - "Cinema Mode" */}
            <div className="flex-1 flex flex-col relative z-10">

                {/* HUD Header */}
                <header className="h-16 flex items-center px-6 border-b border-white/5 bg-black/40 backdrop-blur-md justify-between select-none">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 ${sidebarOpen ? 'hidden md:block' : ''}`}
                        >
                            <Icon icon={sidebarOpen ? "mdi:page-layout-sidebar-left" : "mdi:page-layout-sidebar-right"} width="20" />
                        </button>

                        <div className="flex flex-col">
                            <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <span className="text-nexus-green">//</span>
                                {currentMaterial?.title || "Briefing"}
                            </h1>
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tight">
                                {course.title} • TOP SECRET • CH {activeChapterIndex + 1}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* XP Widget */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-nexus-green/10 border border-nexus-green/20">
                            <Icon icon="mdi:star-four-points" className="text-nexus-green text-xs animate-pulse" />
                            <span className="text-xs font-black text-nexus-green tracking-wider">{Math.floor(user?.xp_points || 0)} XP</span>
                        </div>
                    </div>
                </header>

                {/* Content Viewport */}
                <main className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col items-center">

                    <div className="w-full max-w-6xl mx-auto p-6 md:p-10 flex-1 flex flex-col">

                        {currentMaterial ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex-1 flex flex-col gap-8"
                            >
                                {/* Media Container */}
                                <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_0_100px_rgba(34,197,94,0.05)] ring-1 ring-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-t from-nexus-green/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none" />

                                    <div className="aspect-video relative z-10 bg-black">
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
                                </div>

                                {/* Controls & Context Row */}
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left: Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Icon icon="mdi:information-outline" className="text-nexus-green" />
                                                Intel Brief
                                            </h3>
                                            <p className="text-sm text-gray-400 leading-relaxed font-light">
                                                {currentMaterial.description || <span className='text-red-400'>No additional intelligence provided for this mission segment.</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="w-full md:w-80 flex flex-col gap-4">
                                        {/* Mark Complete Action */}
                                        <button
                                            onClick={(e) => currentMaterial._id && toggleMaterialCompletion(currentMaterial._id, e)}
                                            className={`w-full py-4 px-6 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all duration-300 transform group ${enrollment?.completed_material_ids?.includes(currentMaterial._id || '')
                                                ? 'bg-nexus-green text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-nexus-green/50'
                                                }`}
                                        >
                                            <Icon icon={enrollment?.completed_material_ids?.includes(currentMaterial._id || '') ? "mdi:check-all" : "mdi:checkbox-blank-circle-outline"} className="text-lg" />
                                            {enrollment?.completed_material_ids?.includes(currentMaterial._id || '') ? "Objective Complete" : "Mark Complete"}
                                        </button>

                                        {/* Chapter Claim */}
                                        {enrollment?.completed_chapter_ids?.includes(currentChapter._id) &&
                                            !enrollment?.claimed_chapter_ids?.includes(currentChapter._id) && (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="p-1 rounded-xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-500"
                                                >
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { data } = await api.post(`/courses/${id}/chapters/${currentChapter._id}/claim`);
                                                                if (data.success) {
                                                                    showToast(`Mission Accomplished: +${data.claimedXp} XP`, 'success');
                                                                    updateUser({ xp_points: data.newTotalXp, level: data.newLevel, avatar_unlock_tokens: data.newTokens });
                                                                    setEnrollment(prev => prev ? { ...prev, claimed_chapter_ids: [...(prev.claimed_chapter_ids || []), currentChapter._id] } : null);
                                                                    if (data.leveledUp) showToast(`PROMOTION! Level Up!`, 'success');
                                                                }
                                                            } catch (e) { console.error(e); }
                                                        }}
                                                        className="w-full bg-black/90 rounded-lg py-3 px-4 flex items-center justify-between text-yellow-500 hover:text-yellow-400 transition-colors group"
                                                    >
                                                        <span className="text-xs font-black uppercase tracking-wider">Chapter Complete</span>
                                                        <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold">
                                                            <span>Claim Reward</span>
                                                            <Icon icon="mdi:arrow-right" className="group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </button>
                                                </motion.div>
                                            )}

                                        {/* Course Claim */}
                                        {enrollment?.progress === 100 && !enrollment?.is_course_reward_claimed && (
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="p-1 rounded-xl bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-pulse"
                                            >
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const { data } = await api.post(`/courses/${id}/claim-rewards`);
                                                            if (data.success) {
                                                                updateUser({ xp_points: data.newTotalXp, level: data.newLevel, avatar_unlock_tokens: data.newTokens });
                                                                setEnrollment(prev => prev ? { ...prev, is_course_reward_claimed: true } : null);
                                                                setRewardData({ xp: data.claimedXp, avatar: data.rewardAvatar });
                                                                setShowRewardModal(true);
                                                            }
                                                        } catch (e) { console.error(e); }
                                                    }}
                                                    className="w-full bg-black/90 rounded-lg py-4 px-4 flex flex-col items-center justify-center gap-1 text-purple-400 hover:text-white transition-colors"
                                                >
                                                    <Icon icon="mdi:trophy-variant" className="text-2xl mb-1 text-purple-500" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-white">Full Course Completed</span>
                                                    <span className="text-[10px] font-bold text-purple-400">Claim Final Rewards</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 select-none pointer-events-none">
                                <Icon icon="mdi:shield-lock-outline" className="text-6xl text-gray-500 mb-4" />
                                <h2 className="text-2xl font-black uppercase tracking-widest text-gray-600">Secure Channel Closed</h2>
                                <p className="text-sm font-mono text-gray-500 mt-2">Initialize playback from Mission Logs</p>
                            </div>
                        )}

                    </div>

                    {/* Footer / Navigation */}
                    <div className="w-full max-w-6xl mx-auto px-6 pb-6 pt-2 flex items-center justify-between">
                        <button
                            className="group flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                            <Icon icon="mdi:arrow-left" className="text-gray-400 group-hover:text-white transition-colors" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-white hidden sm:block">Previous</span>
                        </button>

                        <button
                            className="group flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-nexus-green/10 hover:border-nexus-green/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-nexus-green hidden sm:block">Next Objective</span>
                            <Icon icon="mdi:arrow-right" className="text-gray-400 group-hover:text-nexus-green transition-colors" />
                        </button>
                    </div>
                </main>
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
