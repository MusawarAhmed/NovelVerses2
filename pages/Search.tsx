import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { NovelService } from '../services/novelService';
import { Novel } from '../types';
import { Search as SearchIcon, Star, Clock, BookOpen, User as UserIcon } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/Anim';
import { SEO } from '../components/SEO';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [results, setResults] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
        setLoading(true);
        try {
            if (!searchQuery) {
              setResults([]);
            } else {
              // Use server-side search
              const novels = await NovelService.getNovels({ search: searchQuery, limit: 50 });
              setResults(novels);
            }
        } catch (e) {
            console.error("Search failed", e);
        } finally {
            setLoading(false);
        }
    };
    fetchResults();
  }, [searchQuery]);

  const getNovelLink = (n: Novel) => {
      if (n.slug) return `/novel/${n.slug}_${n.id}`;
      return `/novel/${n.id}`;
  };

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
                {loading ? 'Searching...' : `Found ${results.length} result${results.length !== 1 ? 's' : ''} for `}
                <span className="font-bold text-slate-900 dark:text-white">"{searchQuery}"</span>
            </p>
        )}
      </div>

      {loading ? (
          <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
      ) : results.length > 0 ? (
        <StaggerContainer className="space-y-6">
          {results.map((novel) => (
            <StaggerItem key={novel.id} className="w-full">
                <Link to={getNovelLink(novel)} className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 overflow-hidden relative z-10">
                    <div className="flex flex-col sm:flex-row h-full sm:h-48">
                        {/* Image */}
                        <div className="relative w-full sm:w-32 md:w-40 flex-shrink-0 h-48 sm:h-full">
                            <img 
                                src={novel.coverUrl} 
                                alt={novel.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md flex items-center">
                                <Star size={12} className="text-yellow-400 mr-1 fill-yellow-400" /> {novel.rating}
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5 flex flex-col flex-grow justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">{novel.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${novel.status === 'Ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {novel.status}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    <UserIcon size={14} className="mr-1" /> {novel.author}
                                    <span className="mx-2">•</span>
                                    <BookOpen size={14} className="mr-1" /> {novel.category}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                                    {novel.description}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {novel.tags.slice(0, 5).map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
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