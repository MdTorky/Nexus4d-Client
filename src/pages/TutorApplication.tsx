import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
// import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { FullScreenLoader } from '../components/ui/Loader';

type TutorFormData = {
    full_name: string;
    email: string;
    phone: string;
    specialization: string;
    bio: string;
    linkedin_profile?: string;
    cv_url?: string;
    profile_picture?: FileList;
};

export default function TutorApplication() {
    // const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<TutorFormData>({
        defaultValues: {
            full_name: user && user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '',
            email: user?.email || '',
        }
    });

    const [appStatus, setAppStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
    const [adminNotes, setAdminNotes] = useState('');
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    useEffect(() => {
        const checkStatus = async () => {
            if (!user) {
                setIsLoadingStatus(false);
                return;
            }
            try {
                const res = await api.get('/tutors/status');
                setAppStatus(res.data.status || 'none');
                setAdminNotes(res.data.admin_notes || '');
            } catch (error) {
                console.error('Failed to fetch status', error);
                setAppStatus('none');
            } finally {
                setIsLoadingStatus(false);
            }
        };
        checkStatus();
    }, [user]);

    const onSubmit = async (data: TutorFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('full_name', data.full_name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);
            formData.append('specialization', data.specialization);
            formData.append('bio', data.bio);
            if (data.linkedin_profile) formData.append('linkedin_profile', data.linkedin_profile);

            if (data.profile_picture && data.profile_picture.length > 0) {
                formData.append('profile_picture', data.profile_picture[0]);
            }

            await api.post('/tutors/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Application submitted successfully!', 'success');
            setAppStatus('pending');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to submit application', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-nexus-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-nexus-green/5 blur-[100px]" />
                <div className="relative z-10 text-center max-w-md bg-black/40 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                    <Icon icon="mdi:lock-alert" className="text-nexus-green text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Access Restricted</h2>
                    <p className="text-gray-400 mb-6">You must be logged in to apply for tutor status.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-nexus-green text-black font-black py-3 rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-nexus-green/50 uppercase tracking-widest"
                    >
                        Login Now
                    </button>
                </div>
            </div>
        );
    }

    if (isLoadingStatus) {
        return <FullScreenLoader />;
    }

    if (!user.first_name || !user.last_name || user.first_name.trim() === '' || user.last_name.trim() === '') {
        return (
            <div className="min-h-screen bg-nexus-black flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px]" />
                <div className="relative z-10 max-w-md w-full text-center space-y-6 bg-black/40 p-10 rounded-3xl border border-red-500/20 backdrop-blur-xl">
                    <div className="mx-auto h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <Icon icon="mdi:account-alert" className="h-10 w-10 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-wide">Incomplete Profile</h1>
                        <p className="text-gray-400 mt-2 text-sm leading-relaxed">System protocols require a complete user profile before initiating the tutor application process.</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-400 transition-all shadow-lg hover:shadow-red-500/30 uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        Complete Profile <Icon icon="mdi:arrow-right" />
                    </button>
                </div>
            </div>
        );
    }

    // Access Control Logic
    if (appStatus === 'approved') {
        return (
            <div className="min-h-screen bg-nexus-black flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nexus-green/10 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-md w-full text-center space-y-8 bg-black/40 p-12 rounded-[2rem] border border-nexus-green/30 backdrop-blur-2xl shadow-2xl">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="mx-auto h-32 w-32 rounded-full bg-nexus-green/10 flex items-center justify-center border-2 border-nexus-green/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                    >
                        <Icon icon="mdi:check-decagram" className="h-16 w-16 text-nexus-green" />
                    </motion.div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Access Granted</h1>
                        <p className="text-nexus-green font-bold tracking-widest uppercase text-sm mb-4">Clearance Level: Tutor</p>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your capabilities have been verified. You now have authorization to access the Tutor Command Center.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/tutor-dashboard')}
                        className="w-full bg-nexus-green text-black font-black py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <Icon icon="mdi:view-dashboard" /> Enter Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (appStatus === 'pending') {
        return (
            <div className="min-h-screen bg-nexus-black flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-md w-full text-center space-y-8 bg-black/40 p-12 rounded-[2rem] border border-yellow-500/20 backdrop-blur-2xl">
                    <div className="mx-auto h-32 w-32 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 relative">
                        <div className="absolute inset-0 border-t-2 border-yellow-500 rounded-full animate-spin" />
                        <Icon icon="mdi:cached" className="h-14 w-14 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Status: Pending</h1>
                        <p className="text-yellow-500 font-bold tracking-widest uppercase text-sm mb-4">Awaiting Admin Review</p>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your application is currently being processed by our central systems. Stand by for status updates.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all border border-white/10 uppercase tracking-wider"
                    >
                        Return to Base
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nexus-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-nexus-green/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 sm:p-12 shadow-2xl"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    {/* <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-nexus-green/10 text-nexus-green mb-6 border border-nexus-green/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                        <Icon icon="mdi:school-outline" className="text-3xl" />
                    </div> */}
                    <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                        Initialize <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-green to-blue-400">Tutor Protocol</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Join the elite ranks of Nexus 4D instructors. Share your knowledge and shape the next generation of operatives.
                    </p>
                </div>

                {appStatus === 'rejected' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/30 p-6 flex flex-col sm:flex-row gap-4 items-start"
                    >
                        <div className="p-3 bg-red-500/20 rounded-xl text-red-500 shrink-0">
                            <Icon icon="mdi:alert-decagram" className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-400 text-lg uppercase tracking-wide mb-1">Application Declined</h3>
                            <p className="text-red-200/80 text-sm mb-2">Review Board Notes: <span className="text-white font-medium">{adminNotes || 'Insufficient credentials provided.'}</span></p>
                            <p className="text-xs text-red-400/60 uppercase tracking-widest font-bold">You may revise and resubmit your application below.</p>
                        </div>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Identity</label>
                            <div className="relative group">
                                <Icon icon="mdi:account" className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nexus-green transition-colors" />
                                <input
                                    {...register('full_name', { required: 'Full Name is required' })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-nexus-green focus:ring-1 focus:ring-nexus-green/50 focus:outline-none transition-all"
                                    placeholder="FULL NAME"
                                />
                            </div>
                            {errors.full_name && <p className="text-xs text-red-500 ml-1 font-bold">{errors.full_name.message}</p>}
                        </div>

                        {/* Specialization */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Expertise</label>
                            <div className="relative group">
                                <Icon icon="mdi:star-four-points" className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nexus-green transition-colors" />
                                <input
                                    {...register('specialization', { required: 'Specialization is required' })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-nexus-green focus:ring-1 focus:ring-nexus-green/50 focus:outline-none transition-all"
                                    placeholder="PRIMARY SUBJECT"
                                />
                            </div>
                            {errors.specialization && <p className="text-xs text-red-500 ml-1 font-bold">{errors.specialization.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Comms (Email)</label>
                            <div className="relative group">
                                <Icon icon="mdi:email" className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nexus-green transition-colors" />
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid format"
                                        }
                                    })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-nexus-green focus:ring-1 focus:ring-nexus-green/50 focus:outline-none transition-all"
                                    placeholder="EMAIL ADDRESS"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 ml-1 font-bold">{errors.email.message}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Comms (Phone)</label>
                            <div className="relative group">
                                <Icon icon="mdi:phone" className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nexus-green transition-colors" />
                                <input
                                    {...register('phone', { required: 'Phone Number is required' })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-nexus-green focus:ring-1 focus:ring-nexus-green/50 focus:outline-none transition-all"
                                    placeholder="PHONE NUMBER"
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500 ml-1 font-bold">{errors.phone.message}</p>}
                        </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Digital Footprint</label>
                        <div className="relative group">
                            <Icon icon="mdi:linkedin" className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nexus-green transition-colors" />
                            <input
                                {...register('linkedin_profile')}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-nexus-green focus:ring-1 focus:ring-nexus-green/50 focus:outline-none transition-all"
                                placeholder="LINKEDIN PROFILE URL (OPTIONAL)"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mission Brief (Bio)</label>
                        <textarea
                            {...register('bio', { required: 'Bio is required', minLength: { value: 50, message: "Please provide at least 50 characters" } })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-nexus-green focus:ring-1 focus:ring-nexus-green/50 focus:outline-none transition-all min-h-[150px] resize-none"
                            placeholder="Detail your experience and teaching capabilities..."
                        />
                        {errors.bio && <p className="text-xs text-red-500 ml-1 font-bold">{errors.bio.message}</p>}
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Profile Identification</label>
                        <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-nexus-green/50 hover:bg-nexus-green/5 transition-all group cursor-pointer bg-black/20 text-center">
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                {...register('profile_picture')}
                                onChange={(e) => {
                                    register('profile_picture').onChange(e);
                                    handleFileChange(e);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />

                            {previewUrl ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 rounded-full border-2 border-nexus-green p-1 relative z-10">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <span className="text-nexus-green font-bold text-sm uppercase tracking-wider relative z-10 bg-black/50 px-3 py-1 rounded-full">Image Selected</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform mb-2">
                                        <Icon icon="mdi:camera-plus" className="text-2xl text-gray-400 group-hover:text-white" />
                                    </div>
                                    <span className="text-gray-400 font-bold group-hover:text-white transition-colors">Upload Profile Photo</span>
                                    <span className="text-xs text-gray-600">JPG or PNG (MAX 2MB)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-nexus-green text-black font-black py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] uppercase tracking-widest text-lg flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                        {isSubmitting ? (
                            <>
                                <Icon icon="mdi:loading" className="animate-spin text-2xl" /> Transmitting...
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:send" className="text-2xl group-hover:translate-x-1 transition-transform" /> Submit Application
                            </>
                        )}
                    </button>

                </form>
            </motion.div>
        </div>
    );
}
