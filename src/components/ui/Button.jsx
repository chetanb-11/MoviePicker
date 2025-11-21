import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button Component
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} isLoading - Show loading spinner
 * @param {React.ReactNode} icon - Icon component to render
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 border border-transparent",
        secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
        ghost: "bg-transparent hover:bg-white/10 text-slate-200 hover:text-white",
        outline: "bg-transparent border border-slate-600 text-slate-300 hover:border-white hover:text-white"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-5 py-2.5 text-sm gap-2",
        lg: "px-8 py-4 text-base gap-3"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isLoading && icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

export default Button;
