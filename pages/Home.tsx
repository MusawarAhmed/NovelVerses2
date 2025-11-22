
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MockBackendService } from '../services/mockBackend';
import { Novel } from '../types';
import { TrendingUp, Star, Clock, Zap, Trophy, Crown, Flame, BookOpen, ChevronRight, PenTool, Gift } from 'lucide-react';
import { FadeIn, BlurIn, StaggerContainer, StaggerItem, ScaleButton, BlobBackground } from '../components/Anim';

export const Home: React.FC = () => {
  const [weeklyFeatured, setWeeklyFeatured] = useState<Novel[]>([]);
  const [powerRanking, setPowerRanking] = useState<Novel[]>([]);
  const [collectionRanking, setCollectionRanking] = useState<Novel[]>([]);
  const [activeRanking, setActiveRanking] = useState<Novel[]>([]);
  const [risingStars, setRisingStars] = useState<Novel[]>([]);
  const [mainFeature, setMainFeature] = useState<Novel | null>(null);

  useEffect(() => {
    const weekly = MockBackendService.getWeeklyFeatured(5);
    setWeeklyFeatured(weekly);
    setMainFeature(weekly[0] || null);
    setPowerRanking(MockBackendService.getRankedNovels('Power', 5));
    setCollectionRanking(MockBackendService.getRankedNovels('Collection', 5));
    setActiveRanking(MockBackendService.getRankedNovels('Active', 5));
    setRisingStars(MockBackendService.getRisingStars(4));
  }, []);

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
                  <Link key={novel.id} to={`/novel/${novel.id}`} className="flex items-start group">
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

  return (
    <div className="pb-20">
      {/* Hero / Weekly Book */}
      {mainFeature && (
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
                            WEEKLY FEATURED
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
                             <Link to={`/novel/${mainFeature.id}`}>
                                <ScaleButton className="bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/30">
                                    Read Now
                                </ScaleButton>
                            </Link>
                            <Link to={`/novel/${mainFeature.id}`}>
                                <ScaleButton className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-all backdrop-blur-sm">
                                    Details
                                </ScaleButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        
        {/* Weekly Featured Grid */}
        <section>
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Featured</h2>
                <Link to="/browse/featured" className="text-sm text-slate-500 hover:text-primary flex items-center">View More <ChevronRight size={16}/></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {weeklyFeatured.map(novel => (
                    <Link key={novel.id} to={`/novel/${novel.id}`} className="group">
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

        {/* Rankings Section */}
        <section>
             <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rankings</h2>
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

        {/* Rising Fictions / Potential Starlet */}
        <section>
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                    <Flame className="text-orange-500 mr-2" /> Rising Fictions
                </h2>
                <Link to="/browse/rising" className="text-sm text-slate-500 hover:text-primary flex items-center">View More <ChevronRight size={16}/></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {risingStars.map(novel => (
                    <Link key={novel.id} to={`/novel/${novel.id}`} className="flex bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group">
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

        {/* Tags / Discovery */}
        <section>
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Popular Tags</h2>
             <div className="flex flex-wrap gap-3">
                 {["System", "Cultivation", "Reincarnation", "Romance", "Vampire", "Magic", "Cyberpunk", "Apocalypse", "Slice of Life", "Dungeon", "Overpowered", "Villain", "Comedy", "Horror"].map(tag => (
                     <Link key={tag} to={`/search?q=${tag}`} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                         {tag}
                     </Link>
                 ))}
             </div>
        </section>

        {/* Meet Webnovel / Promo */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-100 dark:border-slate-700">
            <div className="max-w-lg">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">Meet NovelVerse</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                    Join thousands of authors and readers. Create your own world, share your stories, and get supported by a vibrant community.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link to="/auth" className="flex items-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90 transition-opacity">
                        <PenTool size={18} className="mr-2" /> Start Writing
                    </Link>
                    <Link to="/search" className="flex items-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Gift size={18} className="mr-2" /> Benefits
                    </Link>
                </div>
            </div>
             <div className="flex-shrink-0 w-full md:w-auto flex gap-4 opacity-80">
                 <div className="w-24 h-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg transform -rotate-6"></div>
                 <div className="w-24 h-32 bg-primary rounded-lg shadow-lg transform rotate-0 -mt-8"></div>
                 <div className="w-24 h-32 bg-secondary rounded-lg shadow-lg transform rotate-6"></div>
             </div>
        </section>

      </div>
    </div>
  );
};
