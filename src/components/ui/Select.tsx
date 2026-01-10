import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from './Button';

export interface SelectOption {
    label: string;
    value: string;
    icon?: string;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    searchable?: boolean;
    className?: string;
    error?: string;
}

export default function Select({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    label,
    searchable = true,
    className,
    error
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
        }
    }, [isOpen]);

    return (
        <div className={cn("relative w-full group", className)} ref={containerRef}>
            {label && (
                <label
                    className={cn(
                        "block text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300",
                        isOpen ? "text-nexus-green" : "text-gray-500",
                        error && "text-red-500"
                    )}
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Glow Effect */}
                <div
                    className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r from-nexus-green to-emerald-500 opacity-0 blur transition-opacity duration-500 -z-10",
                        isOpen && !error && "opacity-20",
                        error && "from-red-500 to-orange-500 opacity-20"
                    )}
                />

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex w-full items-center justify-between rounded-xl border bg-black/40 px-4 py-3.5 text-left text-sm text-white transition-all duration-300 backdrop-blur-md outline-none",
                        "border-white/10 hover:border-white/20",
                        isOpen && "bg-black/60 border-nexus-green/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]",
                        error && "border-red-500/50 text-red-100 placeholder-red-300/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    )}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {selectedOption?.icon && (
                            <Icon icon={selectedOption.icon} className="h-5 w-5 flex-shrink-0 text-nexus-green" />
                        )}
                        <span className={cn("truncate font-medium", !selectedOption && "text-gray-500")}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                    <Icon
                        icon="akar-icons:chevron-down"
                        className={cn("ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-300", isOpen && "rotate-180 text-nexus-green")}
                    />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#09090b]/95 backdrop-blur-xl shadow-2xl"
                    >
                        {searchable && (
                            <div className="border-b border-white/5 p-2">
                                <div className="relative">
                                    <Icon icon="akar-icons:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full rounded-lg bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-colors"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-all duration-200 border-l-2 border-transparent hover:bg-white/5",
                                            value === option.value
                                                ? "bg-nexus-green/10 text-nexus-green border-nexus-green"
                                                : "text-gray-300 hover:text-white"
                                        )}
                                    >
                                        {option.icon && (
                                            <Icon icon={option.icon} className="h-4 w-4 flex-shrink-0" />
                                        )}
                                        <span className="font-medium">{option.label}</span>
                                        {value === option.value && (
                                            <Icon icon="akar-icons:check" className="ml-auto h-4 w-4 text-nexus-green" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center text-sm text-gray-500">
                                    <Icon icon="mdi:magnify-remove-outline" className="text-2xl mx-auto mb-2 opacity-50" />
                                    No options found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
