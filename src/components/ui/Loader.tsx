import { motion } from 'framer-motion';

type LoaderProps = {
    className?: string;
    text?: string;
};

export const Loader = ({ className = "", text = "Loading Data" }: LoaderProps) => {
    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div className="relative h-16 w-16">
                {/* Outer Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-4 border-nexus-card border-t-nexus-green"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Ring */}
                <motion.div
                    className="absolute inset-2 rounded-full border-4 border-nexus-card border-b-nexus-white"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Center Pulse */}
                <motion.div
                    className="absolute inset-[35%] rounded-full bg-nexus-green"
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            </div>
            {text && (
                <p className="text-xs font-medium uppercase tracking-widest text-gray-500 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export const FullScreenLoader = () => {
    return (
        <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center bg-nexus-black/90 backdrop-blur-md">
            <Loader />
        </div>
    );
};
