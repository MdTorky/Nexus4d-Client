import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

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

            login(response.data);
            showToast('Identity Confirmed. Access Granted.', 'success');
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
            showToast('New secure code transmitted.', 'success');
            setCooldown(60);
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
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-nexus-green/10 via-black to-black opacity-80" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header Graphic */}
                <div className="text-center mb-10 relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-nexus-green/10 border border-nexus-green/30 mb-6 relative">
                        <div className="absolute inset-0 bg-nexus-green/20 blur-xl rounded-full animate-pulse-slow" />
                        <Icon icon="mdi:shield-check-outline" className="text-4xl text-nexus-green relative z-10" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight uppercase">Security Check</h2>
                    <p className="text-gray-400 mt-2 font-light">
                        Enter the 6-digit code sent to <br />
                        <span className="text-nexus-green font-mono font-bold tracking-wider">{email || 'your email'}</span>
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {!email && (
                        <div className="mb-6 group">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2 block group-focus-within:text-nexus-green transition-colors">
                                Verify Identity
                            </label>
                            <input
                                type="email"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-nexus-green/50 focus:ring-1 focus:ring-nexus-green/50 transition-all outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="text-center">
                            <input
                                {...register('code')}
                                type="text"
                                maxLength={6}
                                className="w-full bg-transparent text-center text-5xl font-mono font-bold tracking-[0.5em] text-white placeholder-white/10 outline-none border-b-2 border-white/10 focus:border-nexus-green transition-colors pb-4"
                                placeholder="******"
                                autoComplete="off"
                            />
                            {errors.code && (
                                <p className="mt-4 text-sm text-red-400 flex items-center justify-center gap-2">
                                    <Icon icon="mdi:alert-circle" /> {errors.code.message}
                                </p>
                            )}
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full py-4 bg-nexus-green text-black font-black uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Icon icon="mdi:loading" className="animate-spin text-xl" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Authenticate <Icon icon="mdi:arrow-right" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-400 mb-4">Code not received?</p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={cooldown > 0}
                            className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all ${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'text-nexus-green border-nexus-green/30'}`}
                        >
                            {cooldown > 0 ? `Retry in ${cooldown}s` : 'Resend Code'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-gray-600 mt-8 font-mono uppercase tracking-[0.2em]">
                    Restricted Area // Authorized Access Only
                </p>
            </motion.div>
        </div>
    );
}
