import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const onboardingSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    major: z.string().min(1, "Major is required"),
    semester: z.string().min(1, "Semester is required"),
    bio: z.string().max(500).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

import { Controller } from 'react-hook-form';
import Select, { type SelectOption } from '../components/ui/Select';

// ... (existing imports, keep z, zodResolver, etc.)

import { MAJORS, SEMESTERS } from '../constants/onboarding';

export default function Onboarding() {
    const { t } = useTranslation();

    // Generate localized options
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

    const navigate = useNavigate();
    const { user, updateUser } = useAuth(); // Destructure user here
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Pre-fill form when user data is available
    useState(() => {
        if (user) {
            reset({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                major: user.major || '',
                semester: user.semester || '',
                bio: user.bio || '',
            });
        }
    });

    const onSubmit = async (data: OnboardingFormData) => {
        setIsSubmitting(true);
        try {
            await api.put('/user/profile', data);
            // Update local user context immediately
            updateUser(data);
            showToast('Profile updated!', 'success');
            navigate('/dashboard');
        } catch (error: any) {
            showToast(error.message || 'Update failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-nexus-black px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-2xl border border-nexus-card bg-nexus-card/50 p-8 backdrop-blur-sm"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-nexus-white">
                        {t('onboarding.title')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {t('onboarding.subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">{t('onboarding.firstName')}</label>
                            <input
                                {...register('first_name')}
                                className="mt-1 block w-full rounded-md border border-gray-600 bg-nexus-black px-3 py-2 text-nexus-white focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green"
                            />
                            {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">{t('onboarding.lastName')}</label>
                            <input
                                {...register('last_name')}
                                className="mt-1 block w-full rounded-md border border-gray-600 bg-nexus-black px-3 py-2 text-nexus-white focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green"
                            />
                            {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('onboarding.major')}</label>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('onboarding.semester')}</label>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('onboarding.bio')}</label>
                        <textarea
                            {...register('bio')}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-nexus-black px-3 py-2 text-nexus-white focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green"
                        />
                        {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-nexus-green px-4 py-2 text-sm font-bold text-nexus-black transition-opacity hover:bg-nexus-green/90 disabled:opacity-50"
                    >
                        {isSubmitting ? t('onboarding.saving') : t('onboarding.save')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
