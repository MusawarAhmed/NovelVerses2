import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { MockBackendService } from '../services/mockBackend';
import { Novel, Chapter, Comment } from '../types';
import { AppContext } from '../App';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Lock, Sparkles, List, MessageSquare, X, ThumbsUp, Zap, Send } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { FadeIn, ScaleButton, BlurIn } from '../components/Anim';
import { motion, AnimatePresence } from 'framer-motion';

export const Reader: React.FC = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser, theme } = useContext(AppContext);
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Appearance Settings
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('serif');
  
  // UI State
  const [locked, setLocked] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'toc' | 'comments' | 'settings'>('none');
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // AI State
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  // Comment State
  const [newComment, setNewComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!novelId || !chapterId) return;
    const n = MockBackendService.getNovelById(novelId);
    const c = MockBackendService.getChapter(chapterId);
    const allChapters = MockBackendService.getChapters(novelId);
    const settings = MockBackendService.getSiteSettings();

    if (n && c) {
      setNovel(n);
      setChapter(c);
      setChapters(allChapters);
      setComments(MockBackendService.getComments(c.id));
      
      // Logic:
      // If Not Premium -> Unlocked
      // If Premium:
      //    If Payments Enabled -> Unlocked if Logged In AND Purchased
      //    If Payments Disabled -> Unlocked if Logged In (Global Override only skips payment, not login)
      
      const isPremium = c.isPaid;
      const isLoggedIn = !!user;
      const paymentsEnabled = settings.enablePayments;

      let isUnlocked = !isPremium; // Free chapters always unlocked

      if (isPremium) {
          if (!paymentsEnabled) {
             // If payments off, require login only
             isUnlocked = isLoggedIn;
          } else {
             // If payments on, require login + purchase (or admin)
             isUnlocked = isLoggedIn && (user.purchasedChapters.includes(c.id) || user.role === 'admin');
          }
      }

      setLocked(!isUnlocked);
      setSummary(null);
      setScrollProgress(0); // Reset progress on chapter change
      setNewComment('');

      // Save Reading History if user is logged in
      if (user) {
        MockBackendService.saveReadingHistory(user.id, novelId, chapterId);
      }

    } else {
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [novelId, chapterId, user?.id, user?.role, user?.purchasedChapters.length, navigate]); 

  // Scroll Listener for Percentage
  useEffect(() => {
    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setScrollProgress(Math.min(Math.max(progress, 0), 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePurchase = () => {
    if (!user) return navigate('/auth', { state: { from: location.pathname } });
    
    // If we are here, user is logged in.
    // If locked is true, it implies payments MUST be enabled and user hasn't bought it.
    // (Because if payments were disabled, it would be unlocked for logged in user)
    
    if (!chapter) return;

    const success = MockBackendService.purchaseChapter(user.id, chapter.id);
    if (success) {
      setLocked(false);
      refreshUser();
      alert("Chapter purchased successfully!");
    } else {
      alert("Insufficient coins! Please top up.");
    }
  };

  const handleNext = () => {
    if (!chapter || !chapters.length) return;
    const idx = chapters.findIndex(c => c.id === chapter.id);
    if (idx < chapters.length - 1) {
      navigate(`/read/${novelId}/${chapters[idx + 1].id}`);
    }
  };

  const handlePrev = () => {
    if (!chapter || !chapters.length) return;
    const idx = chapters.findIndex(c => c.id === chapter.id);
    if (idx > 0) {
      navigate(`/read/${novelId}/${chapters[idx - 1].id}`);
    }
  };

  const handleSummarize = async () => {
    if (!chapter) return;
    setSummarizing(true);
    const result = await GeminiService.summarizeChapter(chapter.content.replace(/<[^>]*>?/gm, ''));
    setSummary(result);
    setSummarizing(false);
  };

  const handlePostComment = () => {
    if (!user) {
        setActivePanel('none');
        return navigate('/auth', { state: { from: location.pathname } });
    }
    if (!newComment.trim() || !chapter) return;

    const comment = MockBackendService.createComment(chapter.id, user.id, user.username, newComment);
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleReply = (username: string) => {
      setNewComment(`@${username} `);
      if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };

  if (!novel || !chapter) return <div className="p-10 text-center">Loading...</div>;

  const isSepia = theme === 'sepia';
  const currentChapterIndex = chapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  // Group chapters for TOC sidebar
  const groupedChapters = chapters.reduce((acc, ch) => {
      const vol = ch.volume || 'Uncategorized';
      if (!acc[vol]) acc[vol] = [];
      acc[vol].push(ch);
      return acc;
  }, {} as Record<string, Chapter[]>);

  // Settings check for display text
  const settings = MockBackendService.getSiteSettings();

  return (
    <div className={`min-h-screen relative ${isSepia ? 'bg-[#f4ecd8] text-[#5b4636]' : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-300'}`}>
      
      {/* Top Navigation Bar */}
      <div className={`fixed top-0 left-0 right-0 h-14 z-40 border-b flex flex-col justify-center transition-colors ${isSepia ? 'bg-[#f4ecd8]/95 border-[#e4dcc8]' : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800'} backdrop-blur-md`}>
        <div className="flex items-center justify-between px-4 w-full h-full">
            <div className="flex items-center overflow-hidden">
                <Link to={`/novel/${novelId}`} className="p-2 mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0">
                    <ArrowLeft size={20} />
                </Link>
                <div className="min-w-0 flex flex-col">
                    <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md">{novel.title}</h1>
                    <p className="text-xs opacity-60 truncate">{chapter.title}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm font-mono font-bold opacity-70 hidden sm:block">
                    {scrollProgress.toFixed(0)}%
                </div>
                {/* AI Summary - Only show if unlocked */}
                {!locked && (
                    <ScaleButton onClick={handleSummarize} className="hidden sm:flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                        <Sparkles size={14} /> {summarizing ? 'Thinking...' : 'AI Summary'}
                    </ScaleButton>
                )}
            </div>
        </div>
        {/* Progress Line */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      {/* Right Floating Dock */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-3">
          <DockButton 
            icon={<List size={20}/>} 
            active={activePanel === 'toc'} 
            onClick={() => setActivePanel(activePanel === 'toc' ? 'none' : 'toc')}
            tooltip="Table of Contents"
          />
          <DockButton 
            icon={<MessageSquare size={20}/>} 
            active={activePanel === 'comments'} 
            onClick={() => setActivePanel(activePanel === 'comments' ? 'none' : 'comments')}
            tooltip="Comments"
          />
          <DockButton 
            icon={<Settings size={20}/>} 
            active={activePanel === 'settings'} 
            onClick={() => setActivePanel(activePanel === 'settings' ? 'none' : 'settings')}
            tooltip="Reading Settings"
          />
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="max-w-3xl mx-auto px-5 pt-28 pb-40 sm:px-8 transition-all">
        <BlurIn className="text-3xl font-bold mb-12 text-center font-serif leading-tight">{chapter.title}</BlurIn>
        
        {summary && (
          <FadeIn className="mb-10 p-6 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 shadow-sm">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-sm mb-3">
              <Sparkles size={16} /> AI Summary
            </div>
            <p className="text-sm leading-relaxed opacity-90 whitespace-pre-line">{summary}</p>
          </FadeIn>
        )}

        {locked ? (
          <FadeIn className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Locked Chapter</h3>
            <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                {!settings.enablePayments && !user 
                    ? "Please login to read this chapter." 
                    : "Support the author and unlock this chapter to continue reading."}
            </p>
            <ScaleButton 
              onClick={handlePurchase}
              className="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/20"
            >
              {!settings.enablePayments && !user 
                  ? "Login to Read" 
                  : `Unlock for ${chapter.price} Coins`}
            </ScaleButton>
          </FadeIn>
        ) : (
          <div 
            className={`prose dark:prose-invert max-w-none leading-loose ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        )}

        {/* Footer Section with "Cliffhanger" Hook */}
        {!locked && (
            <div className="mt-24">
                {nextChapter ? (
                    <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-inner">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">The Story Continues</p>
                        <h3 className="text-xl md:text-2xl font-serif font-bold mb-6">{nextChapter.title}</h3>
                        <ScaleButton 
                            onClick={handleNext}
                            className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-primary rounded-full hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <span className="mr-2">Continue Journey</span>
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            <span className="absolute -inset-1 rounded-full animate-ping opacity-20 bg-primary"></span>
                        </ScaleButton>
                    </div>
                ) : (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-lg font-serif italic">You have reached the latest chapter.</p>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                    <button 
                        onClick={handlePrev} 
                        disabled={!prevChapter}
                        className="flex flex-col items-start px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors text-left max-w-[45%]"
                    >
                        <span className="text-xs uppercase opacity-50 font-bold flex items-center mb-1"><ChevronLeft size={12} className="mr-1"/> Previous</span>
                        <span className="text-sm font-medium truncate w-full">{prevChapter ? `Ch. ${prevChapter.order}` : 'First Chapter'}</span>
                    </button>

                    <button 
                        onClick={handleNext} 
                        disabled={!nextChapter}
                        className="flex flex-col items-end px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors text-right max-w-[45%]"
                    >
                        <span className="text-xs uppercase opacity-50 font-bold flex items-center mb-1">Next <ChevronRight size={12} className="ml-1"/></span>
                        <span className="text-sm font-medium truncate w-full">{nextChapter ? `Ch. ${nextChapter.order}` : 'Latest'}</span>
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Side Panels (Drawers) */}
      <AnimatePresence>
        {activePanel !== 'none' && (
            <>
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setActivePanel('none')}
                    className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
                />
                
                {/* Panel Container */}
                <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`fixed top-0 right-0 bottom-0 w-80 sm:w-96 z-50 shadow-2xl flex flex-col ${isSepia ? 'bg-[#f9f3e6] border-l border-[#e4dcc8]' : 'bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800'}`}
                >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                        <h2 className="font-bold text-lg">
                            {activePanel === 'toc' && 'Table of Contents'}
                            {activePanel === 'comments' && `Comments (${comments.length})`}
                            {activePanel === 'settings' && 'Display Settings'}
                        </h2>
                        <button onClick={() => setActivePanel('none')} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        
                        {/* Table of Contents Panel */}
                        {activePanel === 'toc' && (
                            <div className="space-y-6">
                                {Object.keys(groupedChapters).map(vol => (
                                    <div key={vol}>
                                        <h3 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider sticky top-0 bg-inherit py-2">{vol}</h3>
                                        <div className="space-y-1">
                                            {groupedChapters[vol].map(ch => {
                                                // Calculate locking for TOC items individually
                                                const isChPremium = ch.isPaid;
                                                const isChOwned = !isChPremium || (user && (user.purchasedChapters.includes(ch.id) || user.role === 'admin')) || (!settings.enablePayments && !!user);
                                                const isChLocked = !isChOwned;

                                                return (
                                                    <button
                                                        key={ch.id}
                                                        onClick={() => {
                                                            navigate(`/read/${novelId}/${ch.id}`);
                                                            setActivePanel('none');
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${ch.id === chapter.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                                    >
                                                        <span className="truncate">{ch.title}</span>
                                                        {isChLocked && <Lock size={12} className="ml-2 opacity-50 flex-shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Comments Panel */}
                        {activePanel === 'comments' && (
                            <div className="space-y-6">
                                {comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${comment.avatarColor || 'bg-slate-500'}`}>
                                            {comment.username[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline justify-between mb-1">
                                                <span className="text-sm font-bold">{comment.username}</span>
                                                <span className="text-xs opacity-50">2h ago</span>
                                            </div>
                                            <p className="text-sm opacity-80 leading-relaxed">{comment.content}</p>
                                            <div className="flex items-center mt-2 gap-4">
                                                <button className="flex items-center text-xs opacity-50 hover:opacity-100 hover:text-primary transition-colors">
                                                    <ThumbsUp size={12} className="mr-1" /> {comment.likes}
                                                </button>
                                                <button 
                                                    onClick={() => handleReply(comment.username)}
                                                    className="text-xs opacity-50 hover:opacity-100 hover:text-primary transition-colors"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                                    <textarea 
                                        ref={textareaRef}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="What are your thoughts?" 
                                        className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 border-transparent focus:ring-2 focus:ring-primary outline-none text-sm resize-none h-24"
                                    ></textarea>
                                    <button 
                                        onClick={handlePostComment}
                                        className="mt-2 w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center"
                                    >
                                        <Send size={16} className="mr-2" /> Post Comment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Settings Panel */}
                        {activePanel === 'settings' && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-4 opacity-60">Font Size</label>
                                    <input 
                                        type="range" min="14" max="32" 
                                        value={fontSize} 
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
                                    />
                                    <div className="flex justify-between text-xs mt-2 opacity-50 font-mono">
                                        <span>14px</span>
                                        <span>{fontSize}px</span>
                                        <span>32px</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-4 opacity-60">Font Family</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setFontFamily('sans')} 
                                            className={`py-3 px-4 rounded-xl border text-sm transition-all ${fontFamily === 'sans' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}
                                        >
                                            Sans Serif
                                        </button>
                                        <button 
                                            onClick={() => setFontFamily('serif')} 
                                            className={`py-3 px-4 rounded-xl border text-sm font-serif transition-all ${fontFamily === 'serif' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}
                                        >
                                            Serif
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

    </div>
  );
};

const DockButton = ({ icon, active, onClick, tooltip }: any) => (
    <div className="relative group">
        <button 
            onClick={onClick}
            className={`p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${active ? 'bg-primary text-white scale-110' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary'}`}
        >
            {icon}
        </button>
        {/* Tooltip */}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {tooltip}
        </div>
    </div>
);