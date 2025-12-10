import React from 'react';
import { Skeleton } from './Skeleton';

export const NovelCardSkeleton: React.FC = () => {
    return (
        <div className="flex bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 h-40">
            {/* Cover Image Placeholder */}
            <div className="w-28 flex-shrink-0">
                <Skeleton className="w-full h-full rounded-none" />
            </div>
            
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    {/* Title Placeholder */}
                    <Skeleton height={24} width="80%" className="mb-2" />
                    
                    {/* Description Placeholder */}
                    <div className="space-y-1.5 mb-3">
                        <Skeleton height={14} width="100%" />
                        <Skeleton height={14} width="90%" />
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    {/* Stats Placeholder */}
                    <div className="flex gap-3">
                        <Skeleton height={16} width={60} />
                        <Skeleton height={16} width={40} />
                    </div>
                    {/* Button Placeholder */}
                    <Skeleton height={24} width={70} />
                </div>
            </div>
        </div>
    );
};
