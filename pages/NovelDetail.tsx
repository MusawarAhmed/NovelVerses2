
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { NovelService } from '../services/novelService';
import { Novel, Chapter, SiteSettings, Comment } from '../types';
import { AppContext } from '../App';
import { BookOpen, Bookmark, List, Lock, Unlock, Eye, TrendingUp, Star, Edit, Layers, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { FadeIn, ScaleButton } from '../components/Anim';
import { SEO } from '../components/SEO';

export const NovelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [relatedNovels, setRelatedNovels] = useState<Novel[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'chapters' | 'reviews'>('about');
  const [reviews, setReviews] = useState<Comment[]>([]);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
        try {
            const n = await NovelService.getNovelById(id);
            if (n) {
                setNovel(n);
                const chs = await NovelService.getChapters(n.id);
                setChapters(chs);
                setSettings(await NovelService.getSiteSettings());
                const novelReviews = await NovelService.getNovelReviews(n.id);
                setReviews(novelReviews);
                
                // Logic for related novels
                const allNovels = await NovelService.getNovels({ limit: 100 });
                let related = allNovels.filter(item => item.id !== n.id && item.tags.some(t => n.tags.includes(t)));
                if (related.length < 6) {
                    const remaining = allNovels.filter(item => item.id !== n.id && !related.includes(item));
                    related = [...related, ...remaining];
                }
                setRelatedNovels(related.slice(0, 6));
            } else {
                navigate('/');
            }
        } catch (e) {
            console.error(e);
            navigate('/');
        }
    };
    fetchData();
    window.scrollTo(0, 0);
    setActiveTab('about'); // Ensure default is about on load
  }, [id, navigate]);

  useEffect(() => {
    if (user && novel) {
      setIsBookmarked(user.bookmarks.includes(novel.id));
    }
  }, [user, novel]);

  const handleBookmark = async () => {
    if (!user) return navigate('/auth', { state: { from: location.pathname } });
    if (novel) {
      await NovelService.toggleBookmark(novel.id);
      refreshUser();
    }
  };

  const scrollToChapters = () => {
      setActiveTab('chapters');
      // Small timeout to allow state update and render
      setTimeout(() => {
          tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
  };

  // Helper for time ago
  const getTimeAgo = (dateStr: string) => {
      const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " years ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " months ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " days ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " hours ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " minutes ago";
      return "Just now";
  };

  // Group chapters by volume
  const groupedChapters = chapters.reduce((acc, chapter) => {
      const vol = chapter.volume || 'Uncategorized';
      if (!acc[vol]) acc[vol] = [];
      acc[vol].push(chapter);
      return acc;
  }, {} as Record<string, Chapter[]>);

  // Sort volumes keys
  const sortedVolumes = Object.keys(groupedChapters).sort();

  const handlePostReview = async () => {
      if (!user) return navigate('/auth', { state: { from: location.pathname } });
      if (!novel || !newReviewContent.trim()) return;

      try {
          const review = await NovelService.createReview(novel.id, newReviewContent, newReviewRating);
          setReviews([review, ...reviews]);
          setNewReviewContent('');
          setNewReviewRating(5);
      } catch (e) {
          console.error("Failed to post review", e);
      }
  };

  const getNovelLink = (n: Novel) => {
      if (n.slug) return `/novel/${n.slug}_${n.id}`;
      return `/novel/${n.id}`;
  };

  if (!novel) return <div>Loading...</div>;

  const latestChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20">
      <SEO title={novel.title} description={novel.description.substring(0, 160)} />
      
      {/* Header Background */}
      <div className="relative h-64 md:h-80 overflow-hidden">
          <div className="absolute inset-0">
              <img src={novel.coverUrl} alt="" className="w-full h-full object-cover blur-md opacity-50 dark:opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-950"></div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
              {/* Cover Image */}
              <div className="flex-shrink-0 mx-auto md:mx-0 w-48 md:w-64 rounded-lg shadow-2xl overflow-hidden border-4 border-white dark:border-slate-800">
                  <img src={novel.coverUrl} alt={novel.title} className="w-full h-auto" />
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 md:pt-12 text-center md:text-left">
                  <div className="mb-4">
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 font-serif leading-tight">{novel.title}</h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center"><BookOpen size={16} className="mr-1"/> {novel.category}</span>
                          <button 
                            onClick={scrollToChapters}
                            className="flex items-center hover:text-primary transition-colors cursor-pointer focus:outline-none group"
                          >
                              <List size={16} className="mr-1 group-hover:scale-110 transition-transform"/> 
                              <span className="group-hover:underline underline-offset-4">{chapters.length} Chs</span>
                          </button>
                          <span className="flex items-center"><Eye size={16} className="mr-1"/> {novel.views.toLocaleString()}</span>
                      </div>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-1 mb-6">
                      <div className="flex text-yellow-400">
                          {[1,2,3,4,5].map(i => (
                              <Star key={i} size={18} className={`${i <= Math.round(novel.rating) ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                          ))}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white ml-2">{novel.rating}</span>
                      <span className="text-xs text-slate-500 ml-1">(128 ratings)</span>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <ScaleButton 
                          onClick={() => {
                              if (chapters.length > 0) {
                                  const nId = novel.slug ? `${novel.slug}_${novel.id}` : novel.id;
                                  navigate(`/read/${nId}/${chapters[0].id}`);
                              }
                          }}
                          className="bg-primary hover:bg-indigo-700 text-white px-8 py-2.5 rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all"
                      >
                          READ NOW
                      </ScaleButton>
                      <ScaleButton 
                          onClick={handleBookmark}
                          className={`px-6 py-2.5 rounded-full font-bold border transition-all flex items-center ${isBookmarked ? 'bg-slate-200 dark:bg-slate-700 border-transparent text-slate-800 dark:text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-primary hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                      >
                          {isBookmarked ? <CheckIcon /> : <PlusIcon />} LIBRARY
                      </ScaleButton>
                      {user?.role === 'admin' && (
                        <Link to="/admin" state={{ editNovelId: novel.id }} className="p-2.5 bg-white dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors">
                            <Edit size={20} />
                        </Link>
                      )}
                  </div>
              </div>
          </div>

          {/* Content Tabs */}
          {/* Added scroll-mt-24 to handle sticky header offset when scrolling into view */}
          <div className="mt-12 scroll-mt-24" ref={tabsRef}>
              <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
                  <div className="flex space-x-8 overflow-x-auto">
                      <button 
                          onClick={() => setActiveTab('about')}
                          className={`pb-4 text-lg font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'about' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                          About
                      </button>
                      <button 
                          onClick={() => setActiveTab('chapters')}
                          className={`pb-4 text-lg font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'chapters' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                          Table of Contents
                      </button>
                      <button 
                          onClick={() => setActiveTab('reviews')}
                          className={`pb-4 text-lg font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'border-primary text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                          Reviews ({reviews.length})
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-3">
                      {activeTab === 'about' && (
                          <FadeIn>
                              <div className="prose dark:prose-invert max-w-none mb-8 text-slate-600 dark:text-slate-300 leading-relaxed">
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Synopsis</h3>
                                  <p className="whitespace-pre-line">{novel.description}</p>
                              </div>
                              
                              <div className="mb-8">
                                  <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">Tags</h3>
                                  <div className="flex flex-wrap gap-2">
                                      {novel.tags.map(tag => (
                                          <Link 
                                            key={tag} 
                                            to={`/search?q=${tag}`}
                                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-full hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors"
                                          >
                                              #{tag}
                                          </Link>
                                      ))}
                                  </div>
                              </div>
                          </FadeIn>
                      )}

                      {activeTab === 'chapters' && (
                          <FadeIn>
                              <div className="mb-8 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                                  <div>
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Latest Release</span>
                                      {latestChapter ? (
                                          <p className="font-medium text-slate-900 dark:text-white mt-1 truncate">{latestChapter.title}</p>
                                      ) : (
                                          <p className="text-slate-500 italic mt-1">No chapters yet</p>
                                      )}
                                  </div>
                                  {latestChapter && (
                                      <span className="text-xs text-slate-500 whitespace-nowrap">{getTimeAgo(latestChapter.createdAt)}</span>
                                  )}
                              </div>

                              <div className="space-y-8">
                                  {sortedVolumes.map((vol) => (
                                      <div key={vol}>
                                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                              <Layers size={18} className="mr-2 text-slate-400" />
                                              {vol}
                                              <span className="ml-auto text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                  {groupedChapters[vol].length} Chapters
                                              </span>
                                          </h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                              {groupedChapters[vol].map((chapter) => {
                                                  const isNovelFree = !!novel.isFree;
                                                  const isPremium = chapter.isPaid && !isNovelFree;
                                                  const isLoggedIn = !!user;
                                                  const paymentsEnabled = settings?.enablePayments;

                                                  let isOwned = !isPremium; 
                                                  if (isPremium) {
                                                      if (!paymentsEnabled) {
                                                          isOwned = isLoggedIn;
                                                      } else {
                                                          isOwned = isLoggedIn && (user?.purchasedChapters.includes(chapter.id) || user?.role === 'admin');
                                                      }
                                                  }

                                                  return (
                                                      <Link 
                                                          key={chapter.id}
                                                          to={`/read/${novel.slug ? `${novel.slug}_${novel.id}` : novel.id}/${chapter.id}`}
                                                          className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                                      >
                                                          <div className="flex-1 min-w-0 mr-4">
                                                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary truncate">
                                                                  {chapter.title}
                                                              </p>
                                                          </div>
                                                          <div className="flex-shrink-0">
                                                              {isPremium ? (
                                                                  isOwned ? (
                                                                      <Unlock size={14} className="text-green-500" />
                                                                  ) : (
                                                                      <Lock size={14} className="text-slate-400" />
                                                                  )
                                                              ) : (
                                                                  <span className="text-xs text-slate-400">Free</span>
                                                              )}
                                                          </div>
                                                      </Link>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </FadeIn>
                      )}

                      {activeTab === 'reviews' && (
                          <FadeIn>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-center">
                                      <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">{novel.rating}</div>
                                      <div className="flex justify-center text-yellow-400 mb-2">
                                          {[1,2,3,4,5].map(i => (
                                              <Star key={i} size={20} className={`${i <= Math.round(novel.rating) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                                          ))}
                                      </div>
                                      <p className="text-sm text-slate-500">{reviews.length} reviews</p>
                                  </div>
                                  
                                  <div className="md:col-span-2">
                                      {user ? (
                                          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                                              <h3 className="font-bold mb-4">Write a Review</h3>
                                              <div className="flex gap-2 mb-4">
                                                  {[1,2,3,4,5].map(i => (
                                                      <button 
                                                          key={i}
                                                          onClick={() => setNewReviewRating(i)}
                                                          className="focus:outline-none transition-transform hover:scale-110"
                                                      >
                                                          <Star size={24} className={`${i <= newReviewRating ? 'text-yellow-400 fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                                                      </button>
                                                  ))}
                                              </div>
                                              <textarea 
                                                  value={newReviewContent}
                                                  onChange={(e) => setNewReviewContent(e.target.value)}
                                                  placeholder="Share your thoughts about this novel..."
                                                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-transparent focus:ring-2 focus:ring-primary outline-none text-sm resize-none h-32 mb-4"
                                              ></textarea>
                                              <div className="flex justify-end">
                                                  <button 
                                                      onClick={handlePostReview}
                                                      disabled={!newReviewContent.trim()}
                                                      className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                  >
                                                      <Send size={16} className="mr-2" /> Post Review
                                                  </button>
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
                                              <p className="text-slate-500 mb-4">Login to write a review</p>
                                              <Link to="/auth" state={{ from: location.pathname }} className="text-primary font-bold hover:underline">Login Now</Link>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              <div className="space-y-6">
                                  {reviews.map(review => (
                                      <div key={review.id} className="flex gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${review.avatarColor || 'bg-indigo-500'}`}>
                                              {review.username[0]}
                                          </div>
                                          <div className="flex-1">
                                              <div className="flex items-center justify-between mb-2">
                                                  <div>
                                                      <span className="font-bold text-slate-900 dark:text-white mr-2">{review.username}</span>
                                                      <span className="text-xs text-slate-500">{getTimeAgo(review.createdAt)}</span>
                                                  </div>
                                                  {review.rating && (
                                                      <div className="flex text-yellow-400">
                                                          {[1,2,3,4,5].map(i => (
                                                              <Star key={i} size={12} className={`${i <= review.rating! ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                                                          ))}
                                                      </div>
                                                  )}
                                              </div>
                                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{review.content}</p>
                                              <div className="flex items-center mt-4 gap-4">
                                                  <button className="flex items-center text-xs text-slate-500 hover:text-primary transition-colors">
                                                      <ThumbsUp size={14} className="mr-1" /> {review.likes} Helpful
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                                  {reviews.length === 0 && (
                                      <div className="text-center py-10 text-slate-500">
                                          No reviews yet. Be the first to review!
                                      </div>
                                  )}
                              </div>
                          </FadeIn>
                      )}
                  </div>

                  {/* You Might Also Like - Full Width Bottom Section */}
                  <div className="lg:col-span-3 mt-12 pt-12 border-t border-slate-200 dark:border-slate-800">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                          <TrendingUp size={24} className="mr-2 text-primary"/> You Might Also Like
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {relatedNovels.map(related => (
                              <Link key={related.id} to={getNovelLink(related)} className="group block">
                                  <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-sm mb-3 relative">
                                      <img src={related.coverUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                      <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center">
                                          <Star size={8} className="fill-yellow-400 text-yellow-400 mr-1" /> {related.rating}
                                      </div>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors mb-1">{related.title}</h4>
                                  <p className="text-xs text-slate-500 line-clamp-1">{related.category}</p>
                              </Link>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);