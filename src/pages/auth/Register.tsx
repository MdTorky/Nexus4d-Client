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
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '../../context/ToastContext';

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
                googleToken: credentialResponse.credential,
            });
            login(response.data);
            navigate('/');
        } catch (err: any) {
            console.error('Google Sign In Error:', err);
            setError('Google Sign In failed. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen bg-nexus-black">
            {/* Left Side - Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden w-1/2 flex-col justify-center bg-nexus-card p-12 lg:flex"
            >
                <h1 className="mb-4 text-3xl text-nexus-white">
                    Join <span className="text-nexus-green font-bold">Nexus 4D</span>
                </h1>
                <p className="text-gray-400">
                    Start your journey towards academic mastery today.
                </p>
            </motion.div>

            {/* Right Side - Form */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto w-full max-w-sm space-y-6"
                >
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-nexus-white">
                            {t('auth.createAccount')}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {t('auth.enterDetails')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        />
                        <Input
                            label={t('common.email')}
                            type="email"
                            placeholder="name@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Input
                            label={t('common.password')}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password')}
                            endIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer flex focus:outline-none hover:text-nexus-green transition-colors">
                                    <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} width={20} />
                                </button>
                            }
                        />

                        <Button disabled={isSubmitting} className="w-full">
                            {isSubmitting ? t('auth.creatingAccount') : t('auth.signUp')}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-nexus-black px-2 text-gray-400">{t('auth.orContinueWith')}</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Sign In Failed')}
                                theme="filled_black"
                                shape="circle"
                                width="100%"
                            />
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-400">
                        {t('auth.alreadyHaveAccount')}?{' '}
                        <Link to="/login" className="text-nexus-green hover:underline">
                            {t('auth.signIn')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
