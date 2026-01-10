import { type InputHTMLAttributes, forwardRef, type ReactNode, useState } from 'react';
import { cn } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    endIcon?: ReactNode;
    startIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, endIcon, startIcon, onFocus, onBlur, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            onBlur?.(e);
        };

        return (
            <div className="w-full group">
                {label && (
                    <label
                        className={cn(
                            "block text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300",
                            isFocused ? "text-nexus-green" : "text-gray-500",
                            error && "text-red-500"
                        )}
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {/* Glow Effect Background */}
                    <div
                        className={cn(
                            "absolute inset-0 rounded-xl bg-gradient-to-r from-nexus-green to-emerald-500 opacity-0 blur transition-opacity duration-500 -z-10",
                            isFocused && !error && "opacity-20",
                            error && "from-red-500 to-orange-500 opacity-20"
                        )}
                    />

                    {startIcon && (
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10",
                            isFocused ? "text-nexus-green" : "text-gray-500",
                            error && "text-red-500"
                        )}>
                            {startIcon}
                        </div>
                    )}

                    <input
                        type={type}
                        className={cn(
                            // Base styles
                            "flex w-full rounded-xl border bg-black/40 px-4 py-3.5 text-sm text-white transition-all duration-300 backdrop-blur-md outline-none",
                            // Border & Colors
                            "border-white/10 hover:border-white/20",
                            // Focus State
                            "focus:bg-black/60 focus:border-nexus-green/50 focus:shadow-[0_0_20px_rgba(34,197,94,0.1)]",
                            // Icons padding
                            startIcon && "pl-11",
                            endIcon && "pr-11",
                            // Error State
                            error && "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.1)] text-red-100 placeholder-red-300/50",
                            // Disabled State
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            className
                        )}
                        ref={ref}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...props}
                    />

                    {endIcon && (
                        <div className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
                            isFocused ? "text-nexus-green" : "text-gray-500",
                            error && "text-red-500"
                        )}>
                            {endIcon}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="text-xs text-red-400 mt-1.5 font-medium ml-1 flex items-center gap-1 overflow-hidden"
                        >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
