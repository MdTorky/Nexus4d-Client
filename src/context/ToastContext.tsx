import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@iconify/react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToast({ message, type, id });
        // Auto-hide after 3 seconds
        setTimeout(() => {
            setToast((current) => (current?.id === id ? null : current));
        }, 3000);
    }, []);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return 'mdi:check-circle';
            case 'error': return 'mdi:alert-circle';
            case 'warning': return 'mdi:alert';
            default: return 'mdi:information';
        }
    };

    const getColor = (type: ToastType) => {
        switch (type) {
            case 'success': return 'text-nexus-green';
            case 'error': return 'text-red-500';
            case 'warning': return 'text-yellow-400';
            default: return 'text-blue-400';
        }
    };

    const getGlow = (type: ToastType) => {
        switch (type) {
            case 'success': return 'shadow-[0_0_30px_rgba(34,197,94,0.3)]';
            case 'error': return 'shadow-[0_0_30px_rgba(239,68,68,0.3)]';
            case 'warning': return 'shadow-[0_0_30px_rgba(250,204,21,0.3)]';
            default: return 'shadow-[0_0_30px_rgba(96,165,250,0.3)]';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Global Toast UI Component */}
            <AnimatePresence mode="wait">
                {toast && (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                        exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`fixed bottom-10 left-1/2 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#09090b]/90 backdrop-blur-xl border border-white/10 ${getGlow(toast.type)}`}
                    >
                        {/* Status Icon */}
                        <div className={`p-2 rounded-full bg-white/5 border border-white/5 ${getColor(toast.type)}`}>
                            <Icon icon={getIcon(toast.type)} width={24} />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                            {/*  Optional: Add title if we want to expand functionality later
                            <span className={`text-xs font-bold uppercase tracking-wider ${getColor(toast.type)}`}>
                                {toast.type}
                            </span> */}
                            <span className="font-medium text-white text-sm md:text-base">
                                {toast.message}
                            </span>
                        </div>

                        {/* Close/Dismiss indicator (optional, but clean) */}
                        <div className="h-8 w-[1px] bg-white/10 mx-1" />
                        <button
                            onClick={() => setToast(null)}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <Icon icon="mdi:close" width={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};