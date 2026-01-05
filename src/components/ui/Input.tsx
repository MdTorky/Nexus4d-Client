import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cn } from './Button';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    endIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, endIcon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-medium leading-none text-nexus-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        type={type}
                        className={cn(
                            'flex h-10 w-full rounded-md border border-nexus-card bg-nexus-black px-3 py-2 text-sm text-nexus-white ring-offset-nexus-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-red-500 focus-visible:ring-red-500',
                            endIcon && 'pr-10', // Add padding for icon
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {endIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {endIcon}
                        </div>
                    )}
                </div>
                {error && <p className="text-xs text-red-500 animate-pulse">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
