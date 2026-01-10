import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import type { Course, Enrollment } from '../types';
import { FullScreenLoader } from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>();
    // const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<'basic' | 'advanced' | 'premium'>('basic');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState<{ type: 'percentage' | 'fixed', value: number } | null>(null);
    const [promoError, setPromoError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);

    const TIER_LEVELS = { basic: 1, advanced: 2, premium: 3 };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        setPromoDiscount(null);

        try {
            const { data } = await api.post('/promocodes/validate', {
                code: promoCode,
                courseId: id,
                packageTier: selectedPackage
            });

            if (data.valid) {
                setPromoDiscount({ type: data.discountType, value: data.discountValue });
                showToast('Promo code applied!', 'success');
            }
        } catch (error: any) {
            setPromoError(error.response?.data?.message || 'Invalid promo code');
            setPromoDiscount(null);
        } finally {
            setPromoLoading(false);
        }
    };

    // Reset promo when package changes (in case of package-specific codes)
    useEffect(() => {
        setPromoDiscount(null);
        setPromoError('');
        setPromoCode('');
    }, [selectedPackage]);

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

        let upgradePrice = Math.max(0, course.packages[targetPkg].price - effectivePaid);

        // Apply Discount if applicable
        if (promoDiscount) {
            const discountAmount = promoDiscount.type === 'percentage'
                ? (upgradePrice * promoDiscount.value) / 100
                : promoDiscount.value;
            upgradePrice = Math.max(0, upgradePrice - discountAmount);
        }

        return {
            price: upgradePrice,
            isUpgrade: true,
            originalPrice: course.packages[targetPkg].price,
            paid: effectivePaid
        };
    };

    const getPrice = (pkg: 'basic' | 'advanced' | 'premium') => {
        const details = getUpgradeDetails(pkg);
        if (details.isUpgrade) return details.price;

        let price = course?.packages[pkg].price || 0;

        if (promoDiscount && selectedPackage === pkg) {
            const discountAmount = promoDiscount.type === 'percentage'
                ? (price * promoDiscount.value) / 100
                : promoDiscount.value;
            price = Math.max(0, price - discountAmount);
        }
        return price;
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
        const currentPrice = getPrice(selectedPackage);
        if (currentPrice > 0 && !receiptFile) {
            showToast('Please upload your payment receipt', 'warning');
            return;
        }

        try {
            const formData = new FormData();
            if (receiptFile) {
                formData.append('receipt', receiptFile);
            }
            formData.append('package', selectedPackage);
            if (promoDiscount && promoCode) {
                formData.append('promoCode', promoCode);
            }

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
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-nexus-green/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-black/80 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar backdrop-blur-xl ring-1 ring-white/5"
                        >
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1"
                            >
                                <Icon icon="mdi:close" width="24" />
                            </button>

                            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                                <Icon icon="mdi:secure" className="text-nexus-green" />
                                SECURE CHECKOUT
                            </h2>

                            {/* Promo Code Input */}
                            <div className="mb-6 space-y-2">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Promo Code</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="ENTER CODE"
                                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white outline-none transition-all uppercase placeholder-gray-600 font-mono text-sm
                                                ${promoError ? 'border-red-500/50 focus:border-red-500' :
                                                    promoDiscount ? 'border-nexus-green focus:border-nexus-green' : 'border-white/10 focus:border-nexus-green/50 focus:bg-white/10'}`}
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            disabled={!!promoDiscount}
                                        />
                                        {promoDiscount && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-green">
                                                <Icon icon="mdi:check-circle" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || !!promoDiscount || !promoCode}
                                        className={`px-5 rounded-xl font-bold transition-all
                                            ${promoDiscount ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:bg-gray-200'}`}
                                    >
                                        {promoLoading ? <Icon icon="mdi:loading" className="animate-spin" /> : 'APPLY'}
                                    </button>
                                </div>
                                {promoError && (
                                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs font-bold flex items-center gap-1">
                                        <Icon icon="mdi:alert-circle-outline" /> {promoError}
                                    </motion.p>
                                )}
                                {promoDiscount && (
                                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-nexus-green text-xs font-bold flex items-center gap-1">
                                        <Icon icon="mdi:tag" /> DISCOUNT APPLIED: {promoDiscount.type === 'percentage' ? `${promoDiscount.value}%` : `$${promoDiscount.value}`} OFF
                                    </motion.p>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-400 text-sm">Course</span>
                                        <span className="text-white font-bold text-right text-sm line-clamp-1 w-2/3">{course.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Package</span>
                                        <span className="text-white font-bold text-sm uppercase bg-white/10 px-2 py-0.5 rounded text-[10px] tracking-wider">{selectedPackage}</span>
                                    </div>

                                    <div className="h-px bg-white/10 my-2" />

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">
                                            {(() => {
                                                const { isUpgrade } = getUpgradeDetails(selectedPackage);
                                                return isUpgrade ? "Upgrade Cost" : "Total Price";
                                            })()}
                                        </span>
                                        <div className="text-right">
                                            {promoDiscount && (
                                                <span className="block text-xs text-gray-500 line-through decoration-red-500/50 mb-0.5">
                                                    RM {getUpgradeDetails(selectedPackage).isUpgrade
                                                        ? getUpgradeDetails(selectedPackage).originalPrice - getUpgradeDetails(selectedPackage).paid
                                                        : course.packages[selectedPackage].price}
                                                </span>
                                            )}
                                            <span className="text-2xl font-black text-white tracking-tight">
                                                RM {getPrice(selectedPackage)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Details (Only show if price > 0) */}
                            {getPrice(selectedPackage) > 0 && (
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon icon="mdi:bank-transfer" className="text-nexus-green" />
                                        <p className="text-sm font-bold text-white uppercase tracking-wider">Payment Details</p>
                                    </div>

                                    <div className="grid gap-3">
                                        <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                                            <div className="bg-white p-1 rounded w-10 h-10 flex items-center justify-center">
                                                <Icon icon="mdi:bank" className="text-black text-xl" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Bank Name</div>
                                                <div className="text-white font-bold">RHB Bank</div>
                                            </div>
                                        </div>

                                        <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center justify-between gap-3 group relative overflow-hidden">
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="bg-white/10 p-1 rounded-lg w-10 h-10 flex items-center justify-center text-white">
                                                    <Icon icon="mdi:card-account-details-outline" className="text-xl" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Account Number</div>
                                                    <div className="text-white font-bold font-mono tracking-wider">{import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '1140 5555 8888'}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '1140 5555 8888');
                                                    showToast('Account number copied!', 'success');
                                                }}
                                                className="p-2 hover:bg-nexus-green/20 text-gray-400 hover:text-nexus-green rounded-lg transition-colors relative z-10"
                                            >
                                                <Icon icon="mdi:content-copy" width="20" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 mb-2">— OR SCAN QR —</p>
                                        <div className="bg-white p-2 rounded-xl inline-block">
                                            <img src='/Payment QR.PNG' className='w-48 h-48 object-contain' alt="Payment QR" />
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* Upload Receipt (Only show if price > 0) */}
                            {getPrice(selectedPackage) > 0 ? (
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <Icon icon="mdi:cloud-upload" className="text-nexus-green" />
                                        Upload Payment Receipt
                                    </label>
                                    <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-nexus-green/50 hover:bg-nexus-green/5 transition-all group cursor-pointer bg-black/20">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {receiptFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-nexus-green/20 flex items-center justify-center text-nexus-green">
                                                    <Icon icon="mdi:check" className="text-2xl" />
                                                </div>
                                                <span className="text-nexus-green font-bold text-sm truncate max-w-[200px]">{receiptFile.name}</span>
                                                <span className="text-xs text-gray-500">Tap to change</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-gray-500 group-hover:text-gray-300">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <Icon icon="mdi:tray-arrow-up" className="text-2xl" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold block text-gray-400 group-hover:text-white">Click to Upload</span>
                                                    <span className="text-xs mt-1">SVG, PNG, JPG or GIF (MAX. 800x400px)</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8 bg-nexus-green/10 border border-nexus-green/20 p-6 rounded-2xl text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-nexus-green/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                    <Icon icon="mdi:gift-outline" className="text-nexus-green text-4xl mx-auto mb-3 relative z-10" />
                                    <p className="text-nexus-green font-black text-lg relative z-10">100% DISCOUNT APPLIED</p>
                                    <p className="text-xs text-nexus-green/70 font-medium relative z-10">No payment required. Proceed to enroll.</p>
                                </div>
                            )}

                            <button
                                onClick={confirmPayment}
                                disabled={getPrice(selectedPackage) > 0 && !receiptFile}
                                className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg tracking-wide uppercase
                                    ${(getPrice(selectedPackage) === 0 || receiptFile)
                                        ? 'bg-nexus-green text-black hover:bg-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transform hover:-translate-y-1'
                                        : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                                    }`}
                            >
                                {getPrice(selectedPackage) === 0 ? (
                                    <>
                                        <Icon icon="mdi:gift" width="24" /> Claim Free Access
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:check-decagram" width="24" /> Confirm & Pay
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-wider font-medium">
                                By confirming, your access will be activated pending admin verification.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">

                {/* Left Column: Info & Syllabus */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`
                                flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border backdrop-blur-md
                                ${course.status === 'ongoing' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-nexus-green/10 text-nexus-green border-nexus-green/20'}
                            `}>
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${course.status === 'ongoing' ? 'bg-orange-500' : 'bg-nexus-green'}`} />
                                {course.status}
                            </span>
                            <span className="flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-white/10 bg-white/5 text-gray-300">
                                <Icon icon={course.type === 'university' ? 'mdi:bank-outline' : 'mdi:school-outline'} />
                                {course.type === 'university' ? course.major : course.category || "General"}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
                            {course.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl">
                            {course.description}
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Level', value: course.level, icon: 'mdi:stairs-up', color: 'text-blue-400' },
                            { label: 'Duration', value: course.total_duration || 'Self-Paced', icon: 'mdi:clock-outline', color: 'text-orange-400' },
                            { label: 'Chapters', value: course.total_chapters, icon: 'mdi:book-open-page-variant', color: 'text-purple-400' },
                            { label: 'XP Reward', value: `+${course.completion_xp_bonus} XP`, icon: 'mdi:star-four-points', color: 'text-nexus-green' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-sm hover:bg-white/5 transition-colors">
                                <div className={`text-2xl mb-2 ${stat.color}`}>
                                    <Icon icon={stat.icon} />
                                </div>
                                <div className="text-2xl font-bold text-white mb-1 capitalize">{stat.value}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tutor Section */}
                    <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-nexus-green/10 to-transparent rounded-full blur-3xl rounded-bl-[100px]" />

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <Link to={`/tutors/${course.tutor_id?._id}`} className="group relative w-32 h-32 shrink-0">
                                <div className="absolute inset-0 bg-nexus-green rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                                <img
                                    src={course.tutor_id?.tutor_profile_image || course.tutor_id?.current_avatar_url || `https://ui-avatars.com/api/?name=${course.tutor_id?.username}`}
                                    alt={course.tutor_id?.username}
                                    className="w-full h-full rounded-full object-cover border-4 border-black/50 relative z-10 group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-1 right-1 z-20 bg-blue-500 text-white p-1.5 rounded-full border-4 border-black">
                                    <Icon icon="mdi:check-decagram" width="16" />
                                </div>
                            </Link>

                            <div className="text-center md:text-left flex-1">
                                <div className="text-xs font-bold text-nexus-green uppercase tracking-widest mb-2">Lead Instructor</div>
                                <Link to={`/tutors/${course.tutor_id?._id}`} className="hover:underline decoration-white/30 underline-offset-4">
                                    <h3 className="text-3xl font-bold text-white mb-2">
                                        {course.tutor_id?.first_name
                                            ? `${course.tutor_id.first_name} ${course.tutor_id.last_name}`
                                            : course.tutor_id?.username
                                        }
                                    </h3>
                                </Link>
                                <p className="text-gray-400 leading-relaxed mb-4">
                                    {course.tutor_id?.bio || "Expert instructor dedicated to helping you master the material through practical, hands-on learning experiences."}
                                </p>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                        <Icon icon="mdi:school" className="text-gray-400" />
                                        {course.tutor_id?.expertise || "Mastery Level"}
                                    </span>
                                    <Link to={`/tutors/${course.tutor_id?._id}`} className="text-xs font-bold text-white flex items-center gap-1 hover:text-nexus-green transition-colors">
                                        View Full Profile <Icon icon="mdi:arrow-right" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reward Showoff */}
                    {course.reward_avatar_id && typeof course.reward_avatar_id !== 'string' && (
                        <div className="relative border border-nexus-green/20 bg-nexus-green/5 rounded-3xl p-8 text-center overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-green/50 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-green/20 to-transparent" />

                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-nexus-green uppercase tracking-[0.3em] mb-8">Completion Reward</h3>

                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="inline-block relative mb-6"
                                >
                                    <div className="absolute inset-0 bg-nexus-green blur-3xl opacity-20" />
                                    <img
                                        src={(course.reward_avatar_id as any).image_url}
                                        alt={(course.reward_avatar_id as any).name}
                                        className="w-48 h-48 object-contain drop-shadow-[0_0_25px_rgba(57,255,20,0.4)] relative z-10"
                                    />
                                </motion.div>

                                <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                                    {(course.reward_avatar_id as any).name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-green to-white">NEXON</span>
                                </h4>
                                <p className="text-sm text-gray-400 max-w-md mx-auto">
                                    Unlock this exclusive avatar for your profile by completing 100% of this course.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Syllabus */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-white">Curriculum</h2>
                            <span className="text-sm text-gray-500">{course.chapters?.length || 0} Modules</span>
                        </div>

                        <div className="space-y-4">
                            {course.chapters?.map((chapter, index) => (
                                <div key={chapter._id} className="group bg-black/40 border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                                    <button
                                        onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)}
                                        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`
                                                w-12 h-12 flex items-center justify-center rounded-xl font-black text-lg
                                                ${expandedChapter === chapter._id ? 'bg-nexus-green text-black' : 'bg-white/5 text-gray-500 group-hover:text-white'}
                                                transition-colors
                                            `}>
                                                {(index + 1).toString().padStart(2, '0')}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-lg mb-1 ${expandedChapter === chapter._id ? 'text-nexus-green' : 'text-white'}`}>
                                                    {chapter.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium uppercase tracking-wide">
                                                    <span className="flex items-center gap-1"><Icon icon="mdi:file-document-outline" /> {chapter.materials.length} Lessons</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                    <span className="flex items-center gap-1 text-nexus-green"><Icon icon="mdi:star-four-points-outline" /> {chapter.xp_reward} XP</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-full transition-transform duration-300 ${expandedChapter === chapter._id ? 'rotate-180 bg-white/10' : ''}`}>
                                            <Icon icon="mdi:chevron-down" className="text-white" width="20" />
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedChapter === chapter._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5 bg-black/20"
                                            >
                                                <div className="p-4 space-y-1">
                                                    {chapter.materials.map((mat, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group/item">
                                                            <div className={`p-2 rounded-lg ${chapter.is_free ? 'bg-nexus-green/10 text-nexus-green' : 'bg-white/5 text-gray-500'}`}>
                                                                <Icon icon={
                                                                    mat.type === 'video' ? 'mdi:play-circle' :
                                                                        mat.type === 'pdf' ? 'mdi:file-pdf-box' :
                                                                            mat.type === 'link' ? 'mdi:link' :
                                                                                mat.type === 'slide' ? 'mdi:presentation' : 'mdi:image'
                                                                } width="20" />
                                                            </div>
                                                            <span className="text-gray-300 font-medium flex-1 group-hover/item:text-white transition-colors">{mat.title}</span>

                                                            {/* Tier Badge */}
                                                            {mat.min_package_tier && (
                                                                <span className={`text-[10px] px-2 py-1 rounded uppercase font-black tracking-wider
                                                                    ${mat.min_package_tier === 'premium'
                                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                                        : mat.min_package_tier === 'basic'
                                                                            ? 'bg-white/10 text-gray-400 border border-white/10'
                                                                            : 'bg-nexus-green/10 text-nexus-green border border-nexus-green/20'}`}>
                                                                    {mat.min_package_tier}
                                                                </span>
                                                            )}

                                                            {!chapter.is_free ? (
                                                                <Icon icon="mdi:lock" className="text-gray-600" width="16" />
                                                            ) : (
                                                                <span className="text-[10px] bg-nexus-green/10 text-nexus-green px-2 py-0.5 rounded border border-nexus-green/20 uppercase font-bold tracking-wider">Free</span>
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
                <div className="relative lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        {/* Status Card */}
                        <div className="bg-nexus-card/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                            {/* Top Gradient Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-nexus-green via-blue-500 to-purple-500" />

                            {/* Video Preview / Thumbnail */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-6 group cursor-pointer">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                        <Icon icon="mdi:play" className="text-white ml-1 text-3xl" />
                                    </div>
                                </div>
                                <img
                                    src={course.thumbnail_url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div>
                                {enrollment?.isEnrolled && enrollment?.status === 'active' ? (
                                    <Link
                                        to={`/courses/${id}/learn`}
                                        className="block w-full bg-nexus-green text-black font-black text-center py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] mb-6 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transform hover:-translate-y-1 uppercase tracking-wide flex items-center justify-center gap-2 group"
                                    >
                                        <Icon icon="mdi:play-circle-outline" width="24" className="group-hover:scale-110 transition-transform" />
                                        Resume Mission
                                    </Link>
                                ) : enrollment?.status === 'pending' ? (
                                    <div className="text-center mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                        <div className="text-yellow-400 font-bold flex items-center justify-center gap-2 mb-1 uppercase tracking-wider text-sm">
                                            <Icon icon="mdi:clock-alert-outline" /> Approval Gridlocked
                                        </div>
                                        <p className="text-xs text-yellow-500/60">
                                            Admin review in progress. Stand by.
                                        </p>
                                    </div>
                                ) : enrollment?.status === 'rejected' ? (
                                    <div className="text-center mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                        <div className="text-red-400 font-bold flex items-center justify-center gap-2 mb-1 uppercase tracking-wider text-sm">
                                            <Icon icon="mdi:alert-circle" /> Access Denied
                                        </div>
                                        <p className="text-xs text-red-400/60">
                                            Application rejected. Check comms.
                                        </p>
                                    </div>
                                ) : enrollment?.status === 'completed' ? (
                                    <div className="text-center mb-6 bg-nexus-green/10 border border-nexus-green/20 rounded-xl p-4">
                                        <div className="text-nexus-green font-bold flex items-center justify-center gap-2 mb-1 uppercase tracking-wider text-sm">
                                            <Icon icon="mdi:trophy" /> Mission Complete
                                        </div>
                                        <p className="text-xs text-nexus-green/60">
                                            All objectives achieved. Well done, operative.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center mb-6">
                                        <p className="text-white font-bold text-lg mb-1">Unlock Full Access</p>
                                        <p className="text-gray-500 text-xs">Choose your clearance level below</p>
                                    </div>
                                )}

                                {/* Packages Selection */}
                                <div className="space-y-4 mb-4">
                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-1">Clearance Levels</h3>

                                    {/* Basic Package */}
                                    <div
                                        onClick={() => {
                                            if (enrollment?.status === 'pending') return;
                                            if (!enrollment?.isEnrolled) {
                                                setSelectedPackage('basic');
                                            }
                                        }}
                                        className={`group relative rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer overflow-hidden
                                                ${selectedPackage === 'basic'
                                                ? 'bg-white/5 border-white shadow-lg'
                                                : 'bg-black/20 border-white/5 hover:border-white/20'}
                                                ${enrollment?.isEnrolled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-white uppercase tracking-wider">Basic</h4>
                                            <div className="text-lg font-bold text-white">RM {course.packages.basic.price}</div>
                                        </div>
                                        <ul className="space-y-2">
                                            {course.packages.basic.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                    <Icon icon="mdi:check" className="text-gray-600 flex-shrink-0 mt-0.5" />
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
                                        className={`group relative rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer overflow-hidden
                                                ${selectedPackage === 'advanced'
                                                ? 'bg-nexus-green/5 border-nexus-green shadow-[0_0_25px_rgba(34,197,94,0.15)] scale-[1.02]'
                                                : 'bg-black/40 border-white/10 hover:border-nexus-green/30'}
                                                ${!isUpgradeable(enrollment?.package, 'advanced') && enrollment?.isEnrolled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="absolute top-0 right-0">
                                            <div className={`text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider transition-colors
                                                ${selectedPackage === 'advanced' ? 'bg-nexus-green text-black' : 'bg-white/10 text-gray-400 group-hover:bg-nexus-green/20 group-hover:text-nexus-green'}`}>
                                                Recommended
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className={`font-bold text-lg uppercase tracking-wider ${selectedPackage === 'advanced' ? 'text-nexus-green' : 'text-white'}`}>Advanced</h4>
                                            <div className={`text-xl font-bold ${selectedPackage === 'advanced' ? 'text-nexus-green' : 'text-white'}`}>
                                                RM {course.packages.advanced.price}
                                            </div>
                                        </div>
                                        <ul className="space-y-2.5">
                                            {course.packages.advanced.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                                    <Icon icon="mdi:check-circle" className="text-nexus-green flex-shrink-0 mt-0.5" />
                                                    <span className={selectedPackage === 'advanced' ? 'text-white font-medium' : ''}>{feature}</span>
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
                                        className={`group relative rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer overflow-hidden
                                                ${selectedPackage === 'premium'
                                                ? 'bg-purple-500/5 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                                                : 'bg-black/20 border-white/5 hover:border-purple-500/30'}
                                                ${!isUpgradeable(enrollment?.package, 'premium') && enrollment?.isEnrolled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className={`font-bold uppercase tracking-wider ${selectedPackage === 'premium' ? 'text-purple-400' : 'text-white'}`}>Premium</h4>
                                            <div className={`text-lg font-bold ${selectedPackage === 'premium' ? 'text-purple-400' : 'text-white'}`}>
                                                RM {course.packages.premium.price}
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            {course.packages.premium.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                    <Icon icon="mdi:star" className="text-purple-400 flex-shrink-0 mt-0.5" />
                                                    <span className={selectedPackage === 'premium' ? 'text-gray-200' : ''}>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col items-center gap-3">
                                    {enrollment?.isEnrolled ? (
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Enrollment Active</p>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-nexus-green transition-all shadow-lg hover:shadow-nexus-green/20 uppercase tracking-wider flex items-center justify-center gap-2 group"
                                        >
                                            Initiate Enrollment <Icon icon="mdi:arrow-right" className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                    <p className="text-[10px] text-gray-600 flex items-center gap-1">
                                        <Icon icon="mdi:shield-check" /> 100% Secure Payment (RHB / QR)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-black/20 border border-white/5 rounded-2xl p-6 text-center">
                            <h4 className="text-white font-bold mb-2">Need Support?</h4>
                            <p className="text-xs text-gray-500 mb-4">Contact our support command center for assistance.</p>
                            <Link to="/contact" className="text-nexus-green text-sm font-bold hover:underline">Contact Support</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
