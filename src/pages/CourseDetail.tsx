import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import type { Course, Enrollment } from '../types';
import { FullScreenLoader } from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<'basic' | 'advanced' | 'premium'>('basic');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    const TIER_LEVELS = { basic: 1, advanced: 2, premium: 3 };

    const getUpgradeDetails = (targetPkg: 'basic' | 'advanced' | 'premium') => {
        if (!course) return { price: 0, isUpgrade: false, originalPrice: 0, paid: 0 };

        const status = enrollment?.status?.toLowerCase();
        const isActive = enrollment?.isEnrolled && status !== 'pending' && status !== 'rejected';

        // No upgrade calc if not active
        if (!isActive) return { price: course.packages[targetPkg].price, isUpgrade: false, originalPrice: 0, paid: 0 };

        const currentPkgName = (enrollment?.package || 'basic').toLowerCase();
        const currentLevel = TIER_LEVELS[currentPkgName as keyof typeof TIER_LEVELS] || 0;
        const targetLevel = TIER_LEVELS[targetPkg];

        // Only upgrade if target > current
        if (targetLevel <= currentLevel) return { price: course.packages[targetPkg].price, isUpgrade: false, originalPrice: 0, paid: 0 };

        // Calculate
        const currentPkgPrice = course.packages[currentPkgName as keyof typeof course.packages]?.price || 0;
        const effectivePaid = (enrollment?.amount_paid && enrollment.amount_paid > 0) ? enrollment.amount_paid : currentPkgPrice;

        const upgradePrice = Math.max(0, course.packages[targetPkg].price - effectivePaid);

        return {
            price: upgradePrice,
            isUpgrade: true,
            originalPrice: course.packages[targetPkg].price,
            paid: effectivePaid
        };
    };

    const isUpgradeable = (currentPkg: string | undefined, targetPkg: string) => {
        if (!currentPkg) return true; // Not enrolled, can pick any
        const currentLevel = TIER_LEVELS[currentPkg as keyof typeof TIER_LEVELS] || 0;
        const targetLevel = TIER_LEVELS[targetPkg as keyof typeof TIER_LEVELS] || 0;
        return targetLevel > currentLevel;
    };

    useEffect(() => {
        fetchCourseAndEnrollment();
    }, [id, user]);

    // Auto-select next tier if enrolled
    useEffect(() => {
        if (enrollment?.isEnrolled && enrollment.package) {
            if (enrollment.package === 'basic') setSelectedPackage('advanced');
            else if (enrollment.package === 'advanced') setSelectedPackage('premium');
            else if (enrollment.package === 'premium') setSelectedPackage('premium');
        }
    }, [enrollment]);

    const fetchCourseAndEnrollment = async () => {
        try {
            const [courseRes, enrollmentRes] = await Promise.all([
                api.get(`/courses/${id}`),
                user ? api.get(`/courses/${id}/enrollment`).catch(() => ({ data: { isEnrolled: false } })) : Promise.resolve({ data: { isEnrolled: false } })
            ]);

            setCourse(courseRes.data);

            // Fix: The backend returns { isEnrolled, enrollment: object }. 
            // We need to set the state to the actual enrollment object if it exists.
            const enrollmentData = enrollmentRes.data;
            if (enrollmentData && enrollmentData.enrollment) {
                setEnrollment({ ...enrollmentData.enrollment, isEnrolled: true });
            } else {
                // Reset to null or object with isEnrolled: false
                setEnrollment({ isEnrolled: false, amount_paid: 0 } as any);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            showToast('Failed to load course details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = () => {
        if (!user) {
            showToast('Please login to enroll', 'info');
            return;
        }
        setShowPaymentModal(true);
        setReceiptFile(null); // Reset file
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const confirmPayment = async () => {
        if (!receiptFile) {
            showToast('Please upload your payment receipt', 'warning');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('receipt', receiptFile);
            formData.append('package', selectedPackage);

            await api.post(`/courses/${id}/enroll`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast(`Successfully enrolled in ${selectedPackage} package!`, 'success');
            // Refresh enrollment status
            const { data } = await api.get(`/courses/${id}/enrollment`);
            setEnrollment(data);
            setShowPaymentModal(false); // Close modal
        } catch (error) {
            console.error('Enrollment failed:', error);
            showToast('Failed to enroll. Please try again.', 'error');
        }
    };

    if (loading) return <FullScreenLoader />;
    if (!course) return <div className="text-white text-center pt-32">Course not found</div>;



    return (
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12 relative">
            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-nexus-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <Icon icon="mdi:close" width="24" />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Icon icon="mdi:secure" className="text-nexus-green" />
                                Secure Checkout
                            </h2>

                            {/* Order Summary */}
                            <div className="bg-white/5 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Course</span>
                                    <span className="text-white font-medium text-right line-clamp-1 w-1/2">{course.title}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Package</span>
                                    <span className="text-white font-medium capitalize">{selectedPackage}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-400">
                                        {(() => {
                                            const { isUpgrade, originalPrice, paid } = getUpgradeDetails(selectedPackage);
                                            return (
                                                <>
                                                    {isUpgrade ? "Upgrade Cost" : "Total Price"}
                                                    {isUpgrade && (
                                                        <span className="block text-[10px] text-gray-500 font-normal">
                                                            (Original: {originalPrice} - Paid: {paid})
                                                        </span>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </span>
                                    <span className="text-2xl font-bold text-white">
                                        RM {getUpgradeDetails(selectedPackage).price}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method Details */}
                            <div className="space-y-4 mb-6">
                                <p className="text-sm font-bold text-white uppercase tracking-wider">Payment Method: Bank Transfer / DuitNow</p>
                                <div className="bg-black/40 border border-white/10 p-3 rounded-lg flex items-center gap-3">
                                    <Icon icon="mdi:bank" className="text-gray-400 text-2xl" />
                                    <div>
                                        <div className="text-xs text-gray-400">Bank Name</div>
                                        <div className="text-sm text-white font-bold">RHB</div>
                                    </div>
                                </div>
                                <div className="bg-black/40 border border-white/10 p-3 rounded-lg flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Icon icon="mdi:card-account-details" className="text-gray-400 text-2xl" />
                                        <div>
                                            <div className="text-xs text-gray-400">Account Number</div>
                                            <div className="text-sm text-white font-bold font-mono">{import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '1140 5555 8888'}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '1140 5555 8888');
                                            showToast('Account number copied!', 'success');
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                        title="Copy Account Number"
                                    >
                                        <Icon icon="mdi:content-copy" className="text-gray-400 group-hover:text-white transition-colors" />
                                    </button>
                                </div>
                                <div className="bg-black/40 border border-white/10 p-3 rounded-lg flex items-center justify-between gap-3">
                                    <img src='/Payment QR.PNG' className='w-full' />
                                </div>
                            </div>



                            {/* Upload Receipt */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-white mb-2">Upload Payment Receipt</label>
                                <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-nexus-green/50 transition-colors group cursor-pointer bg-white/5">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {receiptFile ? (
                                        <div className="flex items-center justify-center gap-2 text-nexus-green font-medium">
                                            <Icon icon="mdi:check-circle" />
                                            <span className="truncate max-w-[200px]">{receiptFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-white">
                                            <Icon icon="mdi:cloud-upload-outline" className="text-3xl" />
                                            <span className="text-xs">Click or drag receipt here</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={confirmPayment}
                                disabled={!receiptFile}
                                className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${receiptFile
                                    ? 'bg-nexus-green text-black hover:bg-white'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Icon icon="mdi:check-decagram" width="24" />
                                Confirm Payment
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                By confirming, your access will be activated after payment confirmation.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Info & Syllabus */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div>
                        <span className={`${course.status === 'ongoing' ? 'bg-orange-500/10 text-orange-500' : 'bg-nexus-green/10 text-nexus-green'} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-nexus-green/20`}>
                            {course.status}
                        </span>
                        <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                        <p className="text-gray-300 text-lg leading-relaxed">{course.description}</p>
                    </div>

                    {/* Stats */}
                    {/* Enhanced Tutor Card & Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-nexus-card/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-nexus-green/30 transition-colors duration-500"
                    >
                        {/* "Nexus" Style Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-nexus-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-nexus-green/10 transition-all duration-700" />

                        <div className="flex flex-col sm:flex-row items-center md:gap-8 gap-4 relative z-10 ">

                            {/* 3D Flip Avatar */}
                            <Link to={`/tutors/${course.tutor_id?._id}`} className="relative w-24 h-24 group/avatar cursor-pointer shrink-0 perspective-1000 group-hover:w-50 group-hover:h-50 transition-all duration-700">
                                <div className="w-full h-full transition-all duration-700 text-center [transform-style:preserve-3d] group-hover/avatar:[transform:rotateY(180deg)] ">

                                    {/* Front Face: Real Photo */}
                                    <div className="absolute inset-0 w-full h-full rounded-full p-[2px] bg-gradient-to-r from-nexus-green to-blue-500 [backface-visibility:hidden]">
                                        <img
                                            src={course.tutor_id?.tutor_profile_image || course.tutor_id?.current_avatar_url || `https://ui-avatars.com/api/?name=${course.tutor_id?.username}`}
                                            alt={course.tutor_id?.username}
                                            className="w-full h-full rounded-full object-cover border-2 border-black bg-black"
                                        />
                                    </div>

                                    {/* Back Face: Nexon Avatar */}
                                    <div className="absolute inset-0 w-full h-full rounded-full p-[2px] bg-gradient-to-r from-blue-500 to-nexus-green [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                        <img
                                            src={course.tutor_id?.current_avatar_url || `https://ui-avatars.com/api/?name=${course.tutor_id?.username}`}
                                            alt="Nexon"
                                            className="w-full h-full rounded-full object-contain border-2 border-black bg-gradient-to-b from-gray-800 to-black p-2"
                                        />
                                    </div>
                                </div>
                            </Link>

                            {/* Info */}
                            <div className="flex-1 space-y-3 text-center sm:text-left">
                                <div>
                                    <Link to={`/tutors/${course.tutor_id?._id}`} className="inline-block hover:opacity-80 transition-opacity">
                                        <h3 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2 group-hover:text-nexus-green group-hover:scale-110 transition-all duration-300">
                                            {course.tutor_id?.first_name
                                                ? `${course.tutor_id.first_name} ${course.tutor_id.last_name}`
                                                : course.tutor_id?.username
                                            }
                                            <Icon icon="mdi:check-decagram" className="text-blue-400" width="20" />
                                        </h3>
                                    </Link>
                                    <p className="text-nexus-green font-medium tracking-wide text-sm mt-1">
                                        {course.tutor_id?.expertise || course.tutor_id?.major || "Expert Instructor"}
                                    </p>
                                </div>

                                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto sm:mx-0">
                                    {course.tutor_id?.bio || "Passionate about teaching and helping students achieve their academic goals."}
                                </p>
                            </div>

                            {/* Minimal Stats */}
                            <div className="flex flex-row sm:flex-col gap-6 sm:gap-6 sm:border-l border-white/10 sm:pl-8 justify-center w-full sm:w-auto mt-6 sm:mt-0 min-w-[120px]">
                                {/* Level */}
                                <div className="text-center sm:text-left group/stat">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-hover/stat:text-nexus-green transition-colors">Level</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <Icon icon="mdi:stairs-up" className="text-gray-600 group-hover/stat:text-white transition-colors" width="18" />
                                        <p className="text-white font-bold capitalize">{course.level}</p>
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="text-center sm:text-left group/stat">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-hover/stat:text-nexus-green transition-colors">Duration</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <Icon icon="mdi:clock-outline" className="text-gray-600 group-hover/stat:text-white transition-colors" width="18" />
                                        <p className="text-white font-bold">{course.total_duration || 'Unknown'}</p>
                                    </div>
                                </div>

                                {/* Chapters */}
                                <div className="text-center sm:text-left group/stat">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-hover/stat:text-nexus-green transition-colors">Chapters</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <Icon icon="mdi:book-open-page-variant" className="text-gray-600 group-hover/stat:text-white transition-colors" width="18" />

                                        <p className="text-white font-bold">{course.total_chapters}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    {/* Nexon Reward Display - "Fancy & No Container" Style */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center justify-center py-8 relative group"
                    >
                        {/* Glowing Background Effect */}
                        <div className="absolute inset-0 bg-nexus-green/5 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

                        <div className="flex w-full flex-col md:flex-row  items-center justify-evenly z-10 text-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="mb-4 relative"
                            >
                                {/* Display Avatar Image if available, otherwise fallback to Icon */}
                                {course.reward_avatar_id && typeof course.reward_avatar_id !== 'string' ? (
                                    <div className="relative inline-block group/avatar">
                                        <div className="absolute inset-0 bg-nexus-green/30 blur-xl rounded-full animate-pulse" />
                                        <img
                                            src={(course.reward_avatar_id as any).image_url}
                                            alt={(course.reward_avatar_id as any).name}
                                            className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.5)] relative z-10 transform transition-transform group-hover/avatar:scale-110 duration-500"
                                        />
                                        {/* <div className="absolute -bottom-3 -right-3 bg-nexus-green text-black text-[10px] font-bold px-3 py-1 rounded-full border-2 border-black shadow-lg uppercase tracking-wide">
                                            {(course.reward_avatar_id as any).type || 'REWARD'}
                                        </div> */}
                                    </div>
                                ) : (
                                    // Fallback only if no avatar linked (should not happen if every course has one)
                                    <div className="relative inline-block">
                                        <Icon icon="mdi:help-rhombus" className="text-gray-600 text-6xl opacity-50" />
                                    </div>
                                )}
                            </motion.div>

                            <div>
                                {course.reward_avatar_id && typeof course.reward_avatar_id !== 'string' && (
                                    <h3 className="text-center text-3xl font-black italic  text-white uppercase mb-1 flex flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-gray-500 tracking-[0.2em] not-italic mb-1">Course Completion Reward</span>
                                        <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                            {(course.reward_avatar_id as any).name} Nexon
                                        </span>
                                    </h3>
                                )}

                                <div className="mt-4 flex items-center justify-center gap-2 bg-nexus-green/10 px-5 py-2 rounded-full border border-nexus-green/20 backdrop-blur-md">
                                    <Icon icon="mdi:star-four-points" className="text-nexus-green animate-spin-slow" width="16" />
                                    <span className="text-lg font-bold text-nexus-green">
                                        +{course.completion_xp_bonus} XP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Syllabus */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Course Syllabus</h2>
                        <div className="space-y-4">
                            {course.chapters?.map((chapter) => (
                                <div key={chapter._id} className="bg-nexus-card/50 border border-white/5 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-800 w-8 h-8 flex items-center justify-center rounded-full text-sm font-mono text-gray-400">
                                                {chapter.position}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{chapter.title}</h4>
                                                <p className="text-xs text-gray-500">{chapter.materials.length} Lessons • {chapter.xp_reward} XP</p>
                                            </div>
                                        </div>
                                        <Icon icon={expandedChapter === chapter._id ? "mdi:chevron-up" : "mdi:chevron-down"} className="text-gray-400" />
                                    </button>

                                    <AnimatePresence>
                                        {expandedChapter === chapter._id && (
                                            <motion.div
                                                initial={{ height: 0, overflow: 'hidden' }}
                                                animate={{ height: 'auto', overflow: 'visible' }}
                                                exit={{ height: 0, overflow: 'hidden' }}
                                                className="bg-black/20 border-t border-white/5"
                                            >
                                                <div className="p-4 space-y-2">
                                                    {chapter.materials.map((mat, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                                                            <Icon icon={
                                                                mat.type === 'video' ? 'mdi:play-circle' :
                                                                    mat.type === 'pdf' ? 'mdi:file-pdf-box' :
                                                                        mat.type === 'link' ? 'mdi:link' :
                                                                            mat.type === 'slide' ? 'mdi:presentation' : 'mdi:image'
                                                            } className={`text-lg ${chapter.is_free ? 'text-nexus-green' : 'text-gray-500'}`} />
                                                            <span className="text-sm text-gray-300 flex-1">{mat.title}</span>

                                                            {/* Tier Badge */}
                                                            {mat.min_package_tier && (
                                                                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider
                                                                    ${mat.min_package_tier === 'premium'
                                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                                        : mat.min_package_tier === 'basic'
                                                                            ? 'bg-nexus-white/10 text-nexus-white border-nexus-white/20'
                                                                            : 'bg-nexus-green/10 text-nexus-green border-nexus-green/20'}`}>
                                                                    {mat.min_package_tier}
                                                                </span>
                                                            )}
                                                            {/* Show Basic badge only if explicitly needed, usually implied as default. 
                                                                But user asked to show tiers. Let's start with Advanced/Premium as they are restrictions. 
                                                                If they want Basic too, easily added. 
                                                                Actually, let's keep it clean: if it's restricted, show badge. 
                                                            */}

                                                            {!chapter.is_free && (
                                                                <Icon icon="mdi:lock" className="text-gray-600" width="16" />
                                                            )}
                                                            {chapter.is_free && (
                                                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Free Preview</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Enrollment Card */}
                <div className="relative">
                    <div className="sticky top-24 bg-nexus-card border border-white/10 rounded-2xl p-6 space-y-6">
                        {/* Video Preview / Thumbnail */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                            <img
                                src={course.thumbnail_url}
                                alt="Preview"
                                className="w-full h-full object-cover opacity-80"
                            />
                        </div>
                        {/* {console.log("Enrollment" + enrollment?.status)} */}

                        <div>
                            {enrollment?.isEnrolled && enrollment?.status === 'active' ? (
                                <Link
                                    to={`/courses/${id}/learn`}
                                    className="block w-full bg-nexus-green text-black font-bold text-center py-3 rounded-xl hover:bg-nexus-green/90 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] mb-6 animate-pulse"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Icon icon="mdi:play-circle-outline" width="24" />
                                        <span>Continue Learning</span>
                                    </div>
                                </Link>
                            ) : enrollment?.status === 'pending' ? (
                                <div className="text-center mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                                    <div className="text-yellow-200 font-bold flex items-center justify-center gap-2 mb-1">
                                        <Icon icon="mdi:clock-alert-outline" /> Approval Pending
                                    </div>
                                    <p className="text-xs text-yellow-500/80">
                                        Your enrollment is being reviewed.
                                    </p>
                                </div>
                            ) : enrollment?.status === 'rejected' ? (
                                <div className="text-center mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                    <div className="text-red-200 font-bold flex items-center justify-center gap-2 mb-1">
                                        <Icon icon="mdi:alert-circle" /> Enrollment Rejected
                                    </div>
                                    <p className="text-xs text-red-400">
                                        Please check your email or status below.
                                    </p>
                                </div>
                            ) : enrollment?.status === 'completed' ? (
                                <div className="text-center mb-6 bg-nexus-green/10 border border-nexus-green/20 rounded-xl p-3">
                                    <div className="text-nexus-green font-bold flex items-center justify-center gap-2 mb-1">
                                        <Icon icon="mdi:check-circle" /> Course Completed
                                    </div>
                                    <p className="text-xs text-nexus-green/80">
                                        You have completed this course.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center mb-6 text-gray-400 text-sm">
                                    Enroll to access full content
                                </div>
                            )}

                            {/* Packages Selection */}
                            <div className="space-y-4 mb-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Select a Plan</h3>

                                {/* Basic Package */}
                                <div
                                    onClick={() => {
                                        if (enrollment?.status === 'pending') return;
                                        // Only allow if not enrolled (Basic is lowest)
                                        if (!enrollment?.isEnrolled) {
                                            setSelectedPackage('basic');
                                        }
                                    }}
                                    className={`group relative rounded-xl border-2 p-5 transition-all duration-300 cursor-pointer overflow-hidden
                                            ${selectedPackage === 'basic'
                                            ? 'bg-white/5 border-white'
                                            : 'bg-black/20 border-white/5 hover:border-white/20'}
                                            ${enrollment?.isEnrolled ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Basic</h4>
                                            <p className="text-xs text-gray-500">Essential access</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">RM {course.packages.basic.price}</div>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {course.packages.basic.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                <Icon icon="mdi:check" className="text-gray-500 flex-shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Advanced Package (Featured) */}
                                <div
                                    onClick={() => {
                                        if (enrollment?.status === 'pending') return;
                                        if (isUpgradeable(enrollment?.package, 'advanced')) {
                                            setSelectedPackage('advanced');
                                        }
                                    }}
                                    className={`group relative rounded-xl border-2 p-5 transition-all duration-300 cursor-pointer overflow-hidden
                                            ${selectedPackage === 'advanced'
                                            ? 'bg-nexus-green/10 border-nexus-green shadow-[0_0_30px_rgba(57,255,20,0.1)]'
                                            : 'bg-black/40 border-white/10 hover:border-nexus-green/50'}
                                            ${!isUpgradeable(enrollment?.package, 'advanced') && enrollment?.isEnrolled ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {/* Badge */}
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-nexus-green text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                            MOST POPULAR
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className={`font-bold text-lg ${selectedPackage === 'advanced' ? 'text-nexus-green' : 'text-white'}`}>Advanced</h4>
                                            <p className="text-xs text-gray-500">Recommended for most students</p>
                                        </div>
                                        <div className="text-right mt-2">
                                            <div className={`text-2xl font-bold ${selectedPackage === 'advanced' ? 'text-nexus-green' : 'text-white'}`}>
                                                {(() => {
                                                    const { isUpgrade, price } = getUpgradeDetails('advanced');
                                                    return (
                                                        <>
                                                            {isUpgrade && <span className="text-xs block font-normal text-gray-400">Upgrade:</span>}
                                                            RM {price}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {course.packages.advanced.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                                <Icon icon="mdi:check-circle" className="text-nexus-green flex-shrink-0 mt-0.5" />
                                                <span className={selectedPackage === 'advanced' ? 'text-white' : ''}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Premium Package */}
                                <div
                                    onClick={() => {
                                        if (enrollment?.status === 'pending') return;
                                        if (isUpgradeable(enrollment?.package, 'premium')) {
                                            setSelectedPackage('premium');
                                        }
                                    }}
                                    className={`group relative rounded-xl border-2 p-5 transition-all duration-300 cursor-pointer overflow-hidden
                                            ${selectedPackage === 'premium'
                                            ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                                            : 'bg-black/20 border-white/5 hover:border-purple-500/50'}
                                            ${!isUpgradeable(enrollment?.package, 'premium') && enrollment?.isEnrolled ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                                            <Icon icon="mdi:crown" width="12" /> VIP ACCESS
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className={`font-bold text-lg ${selectedPackage === 'premium' ? 'text-purple-400' : 'text-white'}`}>Premium</h4>
                                            <p className="text-xs text-gray-500">Maximum value & support</p>
                                        </div>
                                        <div className="text-right mt-2">
                                            <div className={`text-2xl font-bold ${selectedPackage === 'premium' ? 'text-purple-400' : 'text-white'}`}>
                                                {(() => {
                                                    const { isUpgrade, price } = getUpgradeDetails('premium');
                                                    return (
                                                        <>
                                                            {isUpgrade && <span className="text-xs block font-normal text-gray-400">Upgrade:</span>}
                                                            RM {price}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {course.packages.premium.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                                <Icon icon="mdi:star-four-points" className="text-purple-500 flex-shrink-0 mt-0.5" />
                                                <span className={selectedPackage === 'premium' ? 'text-white' : ''}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Enrollment Button */}
                            <div className="text-center space-y-4">
                                {/* Status Banners */}
                                {enrollment?.status === 'pending' && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                                        <Icon icon="mdi:clock-outline" className="text-lg" />
                                        <span>Enrollment Pending Approval</span>
                                    </div>
                                )}

                                {enrollment?.status === 'rejected' && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm py-3 px-4 rounded-xl">
                                        <div className="flex items-center justify-center gap-2 font-bold mb-1">
                                            <Icon icon="mdi:alert-circle" /> Enrollment Rejected
                                        </div>
                                        <div className="opacity-80 text-xs">{enrollment.rejection_reason}</div>
                                    </div>
                                )}

                                {/* Main Action Button */}
                                {(enrollment?.status === 'active' || enrollment?.status === 'completed') && ((TIER_LEVELS[enrollment.package as keyof typeof TIER_LEVELS] || 0) >= (TIER_LEVELS[selectedPackage] || 0)) ? (
                                    // 1. Enrolled & Active (Same Package) -> Go to Learning
                                    <button
                                        onClick={() => navigate(`/courses/${id}/content`)}
                                        className="w-full bg-nexus-green text-black font-bold py-4 rounded-xl hover:bg-nexus-green/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_30px_rgba(0,255,157,0.5)] transform hover:scale-[1.02]"
                                    >
                                        <Icon icon="mdi:play-circle" width="24" />
                                        Go to Learning
                                    </button>
                                ) : (user?._id === course?.tutor_id?._id) ? (
                                    // 2. Is Tutor -> Disabled Button
                                    <button
                                        disabled
                                        className="w-full bg-gray-800 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Icon icon="mdi:human-male-board" width="24" />
                                        You are the Instructor
                                    </button>
                                ) : enrollment?.status === 'pending' ? (
                                    // 3. Pending -> Disabled Button
                                    <button
                                        disabled
                                        className="w-full bg-gray-800 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Icon icon="mdi:lock-clock" width="24" />
                                        Awaiting Approval
                                    </button>
                                ) : (
                                    // 4. Not Enrolled OR Upgrading/Resubmitting -> Payment Button
                                    <button
                                        onClick={handleEnroll}
                                        className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-[1.02]
                                            ${enrollment?.isEnrolled
                                                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/30' // Upgrade Style
                                                : 'bg-white text-black hover:bg-gray-200' // New Enroll Style
                                            }`}
                                    >
                                        <Icon icon={enrollment?.isEnrolled ? "mdi:arrow-up-circle" : "mdi:school"} width="24" />
                                        {enrollment?.isEnrolled ? `Upgrade to ${selectedPackage}` : 'Proceed to Payment'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug Info */}
            {/* {user?.role === 'admin' && (
                <div className="fixed bottom-4 left-4 p-4 bg-black/90 text-xs font-mono text-green-400 border border-green-500/50 rounded z-50 max-w-lg overflow-auto max-h-48">
                    <pre>{JSON.stringify(enrollment, null, 2)}</pre>
                </div>
            )} */}
        </div>
    );
}
