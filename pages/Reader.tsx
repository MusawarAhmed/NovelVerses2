import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MockBackendService } from '../services/mockBackend';
import { Novel, Chapter } from '../types';
import { AppContext } from '../App';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { FadeIn, ScaleButton, BlurIn } from '../components/Anim';
import { motion, AnimatePresence } from 'framer-motion';

export const Reader: React.FC = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, theme } = useContext(AppContext);
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('serif');
  const [showSettings, setShowSettings] = useState(false);
  const [locked, setLocked] = useState(false);
  
  // AI State
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (!novelId || !chapterId) return;
    const n = MockBackendService.getNovelById(novelId);
    const c = MockBackendService.getChapter(chapterId);
    const allChapters = MockBackendService.getChapters(novelId);

    if (n && c) {
      setNovel(n);
      setChapter(c);
      setChapters(allChapters);
      
      // Check Access
      const isOwned = !c.isPaid || (user && (user.purchasedChapters.includes(c.id) || user.role === 'admin'));
      setLocked(!isOwned);
      setSummary(null); // Reset summary
    } else {
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [novelId, chapterId, user, navigate]);

  const handlePurchase = () => {
    if (!user) return navigate('/auth');
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

  if (!novel || !chapter) return <div className="p-10 text-center">Loading...</div>;

  const isSepia = theme === 'sepia';

  return (
    <div className={`min-h-screen pb-20 ${isSepia ? 'bg-[#f4ecd8] text-[#5b4636]' : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-300'}`}>
      
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50 border-b transition-colors ${isSepia ? 'bg-[#f4ecd8]/90 border-[#e4dcc8]' : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800'} backdrop-blur-sm`}
      >
        <div className="flex items-center">
          <Link to={`/novel/${novelId}`} className="p-2 mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-sm font-semibold truncate max-w-[150px] sm:max-w-md">{novel.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ScaleButton onClick={handleSummarize} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
             <Sparkles size={14} /> {summarizing ? 'Thinking...' : 'AI Summary'}
          </ScaleButton>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
            <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-16 right-4 w-64 p-4 rounded-xl shadow-2xl z-50 border ${isSepia ? 'bg-[#f9f3e6] border-[#e4dcc8]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
            >
            <div className="mb-4">
                <label className="block text-xs font-bold uppercase mb-2 opacity-60">Font Size</label>
                <input 
                type="range" min="14" max="28" 
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-primary h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase mb-2 opacity-60">Font Family</label>
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                <button onClick={() => setFontFamily('sans')} className={`flex-1 py-1 text-sm rounded-md ${fontFamily === 'sans' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'opacity-50'}`}>Sans</button>
                <button onClick={() => setFontFamily('serif')} className={`flex-1 py-1 text-sm rounded-md font-serif ${fontFamily === 'serif' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'opacity-50'}`}>Serif</button>
                </div>
            </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 pt-24 sm:px-8">
        <BlurIn className="text-2xl md:text-3xl font-bold mb-8 text-center font-serif">{chapter.title}</BlurIn>
        
        {summary && (
          <FadeIn className="mb-8 p-6 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-sm mb-2">
              <Sparkles size={16} /> AI Summary
            </div>
            <p className="text-sm leading-relaxed opacity-90 whitespace-pre-line">{summary}</p>
          </FadeIn>
        )}

        {locked ? (
          <FadeIn className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Locked Chapter</h3>
            <p className="text-slate-500 mb-6">Support the author to read this chapter.</p>
            <ScaleButton 
              onClick={handlePurchase}
              className="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/20"
            >
              Unlock for {chapter.price} Coins
            </ScaleButton>
          </FadeIn>
        ) : (
          <motion.div 
            key={chapter.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`prose dark:prose-invert max-w-none leading-relaxed ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        )}

        {/* Navigation */}
        <FadeIn delay={0.2} className="flex justify-between items-center mt-16 pt-8 border-t border-black/5 dark:border-white/5">
          <ScaleButton 
            onClick={handlePrev} 
            disabled={chapters[0].id === chapter.id}
            className="flex items-center px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" /> Previous
          </ScaleButton>
          <ScaleButton 
            onClick={handleNext} 
            disabled={chapters[chapters.length-1].id === chapter.id}
            className="flex items-center px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-30 disabled:bg-slate-300 transition-colors"
          >
            Next <ChevronRight size={20} className="ml-1" />
          </ScaleButton>
        </FadeIn>
      </div>
    </div>
  );
};