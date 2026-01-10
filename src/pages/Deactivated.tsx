import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function Deactivated() {
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason');

    return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-red-500 selection:text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black opacity-80" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 max-w-xl w-full"
            >
                {/* Main Card */}
                <div className="bg-[#09090b]/80 backdrop-blur-2xl border border-red-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.15)] relative">

                    {/* Top warning strip */}
                    <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

                    <div className="p-10 md:p-14 text-center space-y-8">

                        {/* Status Icon */}
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-red-500 rounded-full blur-2xl"
                            />
                            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 relative z-10 mx-auto">
                                <Icon icon="mdi:shield-lock-outline" className="text-5xl text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            </div>
                        </div>

                        {/* Title & Desc */}
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black text-white uppercase tracking-tight">
                                Access <span className="text-red-500">Terminated</span>
                            </h1>
                            <p className="text-lg text-gray-400 leading-relaxed">
                                Your user privileges have been revoked by the system administrator. All session tokens are invalid.
                            </p>
                        </div>

                        {/* Reason Box */}
                        {reason && (
                            <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-5 text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-50">
                                    <Icon icon="mdi:alert" className="text-red-500/30 text-4xl" />
                                </div>
                                <span className="text-[10px] text-red-400 uppercase font-bold tracking-[0.2em] mb-2 block">
                                    Termination Protocol :: Reason
                                </span>
                                <p className="text-white font-mono text-sm leading-relaxed border-l-2 border-red-500 pl-3">
                                    "{reason}"
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 flex flex-col gap-4">
                            <a
                                href="mailto:nexus4d.academy@gmail.com"
                                className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Icon icon="mdi:lifebuoy" className="text-xl" />
                                Contact Command
                            </a>

                            <Link
                                to="/Login"
                                className="text-gray-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <Icon icon="mdi:arrow-left" /> Return to Login Page
                            </Link>
                        </div>
                    </div>

                    {/* Footer decorative tech text */}
                    <div className="bg-black/40 p-4 border-t border-white/5 flex justify-between text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                        <span>ERR_USR_DEACTIVATED</span>
                        <span>ID: {Math.floor(Math.random() * 999999).toString().padStart(6, '0')}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
