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
        <div className="min-h-screen bg-nexus-black text-white selection:bg-nexus-green selection:text-black overflow-hidden relative flex">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[30%] w-[500px] h-[500px] bg-nexus-green/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
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
                    className="w-64 mb-12 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                />

                <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter leading-tight">
                    RESUME <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-green to-blue-500">
                        MISSION
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                    Welcome back, operative. The leaderboard has shifted since you last logged in. Re-engage to reclaim your rank.
                </p>

                {/* <img src="Logo Horizontal.png" className='my-10 w-100' /> */}

            </motion.div>

            {/* Right Side - Login Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center px-6 relative z-10">
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
                            {t('auth.backToLearning')}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {t('auth.enterCredentials')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                        <Button disabled={isLoading} className="w-full py-6 text-lg font-bold bg-nexus-green text-black hover:bg-nexus-green/90 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:loading" className="animate-spin" />
                                    {t('auth.loggingIn')}
                                </div>
                            ) : t('auth.signIn')}
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-gray-500 font-mono">{t('auth.orContinueWith')}</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => showToast('Google Sign In Failed', 'error')}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                                text="signin_with"
                            />
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-8">
                        {t('auth.dontHaveAccount')}?{' '}
                        <Link to="/register" className="text-nexus-green font-bold hover:underline">
                            {t('auth.signUp')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
