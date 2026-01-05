import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

const verifySchema = z.object({
    code: z.string().length(6, 'Verification code must be 6 digits'),
});

type VerifyData = z.infer<typeof verifySchema>;

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Get email from router state (passed from Register page) or ask user to re-enter if missing
    const emailFromState = location.state?.email;
    const [email, setEmail] = useState(emailFromState || '');

    const { register, handleSubmit, formState: { errors } } = useForm<VerifyData>({
        resolver: zodResolver(verifySchema),
    });

    const onSubmit = async (data: VerifyData) => {
        if (!email) {
            showToast('Email is missing. Please sign up or login again.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/verify-email', {
                email,
                code: data.code,
            });

            // On success, we get the same auth payload as login
            login(response.data);
            showToast('Email verified successfully!', 'success');
            navigate('/');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Verification failed';
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;

        try {
            await api.post('/auth/resend-code', { email });
            showToast('New verification code sent!', 'success');
            setCooldown(60); // Start 60s cooldown
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to resend code';
            showToast(msg, 'error');
        }
    };

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-nexus-black px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8 rounded-xl bg-nexus-card p-8 shadow-2xl border border-gray-800"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-nexus-white">{t('auth.verifyEmail')}</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {t('auth.sentCode')}{' '}
                        <span className="font-medium text-nexus-green">
                            {email || t('common.email')}
                        </span>
                    </p>
                </div>

                {!email && (
                    <div className="mb-4">
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full rounded-lg border border-gray-700 bg-nexus-black px-4 py-2.5 text-nexus-white placeholder-gray-500 focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">
                            {t('auth.enterCode')}
                        </label>
                        <input
                            {...register('code')}
                            type="text"
                            maxLength={6}
                            className="w-full text-center tracking-widest text-2xl rounded-lg border border-gray-700 bg-nexus-black px-4 py-2.5 text-nexus-white placeholder-gray-500 focus:border-nexus-green focus:outline-none focus:ring-1 focus:ring-nexus-green"
                            placeholder="000000"
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
                        )}
                    </div>

                    <Button className="w-full" disabled={isLoading}>
                        {isLoading ? t('auth.verifying') : t('auth.verify')}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <p className="text-gray-400">
                        {t('auth.failedResend')}?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={cooldown > 0}
                            className={`text-nexus-green hover:underline transition-colors ${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {cooldown > 0 ? `${t('auth.resendCode')} (${cooldown}s)` : t('auth.resendCode')}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
