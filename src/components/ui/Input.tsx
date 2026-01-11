import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, ...props }, ref) => {
    return (
        <div className="w-full space-y-2">
            {label && <label className="text-sm font-medium text-gray-300 ml-1">{label}</label>}
            <div className="relative group">
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-glass-100 border border-glass-border rounded-xl px-4 py-3 outline-none text-white placeholder-gray-500 transition-all duration-300",
                        "focus:border-aiesec-blue focus:bg-glass-200 focus:shadow-[0_0_15px_rgba(3,126,243,0.3)]",
                        error && "border-red-500 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-aiesec-blue to-neon-purple opacity-0 group-focus-within:opacity-20 pointer-events-none -z-10 blur-md transition-opacity duration-300" />
            </div>
            {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
export { Input };
