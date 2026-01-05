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
import { useToast } from '../../context/ToastContext'; // Import hook

import { useTranslation } from 'react-i18next';

// Moved inside component or use a function to define schema with t


export default function Login() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    // const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { showToast } = useToast();

    const loginSchema = z.object({
        email: z.string().email(t('common.email') + ' invalid'), // Simplified validation msg for now or add keys
        password: z.string().min(1, t('common.password') + ' required'),
    });

    type LoginData = z.infer<typeof loginSchema>;

    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginData) => {
        setIsLoading(true); // Start Loading
        console.log("1. Submitting...");

        try {
            const response = await api.post('/auth/login', data);

            console.log("2. Success:", response.data);
            login(response.data);
            showToast('Welcome back! Login successful.', 'success');
            navigate('/');
        } catch (err: any) {
            console.error("X. Error:", err);

            // Check if verification is required
            if (err.response?.data?.requiresVerification) {
                showToast('Please verify your email address.', 'info');
                navigate('/verify-email', {
                    state: { email: err.response.data.email || data.email }
                });
                return;
            }

            // robust error message extraction
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.error || // sometimes backend sends 'error' instead of 'message'
                'Invalid email or password';

            // This triggers the Toast. If ToastContext is fixed, this won't crash.
            showToast(errorMsg, 'error');

        } finally {
            // 3. THIS ALWAYS RUNS. The button will UN-FREEZE even if there is an error.
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await api.post('/auth/google', {
                googleToken: credentialResponse.credential,
            });
            login(response.data);
            showToast('Google login successful!', 'success');
            navigate('/');
        } catch (err: any) {
            showToast('Google Sign In failed.', 'error');
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
                    {t('common.welcome')}
                </h1>
                <p className="text-gray-400">
                    The future of educational excellence. minimalist, structured, and effective.
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
                            {t('auth.backToLearning')}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {t('auth.enterCredentials')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">



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

                        <Button disabled={isLoading} className="w-full">
                            {isLoading ? t('auth.loggingIn') : t('auth.signIn')}
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
                                onError={() => showToast('Google Sign In Failed', 'error')}
                                theme="filled_black"
                                shape="circle"
                                width="100%"
                            />
                        </div>

                    </form>

                    <p className="text-center text-sm text-gray-400">
                        {t('auth.dontHaveAccount')}?{' '}
                        <Link to="/register" className="text-nexus-green hover:underline">
                            {t('auth.signUp')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
