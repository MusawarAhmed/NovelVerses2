import React, { useContext } from 'react';
import { AppContext } from '../App';
import { MockBackendService } from '../services/mockBackend';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, CreditCard } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, refreshUser } = useContext(AppContext);

  if (!user) return null;

  const bookmarks = user.bookmarks.map(id => MockBackendService.getNovelById(id)).filter(Boolean);

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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl text-white font-bold mr-6">
                    {user.username[0].toUpperCase()}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.username}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm font-bold">
                        <Coins size={16} className="mr-2" /> {user.coins} Coins
                    </div>
                </div>
            </div>
            <button 
                onClick={handleAddCoins}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-bold flex items-center hover:opacity-90 transition-opacity"
            >
                <CreditCard size={18} className="mr-2" /> Top Up Wallet
            </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-l-4 border-primary pl-3">My Library</h3>
      
      {bookmarks.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Your library is empty.</p>
              <Link to="/" className="text-primary font-medium mt-2 inline-block hover:underline">Browse Novels</Link>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bookmarks.map((novel: any) => (
                <Link key={novel.id} to={`/novel/${novel.id}`} className="flex bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 h-32">
                    <img src={novel.coverUrl} alt={novel.title} className="w-24 object-cover" />
                    <div className="p-4 flex flex-col justify-center">
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">{novel.title}</h4>
                        <p className="text-xs text-slate-500 mb-2">Continue Reading</p>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-1/3"></div> 
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
};