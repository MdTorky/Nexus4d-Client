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
    className?: string;
    error?: string;
}

export default function Select({
    options,
    value,
    onChange,
    placeholder = "Select an option",
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset search when opening
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
        }
    }, [isOpen]);

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex w-full items-center justify-between rounded-md border bg-nexus-black px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-nexus-green",
                    error
                        ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-600 text-nexus-white focus:border-nexus-green placeholder:text-gray-400",
                    isOpen && "border-nexus-green ring-1 ring-nexus-green"
                )}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selectedOption?.icon && (
                        <Icon icon={selectedOption.icon} className="h-5 w-5 flex-shrink-0 text-nexus-green" />
                    )}
                    <span className={cn("truncate", !selectedOption && "text-gray-400")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <Icon
                    icon="akar-icons:chevron-down"
                    className={cn("ml-2 h-4 w-4 flex-shrink-0 transition-transform", isOpen && "rotate-180")}
                />
            </button>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-nexus-card bg-nexus-black shadow-lg"
                    >
                        {/* Search Input */}
                        <div className="sticky top-0 border-b border-nexus-card bg-nexus-black p-2">
                            <div className="relative">
                                <Icon icon="akar-icons:search" className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full rounded-md bg-nexus-card/50 py-1 pl-8 pr-2 text-sm text-nexus-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-nexus-green"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-nexus-card hover:text-nexus-green",
                                            value === option.value ? "bg-nexus-green/10 text-nexus-green" : "text-gray-300"
                                        )}
                                    >
                                        {option.icon && (
                                            <Icon icon={option.icon} className="h-4 w-4 flex-shrink-0" />
                                        )}
                                        <span>{option.label}</span>
                                        {value === option.value && (
                                            <Icon icon="akar-icons:check" className="ml-auto h-4 w-4" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-gray-500">
                                    No options found.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
