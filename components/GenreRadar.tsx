import React from 'react';
import { Swords, Heart, Ghost, Zap, Search, Book } from 'lucide-react';

interface GenreRadarProps {
    stats: { [key: string]: number };
}

const GENRE_CONFIG: { [key: string]: { icon: any, color: string, label: string } } = {
    'Fantasy': { icon: Swords, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30', label: 'Fantasy' },
    'Romance': { icon: Heart, color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30', label: 'Romance' },
    'Horror': { icon: Ghost, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30', label: 'Horror' },
    'Sci-Fi': { icon: Zap, color: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30', label: 'Sci-Fi' },
    'Mystery': { icon: Search, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800', label: 'Mystery' },
    'Other': { icon: Book, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800', label: 'General' }
};

export const GenreRadar: React.FC<GenreRadarProps> = ({ stats }) => {
    // Normalize stats for display (max 1000 for full bar)
    const MAX_XP = 1000;
    
    // Sort genres by XP desc
    const sortedGenres = Object.entries(stats)
        .sort(([, a], [, b]) => (b as number) - (a as number));

    if (sortedGenres.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 text-sm">
                No genre data yet. Read some books!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Mastery</h3>
            {sortedGenres.map(([genre, xp]) => {
                const config = GENRE_CONFIG[genre] || GENRE_CONFIG['Other'];
                const Icon = config.icon;
                const percentage = Math.min(((xp as number) / MAX_XP) * 100, 100);
                
                return (
                    <div key={genre} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                                <div className={`p-1.5 rounded-lg mr-2 ${config.color}`}>
                                    <Icon size={14} />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{genre}</span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">{xp} XP</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
