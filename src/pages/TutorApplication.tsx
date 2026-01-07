import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';

type TutorFormData = {
    full_name: string;
    email: string;
    specialization: string;
    bio: string;
    linkedin_profile?: string;
    cv_url?: string;
    profile_picture?: FileList; // Changed from string URL
};

export default function TutorApplication() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // For previewing image

    const { register, handleSubmit, formState: { errors } } = useForm<TutorFormData>({
        defaultValues: {
            full_name: user ? `${user?.first_name} ${user?.last_name} ` : '', // Pre-fill if useful, though real name preferred
            email: user?.email || '',
        }
    });
    const [appStatus, setAppStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
    const [adminNotes, setAdminNotes] = useState('');
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Handle File Change for Preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    // Check Status on Mount
    useEffect(() => {
        const checkStatus = async () => {
            if (!user) {
                setIsLoadingStatus(false); // If no user, no status to check, so stop loading
                return;
            }
            try {
                const res = await api.get('/tutors/status');
                setAppStatus(res.data.status || 'none');
                setAdminNotes(res.data.admin_notes || '');
            } catch (error) {
                console.error('Failed to fetch status', error);
                // If status check fails, assume 'none' or handle error appropriately
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
            formData.append('specialization', data.specialization);
            formData.append('bio', data.bio);
            if (data.linkedin_profile) formData.append('linkedin_profile', data.linkedin_profile);

            // Append File if exists
            if (data.profile_picture && data.profile_picture.length > 0) {
                formData.append('profile_picture', data.profile_picture[0]);
            }

            // Note: Content-Type is auto-set by axios for FormData
            await api.post('/tutors/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Application submitted successfully!', 'success');
            setAppStatus('pending'); // Update local status to pending after successful submission
            // navigate('/dashboard'); // Removed navigation to allow pending status display
        } catch (error: any) {
            // Handle "Already applied" specifically if needed
            showToast(error.response?.data?.message || 'Failed to submit application', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        // Should realistically redirect to login or show different UI
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-nexus-black text-nexus-white">
                <h2 className="text-xl mb-4">You must be logged in to apply.</h2>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
        );
    }

    if (isLoadingStatus) {
        return <div className="flex h-screen items-center justify-center bg-nexus-black"><div className="text-nexus-green">Checking Status...</div></div>;
    }

    // Access Control Logic
    if (appStatus === 'approved') {
        return (
            <div className="min-h-screen bg-nexus-black flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Icon icon="mdi:check-decagram" className="h-12 w-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">You are a Tutor! 🎉</h1>
                    <p className="text-gray-400">Your application has been approved. You can now access the Tutor Dashboard to create courses.</p>
                    <Button onClick={() => navigate('/admin')} variant="primary" className="w-full">
                        Go to Tutor Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (appStatus === 'pending') {
        return (
            <div className="min-h-screen bg-nexus-black flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto h-24 w-24 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Icon icon="mdi:clock-outline" className="h-12 w-12 text-yellow-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Application Under Review</h1>
                    <p className="text-gray-400">Thanks for applying! We are currently reviewing your application. You will be notified once a decision is made.</p>
                    <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    // If Rejected, show message but allow re-apply (Render Form below but with alert)
    return (
        <div className="min-h-screen bg-nexus-black px-4 py-12 lg:px-8 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl rounded-2xl border border-nexus-card bg-nexus-card/30 p-8 backdrop-blur-sm"
            >
                {appStatus === 'rejected' && (
                    <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-red-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon icon="mdi:alert-circle" className="h-5 w-5 text-red-500" />
                            <span className="font-bold text-red-500">Previous Application Rejected</span>
                        </div>
                        <p className="text-sm">Reason: {adminNotes || 'No reason provided.'}</p>
                        <p className="text-xs mt-2 text-red-300">You may edit and resubmit your application below.</p>
                    </div>
                )}

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-nexus-white mb-2">{t('nav.becomeTutor')}</h1>
                    <p className="text-gray-400">Share your expertise with the Nexus 4D community.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input
                            {...register('full_name', { required: 'Full Name is required' })}
                            className="w-full rounded-lg border border-nexus-card bg-black/50 p-3 text-nexus-white focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green transition text-sm"
                            placeholder="e.g. John Doe"
                        />
                        {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            className="w-full rounded-lg border border-nexus-card bg-black/50 p-3 text-nexus-white focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green transition text-sm"
                            placeholder="e.g. john@example.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    {/* Specialization */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Area of Expertise</label>
                        <input
                            {...register('specialization', { required: 'Specialization is required' })}
                            className="w-full rounded-lg border border-nexus-card bg-black/50 p-3 text-nexus-white focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green transition text-sm"
                            placeholder="e.g. Physics, Advanced Calculus, React Native"
                        />
                        {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization.message}</p>}
                    </div>

                    {/* Bio / Experience */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Brief Bio & Experience</label>
                        <textarea
                            {...register('bio', { required: 'Bio is required', minLength: { value: 50, message: "Please provide at least 50 characters" } })}
                            className="w-full rounded-lg border border-nexus-card bg-black/50 p-3 text-nexus-white focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green transition text-sm min-h-[120px]"
                            placeholder="Tell us about your teaching experience and what makes you a great tutor..."
                        />
                        {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
                    </div>

                    {/* LinkedIn (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn Profile (Optional)</label>
                        <input
                            {...register('linkedin_profile')}
                            className="w-full rounded-lg border border-nexus-card bg-black/50 p-3 text-nexus-white focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green transition text-sm"
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>

                    {/* Profile Picture Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Profile Picture (Max 2MB)</label>
                        <div className="flex items-center gap-4">
                            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-gray-600 bg-gray-800">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No Img</div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                {...register('profile_picture')}
                                onChange={(e) => {
                                    register('profile_picture').onChange(e); // Sync with hook form
                                    handleFileChange(e); // Handle preview
                                }}
                                className="cursor-pointer block w-full text-sm text-gray-400 file:mr-4 file:rounded-full file:border-0 file:bg-nexus-green/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-nexus-green hover:file:bg-nexus-green/20"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Supports JPG, PNG (Max 2MB)</p>
                    </div>


                    {!isSubmitting && (<Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>Submit Application</Button>)}
                    {isSubmitting && (
                        <div className="flex items-center gap-2 justify-center">
                            <Loader className="" text="Submitting..." />
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
}
