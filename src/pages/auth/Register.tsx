import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';

import { useTranslation } from 'react-i18next';

// Schema moved inside component

export default function Register() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { showToast } = useToast();

    const registerSchema = z.object({
        username: z.string().min(3, t('auth.username') + ' min 3 chars'),
        email: z.string().email(t('common.email') + ' invalid'),
        password: z.string()
            .min(8, 'Min 8 chars')
            .regex(/[A-Z]/, '1 Uppercase')
            .regex(/[0-9]/, '1 Number')
            .regex(/[^A-Za-z0-9]/, '1 Special'),
    });

    type RegisterData = z.infer<typeof registerSchema>;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterData) => {
        try {
            await api.post('/auth/register', data);
            // login(response.data); // Don't login yet
            showToast('Account created! Please verify your email.', 'success');
            navigate('/verify-email', { state: { email: data.email } });
        } catch (err: any) {
            // Handles "User already exists" or Zod errors
            const errorMsg = err.response?.data?.message || err.response?.data?.errors || 'Registration failed';
            showToast(errorMsg, 'error');
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await api.post('/auth/google', {
                googleToken: credentialResponse.access_token,
            });
            login(response.data);
            navigate('/');
        } catch (err: any) {
            console.error('Google Sign In Error:', err);
            setError('Google Sign In failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-nexus-black text-white selection:bg-nexus-green selection:text-black overflow-hidden relative flex">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] bg-nexus-green/10 rounded-full blur-[120px]" />
            </div>

            {/* Left Side - Hero/Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden w-1/2 flex-col justify-center px-16 lg:flex relative z-10"
            >
                <motion.img
                    src="/Logo Horizontal.png"
                    alt="Nexus 4D"
                    className="w-64 mb-12 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                />

                <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter leading-tight">
                    INITIATE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-nexus-green">
                        SEQUENCE
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                    Join the ranks of the elite. Your personalized learning dashboard and gamified progression system await.
                </p>
            </motion.div>

            {/* Right Side - Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center px-6 relative z-10 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md bg-black/40 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
                >
                    <div className="text-center mb-8">
                        {/* Mobile Logo */}
                        <img src="/Logo Horizontal.png" alt="Nexus 4D" className="w-48 mx-auto mb-6 lg:hidden" />

                        <h2 className="text-3xl font-bold tracking-tight mb-2">
                            {t('auth.createAccount')}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {t('auth.enterDetails')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Input
                            label={t('auth.username')}
                            type="text"
                            placeholder="johndoe"
                            error={errors.username?.message}
                            {...register('username')}
                            className="bg-white/5 border-white/10 focus:border-nexus-green text-white"
                        />
                        <Input
                            label={t('common.email')}
                            type="email"
                            placeholder="name@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                            className="bg-white/5 border-white/10 focus:border-nexus-green text-white"
                        />
                        <Input
                            label={t('common.password')}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password')}
                            className="bg-white/5 border-white/10 focus:border-nexus-green text-white"
                            endIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer flex focus:outline-none hover:text-nexus-green transition-colors">
                                    <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} width={20} />
                                </button>
                            }
                        />

                        <Button disabled={isSubmitting} className="w-full py-6 text-lg font-bold bg-nexus-green text-black hover:bg-nexus-green/90 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all">
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:loading" className="animate-spin" />
                                    {t('auth.creatingAccount')}
                                </div>
                            ) : t('auth.signUp')}
                        </Button>

                        <div className="text-center text-xs text-gray-500 mt-4">
                            {t('auth.agreeToTerms')} <Link to="/terms" className="text-nexus-green hover:underline">{t('auth.termsOfService')}</Link>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-gray-500 font-mono">{t('auth.orContinueWith')}</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleAuthButton
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Sign In Failed')}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-8">
                        {t('auth.alreadyHaveAccount')}?{' '}
                        <Link to="/login" className="text-nexus-green font-bold hover:underline">
                            {t('auth.signIn')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
