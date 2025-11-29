
import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { NovelService } from '../services/novelService';
import { Novel, Chapter, Comment, SiteSettings } from '../types';
import { AppContext } from '../App';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Lock, Sparkles, List, MessageSquare, X, ThumbsUp, Zap, Send, Headphones, Play, Pause } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { FadeIn, ScaleButton, BlurIn } from '../components/Anim';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingOverlay } from '../components/LoadingOverlay';

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
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<SiteSettings>({
      showHero: true, showWeeklyFeatured: true, showRankings: true, showRising: true, showTags: true, showPromo: true, enablePayments: true, showDemoCredentials: true, showChapterSummary: true, enableTTS: true
  });
  const [ambience, setAmbience] = useState<'none' | 'rain' | 'fire' | 'cosmic'>('none');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TTS State
  const [ttsActive, setTtsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [ttsProgress, setTtsProgress] = useState(0); // 0 to 100

  // Cleanup TTS on unmount
  useEffect(() => {
      return () => {
          window.speechSynthesis.cancel();
      };
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ambience !== 'none') {
        // Visual ambience is handled by the overlay component
    } else {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }
  }, [ambience]);

  useEffect(() => {
    setActivePanel('none');
    setActiveParagraphId(null);
  }, [chapter]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!novelId || !chapterId) {
        setError("Invalid URL parameters");
        setLoading(false);
        return;
    }
    
    const fetchData = async () => {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching data for", novelId, chapterId);
            const n = await NovelService.getNovelById(novelId);
            const c = await NovelService.getChapter(chapterId);
            const allChapters = await NovelService.getChapters(novelId);
            const settings = await NovelService.getSiteSettings();
            const chapterComments = await NovelService.getComments(chapterId);

            if (!isMounted) return;

            if (n && c) {
              setNovel(n);
              setChapter(c);
              setChapters(allChapters);
              setComments(chapterComments);
              setSettings(settings);
              
              const isNovelFree = !!n.isFree;
              const isPremium = c.isPaid && !isNovelFree;
              const paymentsEnabled = settings.enablePayments;
              
              // CRITICAL FIX: Fetch fresh user data from DB to avoid stale context state issues
              let currentUser = user;
              if (user) {
                  try {
                      currentUser = await NovelService.loadUser();
                  } catch (e) {
                      console.error("Failed to load fresh user", e);
                  }
              }
              const isLoggedIn = !!currentUser;

              let isUnlocked = !isPremium; // Free chapters always unlocked

              if (isPremium) {
                  if (!paymentsEnabled) {
                     // If payments off, require login only
                     isUnlocked = isLoggedIn;
                  } else {
                     // If payments on, require login + purchase (or admin)
                     isUnlocked = isLoggedIn && (currentUser?.purchasedChapters.includes(c.id) || currentUser?.role === 'admin');
                  }
              }

              setLocked(!isUnlocked);
              setSummary(null);
              setScrollProgress(0); // Reset progress on chapter change
              setNewComment('');
              setActiveParagraphId(null);

              // Save Reading History if user is logged in
              if (currentUser) {
                await NovelService.saveReadingHistory(novelId, chapterId);
              }

            } else {
              setError("Novel or Chapter not found");
            }
        } catch (e: any) {
            console.error(e);
            if (isMounted) setError(e.message || "Failed to load chapter");
        } finally {
            if (isMounted) setLoading(false);
        }
    };
    fetchData();
    window.scrollTo(0, 0);
    
    return () => { isMounted = false; };
  }, [novelId, chapterId, navigate]); 

  // Scroll Listener for Percentage and XP
  useEffect(() => {
    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setScrollProgress(Math.min(Math.max(progress, 0), 100));

        // Award XP if > 90% and not already awarded for this chapter
        // Note: In a real app, we'd track this per chapter in DB or local state to prevent spam
        // For now, we'll just do a simple check if user is at bottom
        if (progress > 95 && user && !locked) {
            // Debounce or check flag
            // We need a ref to track if we already awarded XP for this session/chapter
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, locked]);

  // Track XP Awarded
  const xpAwardedRef = useRef(false);
  useEffect(() => {
      xpAwardedRef.current = false;
  }, [chapterId]);

  useEffect(() => {
      if (scrollProgress > 90 && !xpAwardedRef.current && user && !locked) {
          xpAwardedRef.current = true;
          NovelService.awardXP(10)
            .then(res => {
              if (res.leveledUp) {
                  window.alert('Congratulations! You reached ' + res.rank + ' Realm!');
                  refreshUser();
              }
            })
            .catch(e => console.error("XP Error", e));
      }
  }, [scrollProgress, user, locked, refreshUser]);

  const handlePurchase = async () => {
    if (!user) return navigate('/auth', { state: { from: location.pathname } });
    
    if (!chapter) return;

    try {
        const res = await NovelService.purchaseChapter(chapter.id);
        if (res.success) {
          setLocked(false);
          refreshUser(); // Update global context
          alert("Chapter purchased successfully!");
        }
    } catch (err: any) {
        alert(err.response?.data?.msg || "Purchase failed");
    }
  };

  const handleNext = () => {
    if (!chapter || !chapters.length) return;
    const idx = chapters.findIndex(c => c.id === chapter.id);
    if (idx < chapters.length - 1) {
      navigate('/read/' + novelId + '/' + chapters[idx + 1].id);
    }
  };

  const handlePrev = () => {
    if (!chapter || !chapters.length) return;
    const idx = chapters.findIndex(c => c.id === chapter.id);
    if (idx > 0) {
      navigate('/read/' + novelId + '/' + chapters[idx - 1].id);
    }
  };

  const handleSummarize = async () => {
    if (!chapter) return;
    setSummarizing(true);
    const result = await GeminiService.summarizeChapter(chapter.content.replace(/<[^>]*>?/gm, ''));
    setSummary(result);
    setSummarizing(false);
  };

  const handlePostComment = async () => {
    if (!user) {
        setActivePanel('none');
        return navigate('/auth', { state: { from: location.pathname } });
    }
    if (!newComment.trim() || !chapter) return;

    try {
        const comment = await NovelService.createComment(chapter.id, user.id, user.username, newComment, activeParagraphId || undefined);
        setComments([comment, ...comments]);
        setNewComment('');
    } catch (e) {
        console.error("Failed to post comment", e);
    }
  };

  const handleReply = (username: string) => {
      setNewComment('@' + username + ' ');
      if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };

  // Parse content into paragraphs for comment functionality
  const paragraphs = useMemo(() => {
    if (!chapter || !chapter.content) return [];
    
    // Use DOMParser to safely parse HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapter.content, 'text/html');
    
    // Select all paragraphs. If content is not wrapped in <p>, we might need to handle that.
    // For now, we assume standard HTML content from rich text editors usually uses <p>.
    // If the content is just text without <p>, it might be wrapped in <body> by the parser.
    let pTags = Array.from(doc.body.querySelectorAll('p'));
    
    // If no <p> tags found, but there is content, it might be raw text or other tags.
    // We can try to wrap top-level nodes or just treat the whole body as one block.
    if (pTags.length === 0 && doc.body.innerHTML.trim().length > 0) {
        // If it's just text or other tags, treat as one paragraph
        return [{ id: '0', content: doc.body.innerHTML }];
    }

    return pTags.map((p, index) => ({
        id: index.toString(),
        content: p.outerHTML // Use outerHTML to keep the <p> tag and its attributes/styles
    }));
  }, [chapter]);

  const commentsByParagraph = useMemo(() => {
      const map: Record<string, number> = {};
      comments.forEach(c => {
          if (c.paragraphId) {
              map[c.paragraphId] = (map[c.paragraphId] || 0) + 1;
          }
      });
      return map;
  }, [comments]);

  const filteredComments = useMemo(() => {
      if (!activeParagraphId) return comments.filter(c => !c.paragraphId); // Show general comments if no paragraph selected? Or show all?
      // If paragraph selected, show only those. If 'general' (null) selected, show general comments.
      // Actually, usually "Comments" panel shows ALL comments unless filtered.
      // But if we clicked a paragraph badge, we want ONLY that paragraph's comments.
      return comments.filter(c => c.paragraphId === activeParagraphId);
  }, [comments, activeParagraphId]);

  // If activePanel is 'comments' and activeParagraphId is null, show ALL comments?
  // Or should we have a "General Comments" section?
  // Let's say: 
  // - If opened via Dock -> Show All Comments (or General ones)
  // - If opened via Paragraph Badge -> Show Paragraph Comments
  
  const displayComments = activeParagraphId ? filteredComments : comments;
  

  
  console.log('Reader Render State:', { loading, error, novel: !!novel, chapter: !!chapter, novelId, chapterId });

  if (loading) return <LoadingOverlay />;
  
  if (error) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Chapter</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <div className="text-xs text-left bg-gray-100 p-2 rounded mb-4 overflow-auto max-w-md">
                  <p>NovelId: {novelId}</p>
                  <p>ChapterId: {chapterId}</p>
              </div>
              <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
              >
                  Return Home
              </button>
          </div>
      );
  }

  if (!novel || !chapter) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-10">
              <h1 className="text-xl font-bold mb-4">Debug: State Inconsistency</h1>
              <p>Loading: {String(loading)}</p>
              <p>Error: {String(error)}</p>
              <p>Novel: {novel ? 'Present' : 'Missing'}</p>
              <p>Chapter: {chapter ? 'Present' : 'Missing'}</p>
              <p>Params: {novelId} / {chapterId}</p>
          </div>
      );
  }

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

  // Calculate Display Price
  const effectivePrice = (novel.offerPrice && novel.offerPrice > 0) ? novel.offerPrice : chapter.price;

  // TTS State



  // TTS Logic
  const handleToggleTTS = () => {
      if (ttsActive) {
          // Stop
          window.speechSynthesis.cancel();
          setTtsActive(false);
          setIsSpeaking(false);
          setIsPaused(false);
      } else {
          // Start
          setTtsActive(true);
          startReading();
      }
  };

  const startReading = () => {
      if (!chapter) return;
      
      // Cancel any existing
      window.speechSynthesis.cancel();

      // Simple text extraction (stripping HTML)
      // For better experience, we could split by paragraphs and read one by one
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = chapter.content;
      const text = tempDiv.textContent || tempDiv.innerText || "";
      const fullText = chapter.title + '. ' + text;

      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = speechRate;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
      };

      utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setTtsActive(false);
      };

      utterance.onboundary = (event) => {
          // Estimate progress based on character index
          const progress = (event.charIndex / fullText.length) * 100;
          setTtsProgress(progress);
      };

      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
  };

  const togglePlayPause = () => {
      if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
          setIsSpeaking(true);
      } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
          setIsSpeaking(false);
      }
  };

  const changeSpeed = () => {
      const newRate = speechRate >= 2 ? 0.75 : speechRate + 0.25;
      setSpeechRate(newRate);
      
      // If currently speaking, we need to restart with new rate (browser limitation)
      // Or just set it for next time. Some browsers support dynamic rate change, some don't.
      // For reliability, we'll just update state. The user might need to restart or we can try to restart at current position (complex).
      // Simple approach: show toast "Speed updated for next sentence" or just let it apply on restart.
      // Better approach for "live" update: cancel and restart from approximate location is hard without paragraph splitting.
      // Let's just update the state and if they pause/play or restart it applies.
      if (ttsActive && !isPaused) {
          window.speechSynthesis.cancel();
          setTimeout(startReading, 50); // Restart
      }
  };

  return (
    <div className={'min-h-screen relative ' + (isSepia ? 'bg-[#f4ecd8] text-[#5b4636]' : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-300')}>
      
      {/* Ambience Overlay */}
      {ambience !== 'none' && (
          <div className={'fixed inset-0 pointer-events-none z-0 ' + (
              ambience === 'rain' ? 'ambience-rain' : 
              ambience === 'fire' ? 'ambience-fire' : 
              ambience === 'cosmic' ? 'ambience-cosmic' : ''
          )} />
      )}

      {/* Top Navigation Bar */}
      <div className={'fixed top-0 left-0 right-0 h-14 z-40 border-b flex flex-col justify-center transition-colors ' + (isSepia ? 'bg-[#f4ecd8]/95 border-[#e4dcc8]' : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800') + ' backdrop-blur-md'}>
        <div className="flex items-center justify-between px-4 w-full h-full">
            <div className="flex items-center overflow-hidden">
                <Link to={'/novel/' + novelId} className="p-2 mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0">
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
                
                {/* TTS Toggle */}
                {!locked && (
                    <button 
                        onClick={handleToggleTTS}
                        className={'p-2 rounded-full transition-colors ' + (ttsActive ? 'bg-primary text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400')}
                        title="Listen to Chapter"
                    >
                        <Headphones size={20} />
                    </button>
                )}

                {/* AI Summary - Only show if unlocked AND enabled in settings */}
                {!locked && settings.showChapterSummary && (
                    <ScaleButton onClick={handleSummarize} className="hidden sm:flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                        <Sparkles size={14} /> {summarizing ? 'Thinking...' : 'AI Summary'}
                    </ScaleButton>
                )}
            </div>
        </div>
        {/* Progress Line */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-100 ease-out" style={{ width: scrollProgress + '%' }}></div>
      </div>

      {/* TTS Player Floating Bar */}
      <AnimatePresence>
          {ttsActive && (
              <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-white/10 dark:border-slate-200"
              >
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase opacity-50 tracking-wider">Audiobook Mode</span>
                      <span className="text-xs font-bold truncate max-w-[150px]">{chapter.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      <button onClick={changeSpeed} className="text-xs font-mono font-bold w-8 hover:text-primary transition-colors">
                          {speechRate}x
                      </button>
                      
                      <button 
                          onClick={togglePlayPause}
                          className="w-10 h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                      >
                          {isPaused ? <Play size={18} className="ml-1"/> : <Pause size={18} />}
                      </button>
                      
                      <button onClick={handleToggleTTS} className="hover:text-red-400 transition-colors">
                          <X size={18} />
                      </button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

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
            onClick={() => {
                setActivePanel(activePanel === 'comments' ? 'none' : 'comments');
                setActiveParagraphId(null); // Reset to general comments when opening from dock
            }}
            tooltip="Comments"
            badge={comments.length}
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
                    ? "Please login to read this premium chapter." 
                    : "Support the author and unlock this chapter to continue reading."}
            </p>
            <ScaleButton 
              onClick={handlePurchase}
              disabled={!settings.enablePayments && !!user}
              className={'px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/20 ' + (!settings.enablePayments && !!user ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-primary hover:bg-indigo-700 text-white')}
            >
              {!settings.enablePayments && !user 
                  ? "Login to Read" 
                  : (!settings.enablePayments && !!user)
                    ? "Premium Chapter (Payments Disabled)"
                    : 'Unlock for ' + effectivePrice + ' Coins'}
            </ScaleButton>
          </FadeIn>
        ) : (
          <div 
            className={'prose dark:prose-invert max-w-none leading-loose ' + (fontFamily === 'serif' ? 'font-serif' : 'font-sans')}
            style={{ fontSize: fontSize + 'px' }}
          >
              {paragraphs.map((p) => (
                  <div key={p.id} className="relative group mb-4">
                      <div dangerouslySetInnerHTML={{ __html: p.content }} />
                      
                      {/* Paragraph Comment Badge */}
                      <button 
                          onClick={() => {
                              setActiveParagraphId(p.id);
                              setActivePanel('comments');
                          }}
                          className={'absolute -right-12 top-0 transform translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center w-8 h-6 rounded-full text-[10px] font-bold shadow-sm ' + (
                              commentsByParagraph[p.id] 
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 opacity-100' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-primary hover:text-white'
                          )}
                      >
                          {commentsByParagraph[p.id] || <MessageSquare size={12} />}
                      </button>
                  </div>
              ))}
          </div>
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
                        <span className="text-sm font-medium truncate w-full">{prevChapter ? 'Ch. ' + prevChapter.order : 'First Chapter'}</span>
                    </button>

                    <button 
                        onClick={handleNext} 
                        disabled={!nextChapter}
                        className="flex flex-col items-end px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors text-right max-w-[45%]"
                    >
                        <span className="text-xs uppercase opacity-50 font-bold flex items-center mb-1">Next <ChevronRight size={12} className="ml-1"/></span>
                        <span className="text-sm font-medium truncate w-full">{nextChapter ? 'Ch. ' + nextChapter.order : 'Latest'}</span>
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
                    className={'fixed top-0 right-0 bottom-0 w-80 sm:w-96 z-50 shadow-2xl flex flex-col ' + (isSepia ? 'bg-[#f9f3e6] border-l border-[#e4dcc8]' : 'bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800')}
                >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                        <h2 className="font-bold text-lg">
                            {activePanel === 'toc' && 'Table of Contents'}
                            {activePanel === 'comments' && (activeParagraphId ? 'Paragraph Comments' : 'Comments (' + comments.length + ')')}
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
                                                const isNovelFree = !!novel.isFree;
                                                const isChPremium = ch.isPaid && !isNovelFree;
                                                
                                                const isChOwned = !isChPremium || (user && (user.purchasedChapters.includes(ch.id) || user.role === 'admin')) || (!settings.enablePayments && !!user);
                                                const isChLocked = !isChOwned;

                                                return (
                                                    <button
                                                        key={ch.id}
                                                        onClick={() => {
                                                            navigate('/read/' + novelId + '/' + ch.id);
                                                            setActivePanel('none');
                                                        }}
                                                        className={'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ' + (ch.id === chapter.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5')}
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
                                {activeParagraphId && (
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-xs italic opacity-70 mb-4 border-l-2 border-primary">
                                        Viewing comments for paragraph {parseInt(activeParagraphId) + 1}
                                        <button onClick={() => setActiveParagraphId(null)} className="ml-2 text-primary font-bold hover:underline">
                                            View All
                                        </button>
                                    </div>
                                )}
                                
                                {displayComments.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <MessageSquare size={32} className="mx-auto mb-2 opacity-50"/>
                                        <p>No comments yet. Be the first!</p>
                                    </div>
                                ) : (
                                    displayComments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className={'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ' + (comment.avatarColor || 'bg-slate-500')}>
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
                                    ))
                                )}
                                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                                    <textarea 
                                        ref={textareaRef}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={activeParagraphId ? "Comment on this paragraph..." : "What are your thoughts?"}
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
                                            className={'py-3 px-4 rounded-xl border text-sm transition-all ' + (fontFamily === 'sans' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400')}
                                        >
                                            Sans Serif
                                        </button>
                                        <button 
                                            onClick={() => setFontFamily('serif')} 
                                            className={'py-3 px-4 rounded-xl border text-sm font-serif transition-all ' + (fontFamily === 'serif' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400')}
                                        >
                                            Serif
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-4 opacity-60">Zen Ambience</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['none', 'rain', 'fire', 'cosmic'].map((mode) => (
                                            <button 
                                                key={mode}
                                                onClick={() => setAmbience(mode as any)} 
                                                className={'py-3 px-4 rounded-xl border text-sm capitalize transition-all ' + (ambience === mode ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400')}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] opacity-50 mt-2">
                                        * Note: Audio requires adding .mp3 files to /public/audio/
                                    </p>
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

const DockButton = ({ icon, active, onClick, tooltip, badge }: any) => (
    <div className="relative group">
        <button 
            onClick={onClick}
            className={'p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center relative ' + (active ? 'bg-primary text-white scale-110' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary')}
        >
            {icon}
            {badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </button>
        {/* Tooltip */}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {tooltip}
        </div>
    </div>
);