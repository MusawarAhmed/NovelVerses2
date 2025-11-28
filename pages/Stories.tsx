import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { NovelService } from '../services/novelService';
import { Novel } from '../types';
import { Star, ChevronDown, ChevronRight, Filter, BookOpen, Clock, Zap, Trophy, Crown } from 'lucide-react';
import { FadeIn } from '../components/Anim';

export const Stories: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  // Filters
  const [activeStatus, setActiveStatus] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [activeSort, setActiveSort] = useState<'popular' | 'rating' | 'new' | 'collections'>('popular');
  
  const observer = useRef<IntersectionObserver | null>(null);
  const LIMIT = 20;

  const lastNovelElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Reset when filters change
  useEffect(() => {
    setNovels([]);
    setPage(0);
    setHasMore(true);
  }, [category, activeStatus, activeSort]);

  useEffect(() => {
    const fetchNovels = async () => {
        setLoading(true);
        try {
            const newNovels = await NovelService.getNovels({
                limit: LIMIT,
                skip: page * LIMIT,
                category: category === 'all' ? undefined : category,
                sort: activeSort,
                status: activeStatus === 'all' ? undefined : activeStatus
            });
            
            setNovels(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const uniqueNew = newNovels.filter(n => !existingIds.has(n.id));
                return [...prev, ...uniqueNew];
            });
            setHasMore(newNovels.length === LIMIT);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchNovels();
  }, [category, page, activeStatus, activeSort]);

  const genres = [
      { name: 'Action', count: 120 },
      { name: 'Romance', count: 85 },
      { name: 'Fantasy', count: 200 },
      { name: 'Harem', count: 45 },
      { name: 'Adventure', count: 150 },
      { name: 'Sci-Fi', count: 60 },
      { name: 'System', count: 90 },
      { name: 'Magic', count: 110 },
      { name: 'Eastern', count: 75 },
      { name: 'Horror', count: 30 },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Sidebar Filters */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Genre of Novels */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex justify-between items-center">
                            Genre of Novels <ChevronDown size={16} />
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => navigate('/stories/all')}
                                className={`text-left text-sm py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!category || category === 'all' ? 'text-primary font-bold bg-primary/5' : 'text-slate-600 dark:text-slate-400'}`}
                            >
                                All
                            </button>
                            {genres.map(g => (
                                <button 
                                    key={g.name}
                                    onClick={() => navigate(`/stories/${g.name.toLowerCase()}`)}
                                    className={`text-left text-sm py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${category === g.name.toLowerCase() ? 'text-primary font-bold bg-primary/5' : 'text-slate-600 dark:text-slate-400'}`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Genre of Comics (Placeholder) */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 opacity-60">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex justify-between items-center">
                            Genre of Comics <ChevronRight size={16} />
                        </h3>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Top Filter Bar */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                        <div className="flex flex-col sm:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Filter By</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'completed', 'ongoing'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setActiveStatus(status as any)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                            activeStatus === status 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sort By</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'popular', label: 'Popular' },
                                    { id: 'collections', label: 'Most Collections' },
                                    { id: 'rating', label: 'Rating' },
                                    { id: 'new', label: 'Time Updated' }
                                ].map((sort) => (
                                    <button
                                        key={sort.id}
                                        onClick={() => setActiveSort(sort.id as any)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                            activeSort === sort.id 
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                                        }`}
                                    >
                                        {sort.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Novel Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {novels.map((novel, index) => {
                            if (novels.length === index + 1) {
                                return (
                                    <div ref={lastNovelElementRef} key={novel.id}>
                                        <NovelListCard novel={novel} />
                                    </div>
                                );
                            } else {
                                return <NovelListCard key={novel.id} novel={novel} />;
                            }
                        })}
                    </div>

                    {loading && (
                        <div className="py-10 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {!hasMore && novels.length > 0 && (
                        <div className="py-10 text-center text-slate-500">
                            You've reached the end!
                        </div>
                    )}

                    {!loading && novels.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <BookOpen size={48} className="text-slate-300 mb-4" />
                            <p className="text-slate-500 text-lg">No novels found matching your criteria.</p>
                            <button 
                                onClick={() => {
                                    setActiveStatus('all');
                                    setActiveSort('popular');
                                    navigate('/stories/all');
                                }}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

const NovelListCard: React.FC<{ novel: Novel }> = ({ novel }) => (
    <Link to={`/novel/${novel.slug ? `${novel.slug}_${novel.id}` : novel.id}`} className="group flex bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800 h-40">
        <div className="w-28 flex-shrink-0 relative overflow-hidden">
            <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-0 left-0 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm">
                {novel.rating}
            </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1 group-hover:text-primary transition-colors text-lg">{novel.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">{novel.description}</p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                    <span className="flex items-center"><BookOpen size={12} className="mr-1"/> {novel.category}</span>
                    <span className="flex items-center"><Zap size={12} className="mr-1"/> {novel.views > 1000 ? (novel.views/1000).toFixed(1) + 'k' : novel.views}</span>
                </div>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    Read Now
                </span>
            </div>
        </div>
    </Link>
);
