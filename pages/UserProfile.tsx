import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { NovelService } from '../services/novelService';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, CreditCard, Clock, ChevronRight, Bookmark, Edit2, Save, X, RefreshCw, Check, AlertCircle, Eye, EyeOff, Trophy } from 'lucide-react';
import { FadeIn, ScaleButton } from '../components/Anim';

export const UserProfile: React.FC = () => {
  const { user, refreshUser, siteSettings } = useContext(AppContext);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
      username: '',
      email: '',
      newPassword: '',
      confirmPassword: ''
  });
  
  // Password UX State
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
      if (user) {
          setFormData({
              username: user.username,
              email: user.email,
              newPassword: '',
              confirmPassword: ''
          });
      }
  }, [user, isEditing]);

  if (!user) return null;

  // Data State
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  useEffect(() => {
      if (!user) return;
      const fetchUserData = async () => {
          // Fetch Bookmarks
          const bookmarkPromises = user.bookmarks.map(id => NovelService.getNovelById(id));
          const fetchedBookmarks = await Promise.all(bookmarkPromises);
          setBookmarks(fetchedBookmarks.filter(Boolean));

          // Fetch History
          const historyPromises = (user.readingHistory || []).map(async (item) => {
              const novel = await NovelService.getNovelById(item.novelId);
              const chapter = await NovelService.getChapter(item.chapterId);
              return { ...item, novel, chapter };
          });
          const fetchedHistory = await Promise.all(historyPromises);
          setHistoryItems(fetchedHistory.filter(item => item.novel && item.chapter).sort((a: any, b: any) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()));
      };
      fetchUserData();
  }, [user]);

  // --- Password Logic ---

  const validatePassword = (pwd: string): boolean => {
      if (!pwd) return true; // Empty allowed (means no change)
      
      const hasLength = pwd.length >= 8;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

      if (!hasLength) { setPasswordError("Password must be at least 8 characters."); return false; }
      if (!hasUpper) { setPasswordError("Password must contain at least one capital letter."); return false; }
      if (!hasSpecial) { setPasswordError("Password must contain at least one special character."); return false; }
      
      setPasswordError(null);
      return true;
  };

  const generatePassword = () => {
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const special = "!@#$%^&*";
      const all = upper + lower + numbers + special;

      let pwd = "";
      // Ensure requirements
      pwd += upper[Math.floor(Math.random() * upper.length)];
      pwd += special[Math.floor(Math.random() * special.length)];
      pwd += numbers[Math.floor(Math.random() * numbers.length)];
      
      // Fill rest
      for (let i = 0; i < 9; i++) {
          pwd += all[Math.floor(Math.random() * all.length)];
      }
      
      // Shuffle
      pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
      
      setFormData(prev => ({ ...prev, newPassword: pwd, confirmPassword: pwd }));
      setPasswordError(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaveMessage(null);

      // Basic validation
      if (!formData.username.trim() || !formData.email.trim()) {
          alert("Username and Email are required.");
          return;
      }

      // Password Validation
      if (formData.newPassword) {
          if (formData.newPassword !== formData.confirmPassword) {
              setPasswordError("Passwords do not match.");
              return;
          }
          if (!validatePassword(formData.newPassword)) {
              return;
          }
      }

      // Construct Update Object
      const updatedUser = {
          username: formData.username,
          email: formData.email,
          ...(formData.newPassword ? { password: formData.newPassword } : {})
      };

      try {
          await NovelService.updateProfile(updatedUser);
          refreshUser();
          setIsEditing(false);
          setSaveMessage("Profile updated successfully!");
          setTimeout(() => setSaveMessage(null), 3000);
      } catch (err) {
          alert("Failed to update profile.");
      }
  };

  const handleAddCoins = async () => {
      if(window.confirm("Purchase 100 coins for $0.99? (Mock Stripe)")) {
          try {
              await NovelService.addCoins(100);
              refreshUser();
              alert("Payment successful! +100 Coins");
          } catch (e) {
              alert("Payment failed");
          }
      }
  };

  // Real-time requirements check
  const passwordRequirements = [
      { met: formData.newPassword.length >= 8, text: "At least 8 characters long" },
      { met: /[A-Z]/.test(formData.newPassword), text: "At least one capital letter (A-Z)" },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword), text: "At least one special character (!@#$%)" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Success Toast */}
      {saveMessage && (
          <FadeIn className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
              <Check size={20} className="mr-2" /> {saveMessage}
          </FadeIn>
      )}

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-10 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
        
        {!isEditing ? (
            // --- VIEW MODE ---
            <>
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-6 md:mb-0 w-full md:w-auto">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-indigo-700 rounded-full flex items-center justify-center text-4xl text-white font-bold mr-8 shadow-xl shadow-indigo-500/30 ring-4 ring-white dark:ring-slate-800">
                            {user.username[0].toUpperCase()}
                        </div>
                        {/* Rank Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white dark:border-slate-800 mr-8">
                            {user.cultivationRank || 'Mortal'}
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{user.username}</h2>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center text-sm mb-3">
                            {user.email}
                            <span className="mx-2">•</span>
                            <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-xs font-bold">{user.role}</span>
                        </p>
                        
                        {/* XP Progress Bar */}
                        <div className="mb-4 max-w-xs">
                            <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
                                <span>XP: {user.xp || 0}</span>
                                <span>Next Rank: 100</span> {/* Simplified logic for demo */}
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500" 
                                    style={{ width: `${Math.min(((user.xp || 0) % 100) / 100 * 100, 100)}%` }} // Simplified progress logic
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-bold">
                                <Coins size={18} className="mr-2" /> {user.coins} Coins
                            </div>
                            {(user.bonusCoins || 0) > 0 && (
                                <div className="inline-flex items-center px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-bold">
                                    <Trophy size={18} className="mr-2" /> {user.bonusCoins} Bonus
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <ScaleButton 
                        onClick={() => setIsEditing(true)}
                        className="bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Edit2 size={18} className="mr-2" /> Edit Profile
                    </ScaleButton>
                    {siteSettings.showTopUp && (
                        <ScaleButton 
                            onClick={handleAddCoins}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg"
                        >
                            <CreditCard size={18} className="mr-2" /> Top Up Wallet
                        </ScaleButton>
                    )}
                </div>
            </div>
            
            {/* Reading Activity Graph (Real Data) */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Reading Activity (Last 7 Days)</h4>
                <div className="flex items-end justify-between h-24 gap-2">
                    {(() => {
                        // Calculate Activity
                        const days = 7;
                        const activity = new Array(days).fill(0);
                        const labels = new Array(days).fill('');
                        const today = new Date();
                        
                        // Generate Labels (Last 7 days)
                        for (let i = 0; i < days; i++) {
                            const d = new Date();
                            d.setDate(today.getDate() - (days - 1 - i));
                            labels[i] = d.toLocaleDateString('en-US', { weekday: 'short' });
                        }

                        // Count History
                        if (user.readingHistory) {
                            user.readingHistory.forEach(item => {
                                const date = new Date(item.lastReadAt);
                                const diffTime = Math.abs(today.getTime() - date.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                                
                                // If within last 7 days (approx logic)
                                // Better: Check exact date match
                                for (let i = 0; i < days; i++) {
                                    const d = new Date();
                                    d.setDate(today.getDate() - (days - 1 - i));
                                    if (date.getDate() === d.getDate() && date.getMonth() === d.getMonth()) {
                                        activity[i]++;
                                    }
                                }
                            });
                        }

                        const max = Math.max(...activity, 1); // Avoid div by zero

                        return activity.map((count, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                    {count} Chapters
                                </div>
                                
                                <div 
                                    className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-sm relative overflow-hidden group-hover:bg-primary/20 transition-colors"
                                    style={{ height: `${Math.max((count / max) * 100, 10)}%` }} // Min 10% height for visibility
                                >
                                    <div className={`absolute bottom-0 left-0 w-full bg-primary opacity-50 h-full transform translate-y-full transition-transform duration-500 ${count > 0 ? 'group-hover:translate-y-0' : ''}`} />
                                    {count > 0 && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/50"></div>}
                                </div>
                                <span className={`text-[10px] font-mono ${i === days - 1 ? 'text-primary font-bold' : 'text-slate-400'}`}>
                                    {labels[i]}
                                </span>
                            </div>
                        ));
                    })()}
                </div>
            </div>
            </>
        ) : (
            // --- EDIT MODE ---
            <FadeIn>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                            <input 
                                type="text" 
                                required
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Column: Password Management */}
                    <div className="space-y-5 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Change Password</label>
                            <button 
                                type="button" 
                                onClick={generatePassword}
                                className="text-xs flex items-center text-primary hover:underline font-medium"
                            >
                                <RefreshCw size={12} className="mr-1" /> Generate Strong Password
                            </button>
                        </div>
                        
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password (leave blank to keep current)"
                                value={formData.newPassword}
                                onChange={e => {
                                    setFormData({...formData, newPassword: e.target.value});
                                    // Clear error when typing
                                    if (passwordError) setPasswordError(null);
                                }}
                                className={`w-full px-4 py-3 pr-10 rounded-xl border ${passwordError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 dark:border-slate-700 focus:ring-primary'} bg-white dark:bg-slate-800 outline-none transition-all`}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {formData.newPassword && (
                            <div className="relative">
                                <input 
                                    type="password" 
                                    placeholder="Confirm New Password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                        )}

                        {/* Validation Feedback with dynamic ticks */}
                        <div className="mt-3 space-y-2">
                            {passwordRequirements.map((req, index) => (
                                <div 
                                    key={index} 
                                    className={`flex items-center text-xs transition-colors duration-200 ${req.met ? 'text-green-500 font-medium' : 'text-slate-400'}`}
                                >
                                    {req.met ? (
                                        <Check size={14} className="mr-2 flex-shrink-0" />
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-2.5 ml-0.5 flex-shrink-0" />
                                    )}
                                    <span>{req.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* General Error Message */}
                        {passwordError && (
                            <div className="flex items-center text-xs text-red-500 font-medium animate-pulse mt-2">
                                <AlertCircle size={14} className="mr-1" /> {passwordError}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center"
                        >
                            <Save size={18} className="mr-2" /> Save Changes
                        </button>
                    </div>
                </form>
            </FadeIn>
        )}
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