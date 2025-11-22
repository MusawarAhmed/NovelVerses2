import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MockBackendService } from '../services/mockBackend';
import { Novel } from '../types';
import { Search as SearchIcon, Star, Clock } from 'lucide-react';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [results, setResults] = useState<Novel[]>([]);

  useEffect(() => {
    const novels = MockBackendService.getNovels();
    if (!searchQuery) {
      setResults([]);
    } else {
      const lowerQ = searchQuery.toLowerCase();
      const filtered = novels.filter(n => 
        n.title.toLowerCase().includes(lowerQ) || 
        n.author.toLowerCase().includes(lowerQ) ||
        n.tags.some(t => t.toLowerCase().includes(lowerQ))
      );
      setResults(filtered);
    }
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center mb-2">
          <SearchIcon className="mr-3 text-primary" /> 
          Search Results
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
            Showing results for <span className="font-bold text-slate-900 dark:text-white">"{searchQuery}"</span>
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {results.map((novel) => (
            <Link key={novel.id} to={`/novel/${novel.id}`} className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 overflow-hidden">
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
              <div className="p-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">{novel.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{novel.author}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {novel.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                   <span className="flex items-center"><Clock size={12} className="mr-1"/> {novel.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
          <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <SearchIcon size={40} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No matches found</h3>
          <p className="text-slate-500 mt-2">Try checking your spelling or use different keywords.</p>
          <Link to="/" className="mt-6 inline-block text-primary font-medium hover:underline">Return Home</Link>
        </div>
      )}
    </div>
  );
};