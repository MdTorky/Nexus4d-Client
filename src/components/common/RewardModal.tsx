import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import type { Avatar } from '../../types';

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    xpEarned: number;
    avatar?: Avatar | null;
}

export function RewardModal({ isOpen, onClose, xpEarned, avatar }: RewardModalProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!show && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content */}
            <div className={`relative bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] transform transition-all duration-500 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>

                {/* Confetti / Rays (Simplified CSS) */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nexus-green/5 blur-3xl rounded-full animate-pulse" />
                </div>

                <div className="relative z-10">
                    <div className="mb-6 inline-flex p-4 rounded-full bg-nexus-green/20 text-nexus-green mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        <Icon icon="mdi:trophy" width="48" height="48" className="animate-bounce" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Level Up!</h2>
                    <p className="text-gray-400 mb-8">You've completed the course!</p>

                    <div className="space-y-6">
                        {/* XP Reward */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                            <span className="text-gray-400 font-medium">XP Earned</span>
                            <span className="text-xl font-bold text-nexus-green flex items-center gap-1">
                                +{xpEarned} <Icon icon="mdi:star-four-points" />
                            </span>
                        </div>

                        {/* Avatar Reward */}
                        {avatar && (
                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
                                <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">Target Acquired</p>
                                <div className="aspect-square w-32 mx-auto bg-black/50 rounded-xl overflow-hidden mb-3 border border-white/10 relative group">
                                    <img
                                        src={avatar.image_url}
                                        alt={avatar.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 p-3"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-2">
                                        <span className="text-xs font-bold text-white max-w-full truncate">{avatar.name}</span>
                                    </div>
                                </div>
                                <span className="text-purple-300 text-sm font-medium flex items-center justify-center gap-2">
                                    <Icon icon="mdi:check-decagram" /> New Nexon Unlocked
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-8 w-full py-3.5 px-6 rounded-xl font-bold bg-nexus-green text-black hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                    >
                        Collect Rewards
                    </button>
                </div>
            </div>
        </div>
    );
}
