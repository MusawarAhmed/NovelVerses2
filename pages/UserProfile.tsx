import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { NovelService } from '../services/novelService';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, CreditCard, Clock, ChevronRight, Bookmark, Edit2, Save, X, RefreshCw, Check, AlertCircle, Eye, EyeOff, Trophy, Camera, Upload, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { FadeIn, ScaleButton } from '../components/Anim';
import { Bookshelf } from '../components/Bookshelf';
import { GenreRadar } from '../components/GenreRadar';
import { Palette, Lock } from 'lucide-react';

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
  const [avatarTab, setAvatarTab] = useState<'upload' | 'select'>('upload');
  const [isSaving, setIsSaving] = useState(false);
  const [showRankGuide, setShowRankGuide] = useState(false);
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const PRESET_AVATARS = [
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Willow',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Emery',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Destiny',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Milo',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Simba',
  ];

  useEffect(() => {
      if (user) {
          setFormData({
              username: user.username,
              email: user.email,
              newPassword: '',
              confirmPassword: '',
              avatar: user.avatar || ''
          });
      }
  }, [user, isEditing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5000000) { // 5MB limit
              alert("File is too large (max 5MB)");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, avatar: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

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
          avatar: formData.avatar,
          ...(formData.newPassword ? { password: formData.newPassword } : {})
      };

      try {
          setIsSaving(true);
          await NovelService.updateProfile(updatedUser);
          refreshUser();
          setIsEditing(false);
          setSaveMessage("Profile updated successfully!");
          setTimeout(() => setSaveMessage(null), 3000);
      } catch (err) {
          alert("Failed to update profile.");
      } finally {
          setIsSaving(false);
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

  // Rank Logic (Dynamic)
  const getRankData = (rankLabel: string) => {
      const defaultConfig = [
        { label: 'Mortal', image: '/badges/mortal.png', ringColor: 'ring-stone-400' },
        { label: 'Body Tempering', image: '/badges/body_tempering.png', ringColor: 'ring-orange-700' },
        { label: 'Qi Condensation', image: '/badges/qi_condensation.png', ringColor: 'ring-blue-400' },
        { label: 'Foundation', image: '/badges/foundation.png', ringColor: 'ring-yellow-400' },
        { label: 'Golden Core', image: '/badges/golden_core.png', ringColor: 'ring-yellow-500 shadow-gold' }
      ];
      
      const config = (siteSettings.rankConfig && siteSettings.rankConfig.length > 0) 
        ? siteSettings.rankConfig 
        : defaultConfig;

      return config.find(r => r.label === rankLabel) || config[0]; // Fallback to Mortal
  };

  const currentRank = user.cultivationRank || 'Mortal';
  const rankData = getRankData(currentRank);

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
                        <div className={`w-24 h-24 bg-gradient-to-br from-primary to-indigo-700 rounded-full flex items-center justify-center overlow-hidden text-4xl text-white font-bold mr-8 shadow-xl shadow-indigo-500/30 ring-4 ${rankData.ringColor} dark:ring-offset-slate-900 ring-offset-2 transition-all duration-300`}>
                           {user.avatar ? (
                               <img src={user.avatar} alt={user.username} className="w-full h-full object-cover rounded-full" />
                           ) : (
                                user.username[0].toUpperCase()
                           )}
                        </div>
                        {/* Rank Badge Image */}
                        <div 
                            onClick={() => setShowRankGuide(true)}
                            className="absolute -bottom-2 -right-4 w-12 h-12 mr-8 filter drop-shadow-lg transform hover:scale-110 transition-transform cursor-pointer z-10" 
                            title="Click for Rank Guide"
                        >
                            <img src={rankData.image} alt={rankData.label} className="w-full h-full object-contain" />
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{user.username}</h2>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center text-sm mb-3">
                            {user.email}
                            <span className="mx-2">•</span>
                            <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-xs font-bold">{user.role}</span>
                        </p>
                        
                            <div className="mb-4 max-w-sm">
                                <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
                                    <span>XP: {user.xp || 0}</span>
                                    <div>
                                        <span className="mr-2 text-indigo-600 font-bold">{siteSettings?.xpConversionRate || 100} XP = 1 Coin</span>
                                        <span className="text-slate-400">Progress: {(user.xp || 0) % 1000} / 1000</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500" 
                                        style={{ width: `${Math.min(((user.xp || 0) % 1000) / 1000 * 100, 100)}%` }} 
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={async () => {
                                            if (confirm(`Convert available XP to Coins? This will deduct XP.\n\nRate: ${siteSettings?.xpConversionRate || 100} XP = 1 Coin`)) {
                                                try {
                                                    const res = await NovelService.convertXP();
                                                    alert(`Successfully converted! +${res.converted} Coins`);
                                                } catch (e: any) {
                                                    alert(e.response?.data?.msg || "Conversion failed");
                                                } finally {
                                                    refreshUser();
                                                }
                                            }
                                        }}
                                        disabled={(user.xp || 0) < (siteSettings?.xpConversionRate || 100)}
                                        className="text-xs flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        <RefreshCw size={12} className="mr-1.5" /> Convert XP to Coins
                                    </button>
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
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Profile Avatar</label>
                            
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex gap-4 mb-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setAvatarTab('upload')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${avatarTab === 'upload' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <Upload size={16} /> Upload Image
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setAvatarTab('select')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${avatarTab === 'select' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <ImageIcon size={16} /> Choose Avatar
                                    </button>
                                </div>

                                {avatarTab === 'upload' ? (
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {formData.avatar ? (
                                            <div className="relative w-20 h-20 mb-2">
                                                <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover rounded-full" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 text-white font-bold text-xs">Change</div>
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-2">
                                                <Camera size={24} />
                                            </div>
                                        )}
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {formData.avatar ? "Click to replace" : "Click to upload image"}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Max 5MB</p>
                                    </div>
                                ) : (
                                    // XP & Level
                                    <div className="grid grid-cols-4 gap-2">
                                        {PRESET_AVATARS.map((url, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, avatar: url }))}
                                                className={`aspect-square rounded-full border-2 overflow-hidden hover:opacity-80 transition-opacity ${formData.avatar === url ? 'border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800' : 'border-slate-200 dark:border-slate-700'}`}
                                            >
                                                <img src={url} alt={`Avatar ${i+1}`} className="w-full h-full" />
                                            </button>
                                        ))}
                                    </div>

                                )}
                            </div>
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
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className={`px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSaving ? (
                                <><Loader2 size={18} className="mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <><Save size={18} className="mr-2" /> Save Changes</>
                            )}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar: Stats & Radar */}
          <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <GenreRadar stats={(user.genreStats && Object.keys(user.genreStats).length > 0) ? user.genreStats : (() => {
                      // Backfill from history if empty
                      const calculated: Record<string, number> = {};
                      if (historyItems.length > 0) {
                          historyItems.forEach((item: any) => {
                              if (item.novel) {
                                  const genre = item.novel.tags?.[0] || item.novel.category || 'Other';
                                  calculated[genre] = (calculated[genre] || 0) + 50; // Assume 50XP per history entry
                              }
                          });
                      }
                      // If still empty and bookmarks exist, use them
                      if (Object.keys(calculated).length === 0 && bookmarks.length > 0) {
                           bookmarks.forEach((novel: any) => {
                               const genre = novel.tags?.[0] || novel.category || 'Other';
                               calculated[genre] = (calculated[genre] || 0) + 20; // Assume 20XP interest
                           });
                      }
                      return calculated;
                  })()} />
              </div>
          </div>

          {/* Main Content: Bookshelf */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                    <Bookmark size={24} className="mr-2 text-secondary"/> My Library
                </h3>
                <button 
                    onClick={() => setShowSkinSelector(true)}
                    className="flex items-center text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                    <Palette size={14} className="mr-1.5" /> Customize Shelf
                </button>
            </div>
            {/* Bookshelf Section */}
            {(() => {
                // Logic: If bookmarks exist, show them.
                // If NO bookmarks but History, show History (Unique Novels).
                // If NEITHER, show empty state.
                
                let displayNovels = bookmarks;
                let isHistoryView = false;

                if (bookmarks.length === 0 && historyItems.length > 0) {
                     const uniqueMap = new Map();
                     historyItems.forEach((h: any) => {
                         if (h.novel && !uniqueMap.has(h.novel.id)) {
                             uniqueMap.set(h.novel.id, h.novel);
                         }
                     });
                     displayNovels = Array.from(uniqueMap.values());
                     isHistoryView = true;
                }

                if (displayNovels.length === 0) {
                    return (
                        <div className="relative">
                            <Bookshelf novels={[]} skin={user?.shelfSkin} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
                                <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl text-center border border-white/10 shadow-2xl animate-fade-in pointer-events-auto">
                                    <BookOpen size={48} className="text-white/80 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold text-white mb-2 shadow-black drop-shadow-md">The library awaits your scriptures...</h4>
                                    <Link to="/browse/all" className="bg-primary hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-full transition-colors border border-indigo-400/30 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                                        Browse Library
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="relative">
                        {isHistoryView && (
                            <div className="absolute top-0 right-0 z-20 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
                                Displaying History
                            </div>
                        )}
                        <Bookshelf novels={displayNovels} skin={user?.shelfSkin} />
                    </div>
                );
            })()}
          </div>
      </div>
      {/* Skin Selector Modal */}
      {showSkinSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowSkinSelector(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">Customize Bookshelf</h3>
                    <button onClick={() => setShowSkinSelector(false)}><X size={20} className="text-slate-500" /></button>
                </div>
                <div className="p-4 space-y-3">
                    {[
                        { id: 'classic_wood', label: 'Classic Wood', desc: 'Timeless oak finish.' },
                        { id: 'magical_archive', label: 'Magical Archive', desc: 'Unlock with 500 Fantasy XP.' },
                        { id: 'data_vault', label: 'Data Vault', desc: 'Unlock with 500 Sci-Fi XP.' },
                        { id: 'haunted_mahogany', label: 'Haunted Mahogany', desc: 'Unlock with 500 Horror XP.' },
                        { id: 'sakura_dream', label: 'Sakura Dream', desc: 'Unlock with 500 Romance XP.' }
                    ].map(skin => {
                        // Admins unlock everything by default
                        const isUnlocked = user?.role === 'admin' || user?.unlockedSkins?.includes(skin.id) || skin.id === 'classic_wood';
                        const isSelected = user?.shelfSkin === skin.id;
                        
                        return (
                            <button
                                key={skin.id}
                                disabled={!isUnlocked}
                                onClick={async () => {
                                    if(!isUnlocked) return;
                                    try {
                                        // Optimistic update
                                        if (user) user.shelfSkin = skin.id; 
                                        setShowSkinSelector(false);
                                        await NovelService.updateShelfSkin(skin.id); // Need to implement this service method
                                        refreshUser();
                                    } catch(e) { console.error(e); }
                                }}
                                className={`w-full flex items-center p-3 rounded-xl border text-left transition-all ${
                                    isSelected 
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                } ${!isUnlocked ? 'opacity-60 grayscale' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center ${
                                    skin.id === 'classic_wood' ? 'bg-[#5D4037]' :
                                    skin.id === 'magical_archive' ? 'bg-indigo-900' :
                                    skin.id === 'data_vault' ? 'bg-slate-900' :
                                    skin.id === 'haunted_mahogany' ? 'bg-stone-900' : 'bg-pink-100'
                                }`}>
                                    {!isUnlocked && <Lock size={16} className="text-white/50" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm dark:text-white flex items-center justify-between">
                                        {skin.label}
                                        {isSelected && <Check size={16} className="text-primary" />}
                                    </h4>
                                    <p className="text-xs text-slate-500">{isUnlocked ? skin.desc : 'Locked - Read more to unlock!'}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
      {/* Rank Guide Modal */}
      {showRankGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowRankGuide(false)}>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                      <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                              <Trophy className="mr-2 text-yellow-500" size={24} /> Rank System
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">Earn XP to ascend through cultivation realms</p>
                      </div>
                      <button onClick={() => setShowRankGuide(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                          <X size={20} className="text-slate-500" />
                      </button>
                  </div>
                  
                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                      <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                          <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 text-sm flex items-center">
                              <Sparkles size={16} className="mr-2" /> How to Gain XP
                          </h4>
                          <ul className="text-xs space-y-2 text-indigo-800 dark:text-indigo-200">
                              <li className="flex items-center"><Check size={12} className="mr-2" /> Read Chapters (+10 XP)</li>
                              <li className="flex items-center"><Check size={12} className="mr-2" /> Daily Check-in (+50 XP)</li>
                              <li className="flex items-center"><Check size={12} className="mr-2" /> Post Comments (+5 XP)</li>
                          </ul>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Realm Hierarchy</h4>
                      <div className="space-y-3">
                          {((siteSettings.rankConfig && siteSettings.rankConfig.length > 0) ? siteSettings.rankConfig : [
                              { label: 'Mortal', image: '/badges/mortal.png', ringColor: 'ring-stone-400' },
                              { label: 'Body Tempering', image: '/badges/body_tempering.png', ringColor: 'ring-orange-700' },
                              { label: 'Qi Condensation', image: '/badges/qi_condensation.png', ringColor: 'ring-blue-400' },
                              { label: 'Foundation', image: '/badges/foundation.png', ringColor: 'ring-yellow-400' },
                              { label: 'Golden Core', image: '/badges/golden_core.png', ringColor: 'ring-yellow-500 shadow-gold' }
                          ]).map((rank, index) => (
                              <div key={index} className={`flex items-center p-3 rounded-xl border transition-all ${user.cultivationRank === rank.label ? 'bg-primary/5 border-primary dark:bg-primary/10 dark:border-primary ring-1 ring-primary' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-80'}`}>
                                  <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full border-2 mr-4 ${rank.ringColor?.replace('shadow-gold', '') || 'border-slate-200'}`}>
                                      <img src={rank.image} alt={rank.label} className="w-8 h-8 object-contain" />
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between items-center mb-1">
                                          <h5 className={`font-bold ${user.cultivationRank === rank.label ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{rank.label}</h5>
                                          {user.cultivationRank === rank.label && <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">CURRENT</span>}
                                      </div>
                                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                          <div className={`h-full ${index < 3 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} style={{ width: '100%' }}></div>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-1">Tier {index + 1}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};