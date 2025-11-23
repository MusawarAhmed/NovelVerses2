
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { MockBackendService } from '../services/mockBackend';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, CreditCard, Clock, ChevronRight, Bookmark } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, refreshUser } = useContext(AppContext);

  if (!user) return null;

  const bookmarks = user.bookmarks.map(id => MockBackendService.getNovelById(id)).filter(Boolean);
  
  // Sort history by lastReadAt (desc)
  const historyItems = (user.readingHistory || [])
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
    .map(item => {
        const novel = MockBackendService.getNovelById(item.novelId);
        const chapter = MockBackendService.getChapter(item.chapterId);
        return { ...item, novel, chapter };
    })
    .filter(item => item.novel && item.chapter); // Filter out deleted/invalid

  const handleAddCoins = () => {
      // Mock payment
      if(window.confirm("Purchase 100 coins for $0.99? (Mock Stripe)")) {
          // Direct mutation for mock demo
          user.coins += 100;
          localStorage.setItem('nv_user', JSON.stringify(user));
          // Sync mock db
          const users = JSON.parse(localStorage.getItem('nv_users') || '[]');
          const idx = users.findIndex((u: any) => u.id === user.id);
          if(idx >= 0) {
              users[idx].coins = user.coins;
              localStorage.setItem('nv_users', JSON.stringify(users));
          }
          refreshUser();
          alert("Payment successful! +100 Coins");
      }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl text-white font-bold mr-6 shadow-lg shadow-indigo-500/20">
                    {user.username[0].toUpperCase()}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.username}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                    <div className="mt-3 inline-flex items-center px-4 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm font-bold">
                        <Coins size={16} className="mr-2" /> {user.coins} Coins
                    </div>
                </div>
            </div>
            <button 
                onClick={handleAddCoins}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center hover:opacity-90 transition-opacity shadow-lg"
            >
                <CreditCard size={18} className="mr-2" /> Top Up Wallet
            </button>
        </div>
      </div>

      {/* Continue Reading Section */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <Clock size={24} className="mr-2 text-primary"/> Continue Reading
        </h3>
        
        {historyItems.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500">No recent reading history.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyItems.map((item: any) => (
                    <Link key={item.novelId} to={`/read/${item.novelId}/${item.chapterId}`} className="flex bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-slate-100 dark:border-slate-700 group h-36">
                        <img src={item.novel.coverUrl} alt={item.novel.title} className="w-24 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">{item.novel.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Last read: {new Date(item.lastReadAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="inline-flex items-center text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                    Reading: {item.chapter.title}
                                </span>
                            </div>
                        </div>
                        <div className="w-8 flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 border-l border-slate-100 dark:border-slate-700 text-slate-400 group-hover:text-primary transition-colors">
                            <ChevronRight size={20} />
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>

      {/* Library / Bookmarks */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <Bookmark size={24} className="mr-2 text-secondary"/> My Library
        </h3>
        
        {bookmarks.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Your library is empty.</p>
                <Link to="/browse/all" className="text-primary font-medium mt-2 inline-block hover:underline">Browse Novels</Link>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {bookmarks.map((novel: any) => (
                    <Link key={novel.id} to={`/novel/${novel.id}`} className="group block">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all">
                            <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">{novel.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            {novel.category}
                        </p>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
