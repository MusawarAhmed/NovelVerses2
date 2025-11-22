
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MockBackendService } from '../services/mockBackend';
import { Novel } from '../types';
import { Trophy, TrendingUp, Flame, Compass, Star, Eye, BookOpen } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/Anim';

export const Browse: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [activeTab, setActiveTab] = useState<'Power' | 'Collection' | 'Active'>('Power');

  // Determine page title and icon based on type
  const getHeaderInfo = () => {
    switch (type) {
      case 'featured':
        return { title: 'Weekly Featured', icon: Star, color: 'text-purple-500' };
      case 'rising':
        return { title: 'Rising Fictions', icon: Flame, color: 'text-orange-500' };
      case 'rankings':
        return { title: 'Rankings', icon: Trophy, color: 'text-yellow-500' };
      default:
        return { title: 'Browse All', icon: Compass, color: 'text-blue-500' };
    }
  };

  const { title, icon: Icon, color } = getHeaderInfo();

  useEffect(() => {
    let data: Novel[] = [];
    switch (type) {
      case 'featured':
        data = MockBackendService.getWeeklyFeatured();
        break;
      case 'rising':
        data = MockBackendService.getRisingStars();
        break;
      case 'rankings':
        data = MockBackendService.getRankedNovels(activeTab);
        break;
      default:
        data = MockBackendService.getNovels();
        break;
    }
    setNovels(data);
  }, [type, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <FadeIn className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Icon size={32} className={color} />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {type === 'featured' && "Hand-picked selections for this week."}
          {type === 'rising' && "New novels gaining rapid popularity."}
          {type === 'rankings' && "The top novels across the platform."}
          {type === 'all' && "Explore our vast library of stories."}
        </p>
      </FadeIn>

      {/* Ranking Tabs */}
      {type === 'rankings' && (
        <div className="flex space-x-2 mb-8 border-b border-slate-200 dark:border-slate-700 pb-1">
          {['Power', 'Collection', 'Active'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === tab 
                  ? 'text-primary' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab} Ranking
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Novels Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {novels.length > 0 ? (
          novels.map((novel, index) => (
            <StaggerItem key={novel.id}>
              <Link 
                to={`/novel/${novel.id}`} 
                className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 overflow-hidden h-full"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img 
                    src={novel.coverUrl} 
                    alt={novel.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {type === 'rankings' && (
                    <div className={`absolute top-0 left-0 w-10 h-10 flex items-center justify-center text-white font-bold text-lg rounded-br-xl shadow-lg ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-700' : 'bg-slate-800/80'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md flex items-center">
                    <Star size={12} className="text-yellow-400 mr-1 fill-yellow-400" /> {novel.rating}
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {novel.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{novel.author}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md font-medium">
                      {novel.category}
                    </span>
                    {novel.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                     <div className="flex items-center"><Eye size={12} className="mr-1"/> {novel.views.toLocaleString()}</div>
                     <div className="flex items-center"><BookOpen size={12} className="mr-1"/> Read</div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-slate-500 text-lg">No novels found in this category.</p>
            <Link to="/" className="text-primary mt-4 inline-block hover:underline">Go Back Home</Link>
          </div>
        )}
      </StaggerContainer>
    </div>
  );
};
