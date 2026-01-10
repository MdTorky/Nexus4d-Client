import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import type { Avatar } from '../../types';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    xpEarned: number;
    avatar?: Avatar | null;
}

export function RewardModal({ isOpen, onClose, xpEarned, avatar }: RewardModalProps) {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Confetti */}
                    <Confetti
                        width={windowSize.width}
                        height={windowSize.height}
                        numberOfPieces={200}
                        recycle={false}
                        colors={['#22c55e', '#10b981', '#ffffff', '#eab308']}
                    />

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-md bg-[#09090b] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.2)]"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-nexus-green/20 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />

                        <div className="relative p-8 text-center">
                            {/* Icon Header */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-24 h-24 mx-auto bg-gradient-to-tr from-nexus-green to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.5)] border-4 border-[#09090b]"
                            >
                                <Icon icon="mdi:trophy-variant" className="text-4xl text-black" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl font-black text-white mb-2 uppercase tracking-tight"
                            >
                                Mission Complete
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-400 mb-8 font-light"
                            >
                                Outstanding performance, Cadet.
                            </motion.p>

                            <div className="space-y-4">
                                {/* XP Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-nexus-green/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-nexus-green/10 rounded-lg text-nexus-green">
                                            <Icon icon="mdi:lightning-bolt" className="text-2xl" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Experience</p>
                                            <p className="text-white font-bold">XP Gained</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-black text-nexus-green">+{xpEarned}</span>
                                </motion.div>

                                {/* Avatar Unlock */}
                                {avatar && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-1 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300">
                                            Avatar Drop
                                        </div>

                                        <div className="flex items-center gap-4 p-3">
                                            <div className="w-16 h-16 bg-black/50 rounded-xl p-2 border border-white/10">
                                                <img src={avatar.image_url} alt={avatar.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-purple-400 mb-1 flex items-center gap-1">
                                                    <Icon icon="mdi:lock-open-variant" /> New Nexon Unlocked
                                                </p>
                                                <p className="text-white font-bold text-lg leading-none">{avatar.name}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                onClick={onClose}
                                className="mt-8 w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-nexus-green hover:scale-[1.02] transition-all shadow-xl"
                            >
                                Claim Rewards
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
