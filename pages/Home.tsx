import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NovelService } from '../services/novelService';
import { Novel, SiteSettings } from '../types';
import { TrendingUp, Star, Clock, Zap, Trophy, Crown, Flame, BookOpen, ChevronRight, PenTool, Gift } from 'lucide-react';
import { FadeIn, BlurIn, StaggerContainer, StaggerItem, ScaleButton, BlobBackground } from '../components/Anim';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SEO } from '../components/SEO';
import BookCard3D from '../components/BookCard3D';

import BookSlider from '../components/BookSlider';



const HeroCarousel = ({ novels, title }: { novels: Novel[], title: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % novels.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [novels.length]);

    const getNovelLink = (n: Novel) => n.slug ? `/novel/${n.slug}_${n.id}` : `/novel/${n.id}`;

    if (!novels.length) return null;

    return (
        <div className="relative bg-slate-900 text-white overflow-hidden group">
             {/* Background Layers */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out">
                 {novels.map((novel, idx) => (
                    <div key={novel.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                         <img src={novel.coverUrl} alt="" className="w-full h-full object-cover blur-xl opacity-40 scale-105" />
                    </div>
                 ))}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40" />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 h-[500px] md:h-[600px] flex items-center">
                 <div className="relative w-full h-full">
                    {novels.map((novel, idx) => (
                        <div 
                            key={novel.id} 
                            className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center md:items-start gap-8 px-4 ${idx === currentIndex ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-8 -z-10'}`}
                        >
                            <div className="flex-shrink-0 w-32 md:w-56 shadow-2xl rounded-lg overflow-hidden border-2 border-white/10 transform md:translate-y-4">
                                <img src={novel.coverUrl} alt={novel.title} className="w-full h-auto" />
                            </div>
                            <div className="flex-1 text-center md:text-left pt-4 md:pt-0">
                                <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold mb-4">
                                    {title.toUpperCase()}
                                </span>
                                <h1 className="text-2xl md:text-5xl font-bold mb-4 font-serif tracking-tight line-clamp-2">{novel.title}</h1>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-300 mb-6">
                                    <span className="text-white font-medium">{novel.author}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span>{novel.category}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span className="flex items-center text-yellow-400"><Star size={14} className="fill-current mr-1"/> {novel.rating}</span>
                                </div>
                                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mb-8 line-clamp-3">
                                    {novel.description}
                                </p>
                                <div className="flex gap-4 justify-center md:justify-start">
                                     <Link to={getNovelLink(novel)}>
                                        <button className="bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/30">
                                            Read Now
                                        </button>
                                    </Link>
                                     <Link to={getNovelLink(novel)}>
                                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-all backdrop-blur-sm">
                                            Details
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Inputs */}
            {novels.length > 1 && (
                <>
                    <button 
                        onClick={() => setCurrentIndex(prev => (prev - 1 + novels.length) % novels.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <button 
                        onClick={() => setCurrentIndex(prev => (prev + 1) % novels.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                        <ChevronRight size={24} />
                    </button>
                    
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                        {novels.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export const Home: React.FC = () => {
  const [weeklyFeatured, setWeeklyFeatured] = useState<Novel[]>([]);
  const [powerRanking, setPowerRanking] = useState<Novel[]>([]);
  const [collectionRanking, setCollectionRanking] = useState<Novel[]>([]);
  const [activeRanking, setActiveRanking] = useState<Novel[]>([]);
  const [risingStars, setRisingStars] = useState<Novel[]>([]);
  const [bookSliderNovels, setBookSliderNovels] = useState<Novel[]>([]);
  const [heroSliderNovels, setHeroSliderNovels] = useState<Novel[]>([]);
  const [mainFeature, setMainFeature] = useState<Novel | null>(null);
  const [categorySectionNovels, setCategorySectionNovels] = useState<Novel[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Load settings first to ensure page renders something
            const siteSettings = await NovelService.getSiteSettings();
            setSettings(siteSettings);
            const config = siteSettings.featuredConfig || {};

            // Helper to fetch novels by IDs
            const fetchManualNovels = async (ids: string[]) => {
                if (!ids || ids.length === 0) return [];
                const promises = ids.map(id => NovelService.getNovel(id).catch(() => null));
                const results = await Promise.all(promises);
                return results.filter(n => n !== null) as Novel[];
            };

            // 1. Hero Section Logic
            let heroNovel: Novel | null = null;
            if (config.heroNovelId) {
                try {
                    heroNovel = await NovelService.getNovel(config.heroNovelId);
                } catch (e) { console.error("Failed to load manual hero", e); }
            }
            
            // 1b. Hero Slider Logic
            let heroSlides: Novel[] = [];
            if (config.heroMode === 'slider' && config.heroSliderIds?.length) {
                heroSlides = await fetchManualNovels(config.heroSliderIds);
                setHeroSliderNovels(heroSlides);
            }

            // 2. Weekly Featured Logic
            let weekly: Novel[] = [];
            if (config.weeklyNovelIds && config.weeklyNovelIds.length > 0) {
                weekly = await fetchManualNovels(config.weeklyNovelIds);
            }
            // Fallback for Weekly if manual list empty, or mixed logic (if manual < 5, should we fill? For now strict override)
            if (weekly.length === 0) {
               weekly = await NovelService.getWeeklyFeatured(5);
            }
            
            setWeeklyFeatured(weekly);
            // Default main feature to manual hero OR first weekly
            setMainFeature(heroNovel || weekly[0] || null);
            
            // 3. Slider Logic
            let sliderNovels: Novel[] = [];
            if (config.sliderNovelIds && config.sliderNovelIds.length > 0) {
                 sliderNovels = await fetchManualNovels(config.sliderNovelIds);
            }
            if (sliderNovels.length === 0) {
                sliderNovels = await NovelService.getNovels({ limit: 10 });
            }
            setBookSliderNovels(sliderNovels);
            
            // Rankings Logic
            let power: Novel[] = [];
            if (config.rankingConfig?.powerNovelIds?.length) {
                power = await fetchManualNovels(config.rankingConfig.powerNovelIds);
            }
            if (power.length === 0) power = await NovelService.getRankedNovels('Power', 5);
            setPowerRanking(power);
            
            let collection: Novel[] = [];
            if (config.rankingConfig?.collectionNovelIds?.length) {
                collection = await fetchManualNovels(config.rankingConfig.collectionNovelIds);
            }
            if (collection.length === 0) collection = await NovelService.getRankedNovels('Collection', 5);
            setCollectionRanking(collection);
            
            let active: Novel[] = [];
            if (config.rankingConfig?.activeNovelIds?.length) {
                active = await fetchManualNovels(config.rankingConfig.activeNovelIds);
            }
            if (active.length === 0) active = await NovelService.getRankedNovels('Active', 5);
            setActiveRanking(active);
            
            // 4. Rising Stars Logic
            let rising: Novel[] = [];
             if (config.risingNovelIds && config.risingNovelIds.length > 0) {
                rising = await fetchManualNovels(config.risingNovelIds);
            }
            if (rising.length === 0) {
                rising = await NovelService.getRisingStars(4);
            }
            setRisingStars(rising);

            // 5. Custom Category Section
            if (config.homeCategorySection?.show && config.homeCategorySection?.category) {
                 const catNovels = await NovelService.getNovels({ 
                     category: config.homeCategorySection.category, 
                     limit: 8 
                 });
                 setCategorySectionNovels(catNovels);
            }
        } catch (e) {
            console.error("Failed to fetch home data", e);
            // Ensure settings are set if they weren't already
            if (!settings) {
                 setSettings(await NovelService.getSiteSettings());
            }
        }
    };
    fetchData();
  }, []);

  const getNovelLink = (n: Novel) => {
      if (n.slug) return `/novel/${n.slug}_${n.id}`;
      return `/novel/${n.id}`;
  };

  const RankingList = ({ title, novels, icon: Icon, colorClass }: { title: string, novels: Novel[], icon: any, colorClass: string }) => (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm h-full">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className={`font-bold text-lg flex items-center ${colorClass}`}>
                <Icon size={20} className="mr-2" /> {title}
            </h3>
            <Link to="/browse/rankings" className="text-xs text-slate-400 cursor-pointer hover:text-primary">More</Link>
          </div>
          <div className="space-y-4">
              {novels.map((novel, index) => (
                  <Link key={novel.id} to={getNovelLink(novel)} className="flex items-start group">
                      <div className={`text-lg font-bold w-8 ${index < 3 ? colorClass : 'text-slate-300 dark:text-slate-600'}`}>
                          {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </div>
                      <div className="w-12 h-16 flex-shrink-0 mr-3 overflow-hidden rounded">
                          <img src={novel.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={novel.title}/>
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">{novel.title}</h4>
                          <p className="text-xs text-slate-400 mb-1">{novel.category} • {novel.rating} <Star size={10} className="inline text-yellow-400 fill-current"/></p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{novel.tags[0]}</p>
                      </div>
                  </Link>
              ))}
          </div>
      </div>
  );

  if (!settings) return null;

  return (
    <div className="pb-20">
      <SEO title="Home" description="Read the best web novels, fanfics, and original stories online." />
      
      {/* Hero / Weekly Book */}
      {/* Hero Section */}
      {settings.showHero && (
        settings.featuredConfig?.heroMode === 'slider' && heroSliderNovels.length > 0 ? (
            <HeroCarousel novels={heroSliderNovels} title={settings.featuredConfig?.heroTitle || "Featured"} />
        ) : (
            mainFeature && (
                <div className="relative bg-slate-900 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/80 z-10"></div>
                    <div className="absolute inset-0 z-0">
                        <img src={mainFeature.coverUrl} alt="" className="w-full h-full object-cover blur-xl opacity-50" />
                    </div>
                    
                    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="flex-shrink-0 w-40 md:w-56 shadow-2xl rounded-lg overflow-hidden border-2 border-white/10 transform md:translate-y-4">
                                <img src={mainFeature.coverUrl} alt={mainFeature.title} className="w-full h-auto" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold mb-4">
                                    {(settings.featuredConfig?.heroTitle || "WEEKLY FEATURED").toUpperCase()}
                                </span>
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 font-serif tracking-tight">{mainFeature.title}</h1>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-300 mb-6">
                                    <span className="text-white font-medium">{mainFeature.author}</span>
                                    <span>•</span>
                                    <span>{mainFeature.category}</span>
                                    <span>•</span>
                                    <span className="flex items-center text-yellow-400"><Star size={14} className="fill-current mr-1"/> {mainFeature.rating}</span>
                                </div>
                                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mb-8 line-clamp-3 md:line-clamp-4">
                                    {mainFeature.description}
                                </p>
                                <div className="flex gap-4 justify-center md:justify-start">
                                     <Link to={getNovelLink(mainFeature)}>
                                        <ScaleButton className="bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/30">
                                            Read Now
                                        </ScaleButton>
                                    </Link>
                                    <Link to={getNovelLink(mainFeature)}>
                                        <ScaleButton className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-all backdrop-blur-sm">
                                            Details
                                        </ScaleButton>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
      )}

      {/* 3D Book Slider Section */}
      {settings.showBookSlider && bookSliderNovels.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <BookSlider novels={bookSliderNovels} title={settings.featuredConfig?.sliderTitle || "Editor's Choice"} />
          </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        
        {/* Weekly Featured Grid */}
        {settings.showWeeklyFeatured && (
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{settings.featuredConfig?.weeklyTitle || "Weekly Featured"}</h2>
                    <Link to="/browse/featured" className="text-sm text-slate-500 hover:text-primary flex items-center">View More <ChevronRight size={16}/></Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {weeklyFeatured.map(novel => (
                        <Link key={novel.id} to={getNovelLink(novel)} className="group">
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all">
                                <img src={novel.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={novel.title}/>
                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                    {novel.category}
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">{novel.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{novel.tags[0]}</p>
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {/* Custom Category Section */}
        {settings.featuredConfig?.homeCategorySection?.show && categorySectionNovels.length > 0 && (
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {settings.featuredConfig?.homeCategorySection?.title || "Category Feature"}
                    </h2>
                    <Link to={`/search?category=${settings.featuredConfig?.homeCategorySection?.category}`} className="text-sm text-slate-500 hover:text-primary flex items-center">
                        View More <ChevronRight size={16}/>
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {categorySectionNovels.map(novel => (
                        <div key={novel.id} className="flex flex-col items-center">
                            <BookCard3D novel={novel} />
                             <Link to={getNovelLink(novel)} className="text-center mt-2 group">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1 px-2">{novel.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{novel.tags[0]}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Rankings Section */}
        {settings.showRankings && (
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{settings.featuredConfig?.rankingConfig?.ranksTitle || "Rankings"}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RankingList 
                        title="Power Ranking" 
                        novels={powerRanking} 
                        icon={Zap} 
                        colorClass="text-blue-600 dark:text-blue-400" 
                    />
                    <RankingList 
                        title="Collection Ranking" 
                        novels={collectionRanking} 
                        icon={Trophy} 
                        colorClass="text-yellow-600 dark:text-yellow-400" 
                    />
                    <RankingList 
                        title="Active Ranking" 
                        novels={activeRanking} 
                        icon={Crown} 
                        colorClass="text-red-600 dark:text-red-400" 
                    />
                </div>
            </section>
        )}

        {/* Rising Fictions / Potential Starlet */}
        {settings.showRising && (
            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                        <Flame className="text-orange-500 mr-2" /> {settings.featuredConfig?.risingTitle || "Rising Fictions"}
                    </h2>
                    <Link to="/browse/rising" className="text-sm text-slate-500 hover:text-primary flex items-center">View More <ChevronRight size={16}/></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {risingStars.map(novel => (
                        <Link key={novel.id} to={getNovelLink(novel)} className="flex bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group">
                            <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden mr-4">
                                <img src={novel.coverUrl} className="w-full h-full object-cover" alt={novel.title}/>
                            </div>
                            <div className="flex flex-col justify-between py-1">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">{novel.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-1">{novel.category}</p>
                                </div>
                                <div className="text-xs font-medium text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded self-start">
                                    Rising Star
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {/* Tags / Discovery */}
        {settings.showTags && (
            <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{settings.featuredConfig?.tagsTitle || "Popular Tags"}</h2>
                <div className="flex flex-wrap gap-3">
                    {(settings.featuredConfig?.tagConfig && settings.featuredConfig.tagConfig.length > 0 
                        ? settings.featuredConfig.tagConfig 
                        : ["System", "Cultivation", "Reincarnation", "Romance", "Vampire", "Magic", "Cyberpunk", "Apocalypse", "Slice of Life", "Dungeon", "Overpowered", "Villain", "Comedy", "Horror"]
                    ).map(tag => (
                        <Link key={tag} to={`/search?q=${tag}`} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                            {tag}
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {/* Meet Webnovel / Promo */}
        {settings.showPromo && (
            <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-100 dark:border-slate-700">
                <div className="max-w-lg">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {settings.featuredConfig?.promoConfig?.title || "Meet NovelVerse"}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                        {settings.featuredConfig?.promoConfig?.content || "Join thousands of authors and readers. Create your own world, share your stories, and get supported by a vibrant community."}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to={settings.featuredConfig?.promoConfig?.primaryButtonLink || "/auth"} className="flex items-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90 transition-opacity">
                            <PenTool size={18} className="mr-2" /> {settings.featuredConfig?.promoConfig?.primaryButtonText || "Start Writing"}
                        </Link>
                        <Link to={settings.featuredConfig?.promoConfig?.secondaryButtonLink || "/search"} className="flex items-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Gift size={18} className="mr-2" /> {settings.featuredConfig?.promoConfig?.secondaryButtonText || "Benefits"}
                        </Link>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto flex gap-4 opacity-80">
                    <div className="w-24 h-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg transform -rotate-6"></div>
                    <div className="w-24 h-32 bg-primary rounded-lg shadow-lg transform rotate-0 -mt-8"></div>
                    <div className="w-24 h-32 bg-secondary rounded-lg shadow-lg transform rotate-6"></div>
                </div>
            </section>
        )}

      </div>
    </div>
  );
};