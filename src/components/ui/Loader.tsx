import { motion } from 'framer-motion';

type LoaderProps = {
    className?: string;
    text?: string;
    size?: 'sm' | 'md' | 'lg';
};

export const Loader = ({ className = "", text = "Initializing", size = 'md' }: LoaderProps) => {

    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-16 w-16',
        lg: 'h-24 w-24'
    };

    const containerSize = sizes[size];

    return (
        <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
            <div className={`relative ${containerSize}`}>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-nexus-green/20 blur-xl rounded-full animate-pulse" />

                {/* Outer Ring - Dashed */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-dashed border-nexus-green/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {/* Middle Ring - Segments */}
                <motion.div
                    className="absolute inset-1 rounded-full border-t-2 border-r-2 border-nexus-green"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Ring - Fast */}
                <motion.div
                    className="absolute inset-3 rounded-full border-b-2 border-l-2 border-white/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />

                {/* Core */}
                <motion.div
                    className="absolute inset-[30%] bg-nexus-green rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                    animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            {text && (
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-nexus-green animate-pulse">
                        {text}
                    </span>
                    <motion.div
                        className="h-0.5 bg-gray-800 w-24 rounded-full overflow-hidden"
                    >
                        <motion.div
                            className="h-full bg-nexus-green"
                            animate={{ x: [-100, 100] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export const FullScreenLoader = () => {
    return (
        <div className="fixed inset-0 z-[200] flex h-screen w-screen items-center justify-center bg-[#09090b] text-white">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />

            <Loader size="lg" text="System Loading..." />

            <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    Nexus 4D // Secure Connection
                </p>
            </div>
        </div>
    );
};
