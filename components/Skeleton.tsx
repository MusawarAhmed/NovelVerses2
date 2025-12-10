import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
    className = "", 
    width, 
    height,
    variant = 'rectangular' 
}) => {
    const baseStyles = "animate-pulse bg-slate-200 dark:bg-slate-700/50";
    
    const variantStyles = {
        text: "rounded",
        circular: "rounded-full",
        rectangular: "rounded-md"
    };

    const style = {
        width: width,
        height: height
    };

    return (
        <div 
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        />
    );
};
