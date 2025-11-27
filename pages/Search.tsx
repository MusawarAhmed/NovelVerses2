import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { NovelService } from '../services/novelService';
import { Novel } from '../types';
import { Search as SearchIcon, Star, Clock, BookOpen } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/Anim';
import { SEO } from '../components/SEO';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [results, setResults] = useState<Novel[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
        const novels = await NovelService.getNovels();
        if (!searchQuery) {
          setResults([]);
        } else {
          const lowerQ = searchQuery.toLowerCase().trim();
          
          // Weighted Search Algorithm
          const scoredResults = novels.map(novel => {
            let score = 0;
            
            // 1. Exact Tag Match (Highest Priority for clicking tags)
            if (novel.tags.some(t => t.toLowerCase() === lowerQ)) score += 100;
            
            // 2. Exact Title Match
            else if (novel.title.toLowerCase() === lowerQ) score += 90;
            
            // 3. Title contains query
            else if (novel.title.toLowerCase().includes(lowerQ)) score += 60;
            
            // 4. Author match
            else if (novel.author.toLowerCase().includes(lowerQ)) score += 40;
            
            // 5. Partial Tag Match
            else if (novel.tags.some(t => t.toLowerCase().includes(lowerQ))) score += 30;
            
            // 6. Description Match (Lowest Priority)
            else if (novel.description.toLowerCase().includes(lowerQ)) score += 10;
    
            return { novel, score };
          });
    
          // Filter out zero scores and sort by score descending
          const sorted = scoredResults
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.novel);
    
          setResults(sorted);
        }
    };
    fetchResults();
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      <SEO 
        title={searchQuery ? `Search: ${searchQuery}` : "Search Novels"} 
        description={`Search results for ${searchQuery} on NovelVerse.`}
      />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center mb-2">
          <SearchIcon className="mr-3 text-primary" /> 
          {searchQuery ? 'Search Results' : 'Search Library'}
        </h2>
        {searchQuery && (
            <p className="text-slate-500 dark:text-slate-400">
                Found {results.length} result{results.length !== 1 && 's'} for <span className="font-bold text-slate-900 dark:text-white">"{searchQuery}"</span>
            </p>
        )}
      </div>

      {results.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((novel) => (
            <StaggerItem key={novel.id}>
                <Link to={`/novel/${novel.id}`} className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 overflow-hidden h-full flex flex-col">
                <div className="relative aspect-[2/3] overflow-hidden">
                    <img 
                    src={novel.coverUrl} 
                    alt={novel.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md flex items-center">
                    <Star size={12} className="text-yellow-400 mr-1 fill-yellow-400" /> {novel.rating}
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">{novel.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{novel.author}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                    {novel.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                        {tag}
                        </span>
                    ))}
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center"><Clock size={12} className="mr-1"/> {novel.status}</span>
                        <span className="flex items-center"><BookOpen size={12} className="mr-1"/> {novel.category}</span>
                    </div>
                </div>
                </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <FadeIn className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
          <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <SearchIcon size={40} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No matches found</h3>
          <p className="text-slate-500 mt-2">Try searching for tags like "System", "Magic", or "Romance".</p>
          <Link to="/" className="mt-6 inline-block text-primary font-medium hover:underline">Return Home</Link>
        </FadeIn>
      )}
    </div>
  );
};