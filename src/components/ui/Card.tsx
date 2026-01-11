import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-glass-100 backdrop-blur-xl border border-glass-border rounded-2xl shadow-glass p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';
export { Card };
