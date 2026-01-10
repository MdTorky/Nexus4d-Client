import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Select from '../components/ui/Select';
import { MAJORS, SEMESTERS } from '../constants/onboarding';

const onboardingSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    major: z.string().min(1, "Major is required"),
    semester: z.string().min(1, "Semester is required"),
    bio: z.string().max(500).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if we are in "Edit Mode" (user has data) or "Onboarding Mode" (empty profile)
    const isEditMode = !!(user?.first_name || user?.last_name || user?.major);

    const majorOptions = MAJORS.map(m => ({
        label: t(`onboarding.${m.labelKey}`),
        value: m.value,
        icon: m.icon
    }));

    const semesterOptions = SEMESTERS.map(s => ({
        label: t(`onboarding.${s.labelKey}`),
        value: s.value,
        icon: s.icon
    }));

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            major: '',
            semester: '',
            bio: '',
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                major: user.major || '',
                semester: user.semester || '',
                bio: user.bio || '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: OnboardingFormData) => {
        setIsSubmitting(true);
        try {
            await api.put('/user/profile', data);
            updateUser(data);
            showToast(isEditMode ? 'Profile updated successfully!' : 'Welcome to Nexus 4D, Cadet!', 'success');
            navigate('/profile');
        } catch (error: any) {
            showToast(error.message || 'Update failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-nexus-black relative overflow-hidden flex items-center justify-center pt-20 pb-12 px-4">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[900px] h-[900px] bg-blue-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[700px] h-[700px] bg-nexus-green/5 rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="bg-black/40 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nexus-green to-transparent opacity-50" />

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-nexus-green/20 to-blue-500/20 mb-6 border border-white/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                            <Icon icon={isEditMode ? "mdi:account-edit" : "mdi:shield-account"} className="text-4xl text-nexus-green" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
                            {isEditMode ? "Update Credentials" : t('onboarding.title')}
                        </h1>
                        <p className="text-gray-400 text-sm font-medium tracking-wide">
                            {isEditMode ? "Modify your personnel file and operational parameters." : t('onboarding.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{t('onboarding.firstName')}</label>
                                <div className="relative group">
                                    <input
                                        {...register('first_name')}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-nexus-green/50 focus:bg-white/10 transition-all font-bold"
                                        placeholder="Enter First Name"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-nexus-green/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                                </div>
                                {errors.first_name && <p className="text-[10px] text-red-500 uppercase font-black tracking-wide pl-1">{errors.first_name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{t('onboarding.lastName')}</label>
                                <div className="relative group">
                                    <input
                                        {...register('last_name')}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-nexus-green/50 focus:bg-white/10 transition-all font-bold"
                                        placeholder="Enter Last Name"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-nexus-green/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                                </div>
                                {errors.last_name && <p className="text-[10px] text-red-500 uppercase font-black tracking-wide pl-1">{errors.last_name.message}</p>}
                            </div>
                        </div>

                        {/* Academic Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{t('onboarding.major')}</label>
                                <Controller
                                    control={control}
                                    name="major"
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            options={majorOptions}
                                            value={value}
                                            onChange={onChange}
                                            placeholder={t('onboarding.selectMajor')}
                                            error={errors.major?.message}
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{t('onboarding.semester')}</label>
                                <Controller
                                    control={control}
                                    name="semester"
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            options={semesterOptions}
                                            value={value}
                                            onChange={onChange}
                                            placeholder={t('onboarding.selectSemester')}
                                            error={errors.semester?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Bio Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{t('onboarding.bio')}</label>
                            <div className="relative group">
                                <textarea
                                    {...register('bio')}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-nexus-green/50 focus:bg-white/10 transition-all font-medium resize-none"
                                    placeholder="Brief operational history or personal tagline..."
                                />
                                <div className="absolute inset-0 rounded-xl bg-nexus-green/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                            </div>
                            {errors.bio && <p className="text-[10px] text-red-500 uppercase font-black tracking-wide pl-1">{errors.bio.message}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 flex gap-4">
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest border border-white/5"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] bg-nexus-green hover:bg-nexus-green/90 text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Icon icon="mdi:loading" className="animate-spin text-xl" />
                                        Processsing...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:check-all" className="text-xl" />
                                        {isEditMode ? "Save Changes" : t('onboarding.save')}
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </motion.div>
        </div>
    );
}
