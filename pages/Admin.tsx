import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { NovelService } from '../services/novelService';
import { GeminiService } from '../services/geminiService';
import { Novel, Transaction, User, Chapter, SiteSettings } from '../types';
import { 
  Plus, Sparkles, Book, FileText, DollarSign, BarChart2, Users, 
  Activity, Trash2, Shield, User as UserIcon, Edit, X, Save, 
  RefreshCw, Bold, Italic, Underline, List, Code, Type, Strikethrough, Eye, Layers, LayoutTemplate, CreditCard, EyeOff, Bell, Send, Star, Volume2, Tag, Key, Search, Palette, Loader2, Coins, Upload, Trophy,
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Custom Rich Text Editor Component ---
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Ref to track if the update is coming from the user typing (internal) or parent prop (external)
  const isInternalChange = useRef(false);

  useEffect(() => {
    // Only update innerHTML from props if the change didn't originate from this component
    // This prevents cursor jumping issues
    if (editorRef.current && !isInternalChange.current && mode === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value, mode]);

  const handleFormat = (command: string, val: string | undefined = undefined) => {
    if (mode !== 'visual') return;
    document.execCommand(command, false, val);
    if (editorRef.current) {
      handleInput(); // Trigger update immediately after format
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ icon: Icon, command, arg, active = false }: any) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); handleFormat(command, arg); }}
      className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ${active ? 'bg-slate-200 dark:bg-slate-600 text-primary' : 'text-slate-600 dark:text-slate-300'}`}
      title={command}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-700 flex flex-col h-[500px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center space-x-1 flex-wrap gap-y-1">
          {mode === 'visual' && (
            <>
              <ToolbarButton icon={Bold} command="bold" />
              <ToolbarButton icon={Italic} command="italic" />
              <ToolbarButton icon={Underline} command="underline" />
              <ToolbarButton icon={Strikethrough} command="strikeThrough" />
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-2"></div>
              <ToolbarButton icon={Type} command="formatBlock" arg="h3" />
              <ToolbarButton icon={Type} command="formatBlock" arg="p" />
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-2"></div>
              <ToolbarButton icon={List} command="insertUnorderedList" />
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === 'visual' ? 'code' : 'visual')}
          className="flex items-center text-xs font-medium px-2 py-1 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors ml-2"
        >
          {mode === 'visual' ? (
            <><Code size={14} className="mr-1" /> HTML Source</>
          ) : (
            <><Eye size={14} className="mr-1" /> Visual Editor</>
          )}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-grow relative overflow-hidden">
        {mode === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="absolute inset-0 w-full h-full p-4 overflow-y-auto focus:outline-none prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: value }} // Initial render
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => { onChange(e.target.value); }}
            className="w-full h-full p-4 bg-slate-900 text-green-400 font-mono text-sm focus:outline-none resize-none"
            spellCheck={false}
          />
        )}
      </div>
      <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-400 flex justify-between">
        <span>{mode === 'visual' ? 'Writing Mode' : 'HTML Mode'}</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
};

// --- Main Admin Component ---

export const Admin: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'analytics' | 'novels' | 'chapters' | 'users' | 'frontend' | 'layout'>('analytics');
  const [loading, setLoading] = useState(true);
  const [isSavingRanks, setIsSavingRanks] = useState(false);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [stats, setStats] = useState({ 
    totalNovels: 0, 
    totalChapters: 0, 
    totalUsers: 0, 
    totalRevenue: 0,
    topNovels: [] as { title: string, views: number }[],
    novelStats: [] as (Novel & { chapterCount: number })[]
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
      showHero: true, showWeeklyFeatured: true, showRankings: true, showRising: true, showTags: true, showPromo: true, enablePayments: true, showDemoCredentials: true, showChapterSummary: true, enableTTS: true, showBookSlider: true, showTopUp: true
  });
  
  const [tagStats, setTagStats] = useState<{name: string, count: number, views: number}[]>([]);

  // Form States
  const [isCreatingNovel, setIsCreatingNovel] = useState(false);
  const [editingNovelId, setEditingNovelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // User Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalMode, setUserModalMode] = useState<'view' | 'edit' | 'create' | null>(null); // null = closed
  const [showPassword, setShowPassword] = useState(false);

  // Inventory Table State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'views', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const initialNovelState = { 
      title: '', 
      author: '', 
      description: '', 
      tags: '', 
      genre: '', 
      coverUrl: '', 
      status: 'Ongoing', 
      category: 'Original',
      isWeeklyFeatured: false,
      offerPrice: 0,
      isFree: false
  };
  
  // Initialize Novel State from LocalStorage Draft if available
  const [newNovel, setNewNovel] = useState(() => {
    const draft = localStorage.getItem('nv_admin_novel_draft');
    return draft ? JSON.parse(draft) : initialNovelState;
  });
  
  const [generating, setGenerating] = useState(false);

  // Chapter States
  const [selectedNovelId, setSelectedNovelId] = useState(() => {
     const draft = localStorage.getItem('nv_admin_chapter_draft');
     return draft ? JSON.parse(draft).selectedNovelId || '' : '';
  });

  // Layout Manager State
  const [layoutSearchQuery, setLayoutSearchQuery] = useState('');
  const [layoutSearchResults, setLayoutSearchResults] = useState<Novel[]>([]);
  const [layoutSearching, setLayoutSearching] = useState(false);

  const [newChapter, setNewChapter] = useState(() => {
      const draft = localStorage.getItem('nv_admin_chapter_draft');
      return draft ? JSON.parse(draft).chapterData : { title: '', content: '', price: 0, isPaid: false, volume: 'Volume 1' };
  });

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  
  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Responsive Sidebar: Auto-collapse on mobile
  useEffect(() => {
      const handleResize = () => {
          if (window.innerWidth < 768) {
              setIsSidebarCollapsed(true);
          } else {
              setIsSidebarCollapsed(false);
          }
      };

      // Set initial
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    refreshData();
  }, [activeTab]); 

  // Auto-save Novel Draft
  useEffect(() => {
    // Only save draft if we are NOT editing an existing novel (creating new)
    if (!editingNovelId && isCreatingNovel) {
        localStorage.setItem('nv_admin_novel_draft', JSON.stringify(newNovel));
    }
  }, [newNovel, editingNovelId, isCreatingNovel]);

  // Auto-save Chapter Draft
  useEffect(() => {
    // Only save if not editing an existing chapter to avoid overwriting with dirty data
    if (!editingChapterId) {
        const draftData = {
            selectedNovelId,
            chapterData: newChapter
        };
        localStorage.setItem('nv_admin_chapter_draft', JSON.stringify(draftData));
    }
  }, [newChapter, selectedNovelId, editingChapterId]);

  // Check for deep link state from NovelDetail page
  useEffect(() => {
    const checkState = async () => {
        const state = location.state as { editNovelId?: string } | null;
        if (state?.editNovelId) {
            const novelToEdit = await NovelService.getNovelById(state.editNovelId);
            if (novelToEdit) {
                setActiveTab('novels');
                handleEditNovel(novelToEdit);
                window.history.replaceState({}, document.title);
            }
        }
    };
    checkState();
  }, [location]);

  // Load chapter list when selected novel changes
  useEffect(() => {
      const loadChapters = async () => {
          if (selectedNovelId) {
              const chs = await NovelService.getChapters(selectedNovelId);
              setChapterList(chs);
          } else {
              setChapterList([]);
          }
      };
      loadChapters();
  }, [selectedNovelId]);

  const refreshData = async () => {
    const data = await NovelService.getNovels();
    setNovels(data);
    
    // Load Stats & Users
    setStats(await NovelService.getStats());
    setTransactions(await NovelService.getTransactions());
    setUsers(await NovelService.getAllUsers());
    setSiteSettings(await NovelService.getSiteSettings());
    
    if (activeTab === 'layout') {
        try {
            setTagStats(await NovelService.getTagStats());
        } catch (e) { console.error("Failed to load tag stats", e); }
    }

    // Auto set selected novel if creating chapter and none selected (and no draft)
    if (data.length > 0 && !selectedNovelId && !localStorage.getItem('nv_admin_chapter_draft')) {
        setSelectedNovelId(data[0].id);
    }
    
    // Refresh chapter list if needed
    if (selectedNovelId) {
        const chs = await NovelService.getChapters(selectedNovelId);
        setChapterList(chs);
    }
  };

  const handleGenerateDescription = async () => {
    if (!newNovel.title || !newNovel.genre) {
        alert("Please fill in Title and Genre first.");
        return;
    }
    setGenerating(true);
    const desc = await GeminiService.generateSynopsis(newNovel.title, newNovel.genre, newNovel.tags.split(','));
    setNewNovel({ ...newNovel, description: desc });
    setGenerating(false);
  };

  const handleSaveNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        setSaving(true);
        if (editingNovelId) {
            // Update existing
            const existing = novels.find(n => n.id === editingNovelId);
            if (existing) {
                await NovelService.updateNovel(editingNovelId, {
                    ...existing,
                    title: newNovel.title,
                    author: newNovel.author,
                    description: newNovel.description,
                    tags: newNovel.tags.split(',').map(t => t.trim()),
                    coverUrl: newNovel.coverUrl || existing.coverUrl,
                    status: newNovel.status as 'Ongoing' | 'Completed',
                    category: newNovel.category as 'Original' | 'Fanfic' | 'Translation',
                    isWeeklyFeatured: newNovel.isWeeklyFeatured,
                    offerPrice: newNovel.offerPrice,
                    isFree: newNovel.isFree
                });
            }
        } else {
            // Create new
            await NovelService.createNovel({
                title: newNovel.title,
                author: newNovel.author,
                description: newNovel.description,
                tags: newNovel.tags.split(',').map(t => t.trim()),
                coverUrl: newNovel.coverUrl || `https://picsum.photos/seed/${newNovel.title.replace(/\s/g, '')}/300/450`, 
                status: newNovel.status as 'Ongoing' | 'Completed',
                category: newNovel.category as 'Original' | 'Fanfic' | 'Translation',
                isWeeklyFeatured: newNovel.isWeeklyFeatured,
                offerPrice: newNovel.offerPrice,
                isFree: newNovel.isFree
            });
            // Clear draft only on successful create
            localStorage.removeItem('nv_admin_novel_draft');
        }

        setIsCreatingNovel(false);
        setEditingNovelId(null);
        setNewNovel(initialNovelState);
        refreshData();
    } catch (e) {
        alert("Failed to save novel");
    } finally {
        setSaving(false);
    }
  };

  const handleDiscardNovel = () => {
      if(window.confirm("Discard changes and clear draft?")) {
        setIsCreatingNovel(false);
        setEditingNovelId(null);
        setNewNovel(initialNovelState);
        localStorage.removeItem('nv_admin_novel_draft');
      }
  };

  const handleEditNovel = (novel: Novel) => {
    setNewNovel({
        title: novel.title,
        author: novel.author,
        description: novel.description,
        tags: novel.tags.join(', '),
        genre: novel.tags[0] || '',
        coverUrl: novel.coverUrl,
        status: novel.status,
        category: novel.category,
        isWeeklyFeatured: !!novel.isWeeklyFeatured,
        offerPrice: novel.offerPrice || 0,
        isFree: !!novel.isFree
    });
    setEditingNovelId(novel.id);
    setIsCreatingNovel(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNovel = async (id: string) => {
    if (window.confirm("Are you sure? This will delete the novel AND all its chapters permanently.")) {
        await NovelService.deleteNovel(id);
        refreshData();
    }
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNovelId) return;
    
    try {
        setSaving(true);
        if (editingChapterId) {
            // Update Existing Chapter
            const existingChapter = chapterList.find(c => c.id === editingChapterId);
            if (existingChapter) {
                await NovelService.updateChapter(editingChapterId, {
                    ...existingChapter,
                    title: newChapter.title,
                    content: newChapter.content, // Save as raw HTML/Text
                    price: newChapter.isPaid ? newChapter.price : 0,
                    isPaid: newChapter.isPaid,
                    volume: newChapter.volume || 'Volume 1'
                });
                alert("Chapter updated successfully!");
            }
        } else {
            // Create New Chapter
            const existing = await NovelService.getChapters(selectedNovelId);
            const order = existing.length + 1;

            await NovelService.createChapter({
                novelId: selectedNovelId,
                title: newChapter.title,
                // Basic HTML wrapping for new chapters if entered as plain text
                content: newChapter.content.startsWith('<') ? newChapter.content : `<p>${newChapter.content.replace(/\n/g, '</p><p>')}</p>`,
                price: newChapter.isPaid ? newChapter.price : 0,
                isPaid: newChapter.isPaid,
                order: order,
                volume: newChapter.volume || 'Volume 1'
            });
            
            // Clear Draft only on new create
            localStorage.removeItem('nv_admin_chapter_draft');
            alert("Chapter uploaded successfully!");
        }
        
        // Reset Form
        setNewChapter({ title: '', content: '', price: 0, isPaid: false, volume: 'Volume 1' });
        setEditingChapterId(null);
        
        refreshData();
    } catch (e) {
        alert("Failed to save chapter");
    } finally {
        setSaving(false);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
      setNewChapter({
          title: chapter.title,
          content: chapter.content,
          price: chapter.price,
          isPaid: chapter.isPaid,
          volume: chapter.volume || 'Volume 1'
      });
      setEditingChapterId(chapter.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditChapter = () => {
      setNewChapter({ title: '', content: '', price: 0, isPaid: false, volume: 'Volume 1' });
      setEditingChapterId(null);
  };

  const handleDeleteChapter = async (id: string) => {
      if (window.confirm("Are you sure you want to delete this chapter?")) {
          await NovelService.deleteChapter(id);
          // Check if we were editing this chapter
          if (editingChapterId === id) {
              handleCancelEditChapter();
          }
          refreshData();
      }
  };

  // --- User Management Functions ---

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
          await NovelService.deleteUser(id);
          refreshData();
      } catch (e) {
          alert("Failed to delete user");
      }
    }
  };

  const handleUserRoleChange = async (user: User, newRole: 'admin' | 'user') => {
      try {
          await NovelService.updateUserRole(user.id, newRole);
          refreshData();
      } catch (e) {
          alert("Failed to update user role");
      }
  };

  const handleViewUser = (user: User) => {
      setSelectedUser(user);
      setUserModalMode('view');
      setShowPassword(false);
  };

  const handleEditUser = (user: User) => {
      setSelectedUser(user);
      setUserModalMode('edit');
      setShowPassword(false);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;

      try {
          setSaving(true);
          if (userModalMode === 'create') {
              // Create New User
              await NovelService.createUser({
                  username: selectedUser.username,
                  email: selectedUser.email,
                  password: selectedUser.password,
                  role: selectedUser.role,
                  coins: selectedUser.coins
              });
              alert("User created successfully!");
          } else {
              // Update Existing User
              await NovelService.updateProfile(selectedUser);
          }
          setUserModalMode(null);
          refreshData();
      } catch (e) {
          alert("Failed to save user. Ensure email is unique.");
      } finally {
          setSaving(false);
      }
  };

  const handleThemeChange = async (theme: string) => {
      const newSettings = { ...siteSettings, theme };
      setSiteSettings(newSettings);
      await NovelService.updateSiteSettings(newSettings);
      if (theme === 'unique') {
          document.documentElement.classList.add('theme-unique');
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('theme-unique');
      }
  };

  const handleUpdatePromo = async (field: keyof NonNullable<SiteSettings['featuredConfig']>['promoConfig'], value: string) => {
      const currentConfig = siteSettings.featuredConfig || {};
      const currentPromo = currentConfig.promoConfig || {};
      const newPromo = { ...currentPromo, [field]: value };
      
      const newConfig = { ...currentConfig, promoConfig: newPromo };
      const newSettings = { ...siteSettings, featuredConfig: newConfig };
      
      setSiteSettings(newSettings);
      await NovelService.updateSiteSettings(newSettings);
  };
  
  const handleUpdateTags = async (tags: string[]) => {
      const currentConfig = siteSettings.featuredConfig || {};
      const newConfig = { ...currentConfig, tagConfig: tags };
      const newSettings = { ...siteSettings, featuredConfig: newConfig };
      setSiteSettings(newSettings);
      await NovelService.updateSiteSettings(newSettings);
  };

  const handleUpdateCategorySection = async (key: string, value: any) => {
      const currentConfig = siteSettings.featuredConfig || {};
      const currentCatSection = currentConfig.homeCategorySection || {};
      const newCatSection = { ...currentCatSection, [key]: value };
      
      const newConfig = { ...currentConfig, homeCategorySection: newCatSection };
      const newSettings = { ...siteSettings, featuredConfig: newConfig };
      
      setSiteSettings(newSettings);
      await NovelService.updateSiteSettings(newSettings);
  };

  const toggleSetting = async (key: keyof SiteSettings) => {
      const newSettings = { ...siteSettings, [key]: !siteSettings[key] };
      setSiteSettings(newSettings);
      await NovelService.updateSiteSettings(newSettings);
  };

  const handleUpdateSetting = async (key: keyof SiteSettings, value: any) => {
      const newSettings = { ...siteSettings, [key]: value };
      setSiteSettings(newSettings);
      await NovelService.updateSiteSettings(newSettings);
  };

  // --- Inventory Logic ---
  const handleSort = (key: string) => {
      let direction: 'asc' | 'desc' = 'desc';
      if (sortConfig.key === key && sortConfig.direction === 'desc') {
          direction = 'asc';
      }
      setSortConfig({ key, direction });
  };

  // --- Layout Manager Logic ---
  const handleLayoutSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!layoutSearchQuery.trim()) return;
      
      setLayoutSearching(true);
      try {
          const results = await NovelService.getNovels({ search: layoutSearchQuery, limit: 10 });
          setLayoutSearchResults(results);
      } catch (error) {
          console.error("Search failed", error);
      } finally {
          setLayoutSearching(false);
      }
  };

  const handleUpdateFeaturedConfig = async (key: keyof NonNullable<SiteSettings['featuredConfig']>, value: string | string[]) => {
      const currentConfig = siteSettings.featuredConfig || { heroNovelId: null, weeklyNovelIds: [], risingNovelIds: [], sliderNovelIds: [] };
      const newConfig = { ...currentConfig, [key]: value };
      
      // Update local state
      const newSettings = { ...siteSettings, featuredConfig: newConfig };
      setSiteSettings(newSettings);
      
      // Persist
      await NovelService.updateSiteSettings(newSettings);
  };
  
  const handleUpdateThemeSettings = async (key: keyof NonNullable<SiteSettings['themeSettings']>, value: string) => {
      const currentConfig = siteSettings.themeSettings || {
          primaryColor: '#4f46e5',
          secondaryColor: '#ec4899',
          backgroundColor: '#f8fafc',
          textColor: '#0f172a',
          fontFamily: 'Inter',
          borderRadius: '0.5rem'
      };
      
      const newThemeSettings = { ...currentConfig, [key]: value };
      const newSettings = { ...siteSettings, themeSettings: newThemeSettings };
      
      setSiteSettings(newSettings);
      
      // Live Preview Application
      const root = document.documentElement;
      const setVar = (k: string, hex: string) => {
           const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
           if (match) {
               const rgb = `${parseInt(match[1], 16)} ${parseInt(match[2], 16)} ${parseInt(match[3], 16)}`;
               root.style.setProperty(k, rgb);
           }
      };

      if (key === 'primaryColor') setVar('--color-primary', value);
      if (key === 'secondaryColor') setVar('--color-secondary', value);
      if (key === 'backgroundColor') setVar('--color-paper', value);
      if (key === 'textColor') document.body.style.color = value;
      if (key === 'borderRadius') root.style.setProperty('--radius', value);
      if (key === 'fontFamily') root.style.setProperty('--font-sans', value);

      await NovelService.updateSiteSettings(newSettings);
  };

  const addToConfigList = (listKey: 'weeklyNovelIds' | 'risingNovelIds' | 'sliderNovelIds' | 'heroSliderIds', novelId: string) => {
      const currentList = siteSettings.featuredConfig?.[listKey] || [];
      if (!currentList.includes(novelId)) {
          handleUpdateFeaturedConfig(listKey, [...currentList, novelId]);
      }
  };

  const removeFromConfigList = (listKey: 'weeklyNovelIds' | 'risingNovelIds' | 'sliderNovelIds' | 'heroSliderIds', novelId: string) => {
      const currentList = siteSettings.featuredConfig?.[listKey] || [];
      handleUpdateFeaturedConfig(listKey, currentList.filter(id => id !== novelId));
  };

  const sortedNovels = React.useMemo(() => {
      let sortableItems = [...(stats.novelStats || [])];
      if (sortConfig.key) {
          sortableItems.sort((a: any, b: any) => {
              if (a[sortConfig.key] < b[sortConfig.key]) {
                  return sortConfig.direction === 'asc' ? -1 : 1;
              }
              if (a[sortConfig.key] > b[sortConfig.key]) {
                  return sortConfig.direction === 'asc' ? 1 : -1;
              }
              return 0;
          });
      }
      return sortableItems;
  }, [stats.novelStats, sortConfig]);

  const paginatedNovels = React.useMemo(() => {
      const indexOfLastRow = currentPage * rowsPerPage;
      const indexOfFirstRow = indexOfLastRow - rowsPerPage;
      return sortedNovels.slice(indexOfFirstRow, indexOfLastRow);
  }, [sortedNovels, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedNovels.length / rowsPerPage);

  // Moved SidebarItem outside to prevent re-renders
  const sidebarItems = [
      { id: 'analytics', label: 'Dashboard', icon: BarChart2 },
      { id: 'novels', label: 'Novels', icon: Book },
      { id: 'chapters', label: 'Chapters', icon: FileText },
      { id: 'users', label: 'Users & Roles', icon: Users },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'frontend', label: 'Site Settings', icon: LayoutTemplate },
      { id: 'layout', label: 'Layout Manager', icon: Layers },
      { id: 'theme', label: 'Theme Settings', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-full md:w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 md:min-h-screen transition-all duration-300 flex-shrink-0`}>
          <div className={`mb-8 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'} py-2`}>
              {!isSidebarCollapsed && (
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap animate-fade-in">Admin Console</h2>
              )}
              <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                  {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
              </button>
          </div>
          <nav className="space-y-1">
              {sidebarItems.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)} 
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium transition-all rounded-lg mb-1 ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                      <item.icon size={18} className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} transition-all`} />
                      {!isSidebarCollapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
                  </button>
              ))}
          </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h1>
            </div>

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Announcements</h3>
                            <p className="text-sm text-slate-500">Send notifications to all users.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Announcement Form */}
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                                const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
                                const link = (form.elements.namedItem('link') as HTMLInputElement).value;
                                
                                if (confirm('Send this announcement to ALL users?')) {
                                    try {
                                        await NovelService.createAnnouncement(title, message, link);
                                        alert('Announcement sent successfully!');
                                        form.reset();
                                    } catch (err) {
                                        alert('Failed to send announcement');
                                    }
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                    <input 
                                        name="title"
                                        id="notif-title"
                                        required
                                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="e.g., Maintenance Update"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                                    <textarea 
                                        name="message"
                                        id="notif-message"
                                        required
                                        rows={4}
                                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                                        placeholder="Enter your announcement message..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link (Optional)</label>
                                    <input 
                                        name="link"
                                        id="notif-link"
                                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none font-mono text-xs"
                                        placeholder="/novel/..."
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <Send size={18} />
                                    Send Announcement
                                </button>
                            </form>

                            {/* Quick Promote Section */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Sparkles size={16} className="text-yellow-500" />
                                    Quick Promote
                                </h4>
                                <p className="text-xs text-slate-500 mb-4">Click a novel to auto-fill the announcement form.</p>
                                
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {novels.slice(0, 10).map(novel => (
                                        <button
                                            key={novel.id}
                                            onClick={() => {
                                                const titleInput = document.getElementById('notif-title') as HTMLInputElement;
                                                const msgInput = document.getElementById('notif-message') as HTMLTextAreaElement;
                                                const linkInput = document.getElementById('notif-link') as HTMLInputElement;
                                                
                                                if (titleInput) titleInput.value = `New Arrival: ${novel.title}`;
                                                if (msgInput) msgInput.value = `Check out this amazing new novel by ${novel.author}! Read it now on NovelVerse.`;
                                                if (linkInput) linkInput.value = `/novel/${(novel as any).slug || novel.id}`;
                                            }}
                                            className="w-full text-left p-2 hover:bg-white dark:hover:bg-slate-600 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-500 transition-all flex items-center gap-3 group"
                                        >
                                            <img src={novel.coverUrl} alt={novel.title} className="w-8 h-12 object-cover rounded shadow-sm" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{novel.title}</div>
                                                <div className="text-xs text-slate-500 truncate">{novel.author}</div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus size={16} className="text-primary" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="animate-fade-in">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Revenue</h3>
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                    <DollarSign size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalRevenue}</div>
                            <p className="text-xs text-green-500 mt-1 font-medium">+12% from last month</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Users</h3>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                    <Users size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</div>
                            <p className="text-xs text-blue-500 mt-1 font-medium">+5 new today</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Novels</h3>
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                    <Book size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalNovels}</div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Across 5 genres</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Chapters</h3>
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                                    <FileText size={20} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalChapters}</div>
                            <p className="text-xs text-orange-500 mt-1 font-medium">Continually growing</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[400px]">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top 5 Most Viewed Novels</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topNovels}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="title" tick={{fill: '#94a3b8'}} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                                    <YAxis tick={{fill: '#94a3b8'}} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Views" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recent Activity or Secondary Chart Placeholder */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Platform Growth (Mock)</h3>
                             <div className="h-full flex items-center justify-center text-slate-400">
                                 <p>User Growth Chart Placeholder</p>
                             </div>
                        </div>
                    </div>

                    {/* Detailed Novel Performance Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-700/50 gap-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Detailed Novel Inventory</h3>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Rows:</span>
                                <select 
                                    value={rowsPerPage} 
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 text-sm focus:outline-none"
                                >
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={150}>150</option>
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        {[
                                            { label: 'Title', key: 'title' },
                                            { label: 'Category', key: 'category' },
                                            { label: 'Status', key: 'status' },
                                            { label: 'Chapters', key: 'chapterCount' },
                                            { label: 'Views', key: 'views' },
                                            { label: 'Rating', key: 'rating' }
                                        ].map((header) => (
                                            <th 
                                                key={header.key}
                                                onClick={() => handleSort(header.key)}
                                                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors select-none"
                                            >
                                                <div className="flex items-center gap-1">
                                                    {header.label}
                                                    {sortConfig.key === header.key && (
                                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {paginatedNovels.map((novel) => (
                                        <tr key={novel.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                                {novel.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                                <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                                                    {novel.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${novel.status === 'Ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {novel.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-bold">
                                                {(novel as any).chapterCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {(novel.views || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500 font-bold flex items-center gap-1">
                                                <Star size={14} fill="currentColor" /> {novel.rating}
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedNovels.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                                No novels found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Prev
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Transactions</h3>
                            <button className="text-sm text-primary hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No transactions recorded yet.</td>
                                        </tr>
                                    ) : (
                                        transactions.slice(0, 10).map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">{t.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{t.userId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{t.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">+{t.amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}



            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">User Management</h3>
                            <button 
                                onClick={() => {
                                    setSelectedUser({
                                        id: '',
                                        username: '',
                                        email: '',
                                        role: 'user',
                                        coins: 0,
                                        bookmarks: [],
                                        purchasedChapters: [],
                                        readingHistory: []
                                    });
                                    setUserModalMode('create');
                                    setShowPassword(true);
                                }}
                                className="bg-primary hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center text-sm transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <Plus size={16} className="mr-2" /> Add User
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role (Assign)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coins</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-slate-600 flex items-center justify-center text-primary dark:text-slate-200 font-bold">
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{u.username}</div>
                                                        <div className="text-xs text-slate-500">ID: {u.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select 
                                                    value={u.role}
                                                    onChange={(e) => handleUserRoleChange(u, e.target.value as 'admin' | 'user')}
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-primary cursor-pointer ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const rankData = siteSettings.rankConfig?.find(r => r.label === u.cultivationRank);
                                                    if (rankData?.image) {
                                                        return (
                                                            <div className="flex items-center gap-2 group relative">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 border-2 ${rankData.ringColor?.replace('shadow-gold', '') || 'border-slate-300'}`}>
                                                                    <img src={rankData.image} alt={u.cultivationRank} className="w-full h-full object-contain p-1" />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{u.cultivationRank}</span>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                            {u.cultivationRank || 'Mortal'}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {u.coins}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button 
                                                        onClick={() => handleViewUser(u)}
                                                        className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditUser(u)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details/Edit Modal */}
            {userModalMode && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 m-auto animate-fade-in flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {userModalMode === 'view' ? 'User Details' : userModalMode === 'create' ? 'Create New User' : 'Edit User'}
                            </h2>
                            <button 
                                onClick={() => setUserModalMode(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSaveUser} className="space-y-4">
                                {/* Avatar & Basic Info Header (View Only visually) */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg shadow-primary/20 mb-3">
                                        {selectedUser.username ? selectedUser.username[0].toUpperCase() : '?'}
                                    </div>
                                    {userModalMode === 'view' && (
                                        <>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.username}</h3>
                                            <p className="text-sm text-slate-500">{selectedUser.email}</p>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ID</label>
                                        <input disabled value={selectedUser.id} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm font-mono text-slate-500" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Username</label>
                                        <input 
                                            disabled={userModalMode === 'view'}
                                            value={selectedUser.username} 
                                            onChange={e => setSelectedUser({...selectedUser, username: e.target.value})}
                                            className={`w-full p-2 rounded border text-sm ${userModalMode === 'view' ? 'bg-transparent border-transparent' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none'}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
                                        <input 
                                            disabled={userModalMode === 'view'}
                                            value={selectedUser.email} 
                                            onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                                            className={`w-full p-2 rounded border text-sm ${userModalMode === 'view' ? 'bg-transparent border-transparent' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none'}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                disabled={userModalMode === 'view'}
                                                value={selectedUser.password || ''} 
                                                placeholder={userModalMode === 'create' ? 'Required' : (userModalMode === 'view' ? '********' : 'Leave blank to keep current')}
                                                onChange={e => setSelectedUser({...selectedUser, password: e.target.value})}
                                                className={`w-full p-2 pr-10 rounded border text-sm ${userModalMode === 'view' ? 'bg-transparent border-transparent' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Wallet Balance (Coins)</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                            <input 
                                                type="number"
                                                disabled={userModalMode === 'view'}
                                                value={selectedUser.coins} 
                                                onChange={e => setSelectedUser({...selectedUser, coins: parseInt(e.target.value) || 0})}
                                                className={`w-full pl-8 p-2 rounded border text-sm ${userModalMode === 'view' ? 'bg-transparent border-transparent font-bold text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none'}`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Role</label>
                                        <select 
                                            disabled={userModalMode === 'view'}
                                            value={selectedUser.role} 
                                            onChange={e => setSelectedUser({...selectedUser, role: e.target.value as 'admin' | 'user'})}
                                            className={`w-full p-2 rounded border text-sm ${userModalMode === 'view' ? 'bg-transparent border-transparent appearance-none' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none'}`}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    {/* Read Only Stats */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-100 dark:border-slate-700 text-center">
                                            <div className="text-lg font-bold text-primary">{selectedUser.bookmarks.length}</div>
                                            <div className="text-xs text-slate-500">Bookmarks</div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-100 dark:border-slate-700 text-center">
                                            <div className="text-lg font-bold text-primary">{selectedUser.readingHistory?.length || 0}</div>
                                            <div className="text-xs text-slate-500">Novels Read</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
                                    <button 
                                        type="button"
                                        onClick={() => setUserModalMode(null)}
                                        className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        {userModalMode === 'view' ? 'Close' : 'Cancel'}
                                    </button>
                                    {(userModalMode === 'edit' || userModalMode === 'create') && (
                                        <button 
                                            type="submit"
                                            disabled={saving}
                                            className={`px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {saving ? (
                                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                            ) : (
                                                userModalMode === 'create' ? 'Create User' : 'Save Changes'
                                            )}
                                        </button>
                                    )}
                                    {userModalMode === 'view' && (
                                        <button 
                                            type="button"
                                            onClick={() => setUserModalMode('edit')}
                                            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Edit User
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Novels Tab */}
            {activeTab === 'novels' && (
                <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novels Library</h2>
                    <button 
                        onClick={() => { setIsCreatingNovel(true); setEditingNovelId(null); setNewNovel(initialNovelState); }}
                        className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-indigo-500/20"
                    >
                    <Plus size={18} className="mr-2" /> Add New Novel
                    </button>
                </div>
                
                {isCreatingNovel && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8 border border-slate-200 dark:border-slate-700 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingNovelId ? 'Edit Novel' : 'Create New Novel'}</h3>
                                {!editingNovelId && <span className="ml-3 text-xs text-slate-400 flex items-center"><RefreshCw size={12} className="mr-1" /> Auto-save enabled</span>}
                            </div>
                            <button onClick={handleDiscardNovel} className="text-slate-500 hover:text-slate-700 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveNovel} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Title</label>
                                    <input required value={newNovel.title} onChange={e => setNewNovel({...newNovel, title: e.target.value})} className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Genre</label>
                                    <input required value={newNovel.genre} onChange={e => setNewNovel({...newNovel, genre: e.target.value})} className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Fantasy" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Author</label>
                                    <input required value={newNovel.author} onChange={e => setNewNovel({...newNovel, author: e.target.value})} className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                                        <select value={newNovel.status} onChange={e => setNewNovel({...newNovel, status: e.target.value})} className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none">
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category</label>
                                        <select value={newNovel.category} onChange={e => setNewNovel({...newNovel, category: e.target.value})} className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none">
                                            <option value="Original">Original</option>
                                            <option value="Fanfic">Fanfic</option>
                                            <option value="Translation">Translation</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Cover Image URL</label>
                                <input value={newNovel.coverUrl} onChange={e => setNewNovel({...newNovel, coverUrl: e.target.value})} placeholder="https://example.com/image.jpg" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                                {newNovel.coverUrl && <img src={newNovel.coverUrl} alt="Preview" className="mt-2 h-24 w-16 object-cover rounded border border-slate-300 dark:border-slate-600" />}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
                                <input value={newNovel.tags} onChange={e => setNewNovel({...newNovel, tags: e.target.value})} className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            
                            {/* New Fields: Offer Price and Free Toggle */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Offer Price (Coins)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={newNovel.offerPrice || 0} 
                                            onChange={e => {
                                                const inputValue = e.target.value;
                                                const val = inputValue === '' ? 0 : parseInt(inputValue);
                                                setNewNovel(prev => ({
                                                    ...prev, 
                                                    offerPrice: val, 
                                                    isFree: val > 0 ? false : prev.isFree // If price > 0, force not free.
                                                }));
                                            }} 
                                            className="w-full pl-10 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                                    <input 
                                        type="checkbox" 
                                        id="isFree"
                                        checked={newNovel.isFree || false} 
                                        onChange={e => setNewNovel({...newNovel, isFree: e.target.checked, offerPrice: e.target.checked ? 0 : newNovel.offerPrice})}
                                        className="w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label htmlFor="isFree" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                        Make all chapters free
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center mb-2">
                                <input 
                                    type="checkbox" 
                                    id="weeklyFeatured"
                                    checked={newNovel.isWeeklyFeatured} 
                                    onChange={e => setNewNovel({...newNovel, isWeeklyFeatured: e.target.checked})}
                                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="weeklyFeatured" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">Featured in Weekly Hero Section</label>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                                    <button type="button" onClick={handleGenerateDescription} disabled={generating} className="text-xs flex items-center text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 transition-colors">
                                        <Sparkles size={12} className="mr-1" /> {generating ? 'Generating...' : 'Auto-Generate with Gemini'}
                                    </button>
                                </div>
                                <textarea required rows={4} value={newNovel.description} onChange={e => setNewNovel({...newNovel, description: e.target.value})} className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={handleDiscardNovel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Discard</button>
                                <button type="submit" disabled={saving} className={`px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    {saving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />} 
                                    {saving ? 'Saving...' : (editingNovelId ? 'Update Novel' : 'Create Novel')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cover</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price/Free</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {novels.map(n => (
                                <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img src={n.coverUrl} alt="" className="h-12 w-8 object-cover rounded" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{n.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{n.author}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {n.isFree ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Free</span>
                                        ) : (
                                            <span className="inline-flex items-center">
                                                {(n.offerPrice !== undefined && n.offerPrice !== null && n.offerPrice > 0) ? (
                                                    <span className="flex items-center text-yellow-600 dark:text-yellow-400 font-bold"><DollarSign size={12}/> {n.offerPrice}</span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleEditNovel(n)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteNovel(n.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </div>
            )}

            {/* Chapters Tab */}
            {activeTab === 'chapters' && (
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <FileText className="mr-2 text-primary" /> {editingChapterId ? 'Edit Chapter' : 'Upload New Chapter'}
                            </h3>
                            <div className="flex items-center gap-3">
                                {!editingChapterId && <span className="text-xs text-slate-400 flex items-center"><RefreshCw size={12} className="mr-1" /> Auto-save enabled</span>}
                                {editingChapterId && (
                                    <button onClick={handleCancelEditChapter} className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </div>
                        <form onSubmit={handleSaveChapter} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Select Novel</label>
                                <div className="relative">
                                    <select required disabled={!!editingChapterId} value={selectedNovelId} onChange={e => setSelectedNovelId(e.target.value)} className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none disabled:opacity-50">
                                        <option value="">-- Select a Novel --</option>
                                        {novels.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Chapter Title</label>
                                    <input required value={newChapter.title} onChange={e => setNewChapter({...newChapter, title: e.target.value})} className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Chapter 5: The Return" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Volume Name</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            required 
                                            value={newChapter.volume} 
                                            onChange={e => setNewChapter({...newChapter, volume: e.target.value})} 
                                            className="w-full pl-10 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
                                            placeholder="e.g. Volume 1: The Awakening" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <label className="flex items-center cursor-pointer select-none">
                                    <div className="relative">
                                        <input type="checkbox" checked={newChapter.isPaid} onChange={e => setNewChapter({...newChapter, isPaid: e.target.checked})} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </div>
                                    <span className="ml-3 text-sm text-slate-700 dark:text-slate-300 font-medium">Premium Chapter</span>
                                </label>
                                
                                {newChapter.isPaid && (
                                    <div className="flex items-center animate-fade-in ml-auto">
                                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-l-md border border-r-0 border-yellow-200 dark:border-yellow-700">
                                            <DollarSign size={16} className="text-yellow-700 dark:text-yellow-500" />
                                        </div>
                                        <input type="number" min="1" value={newChapter.price} onChange={e => setNewChapter({...newChapter, price: parseInt(e.target.value)})} className="w-24 p-1.5 rounded-r-md border border-yellow-200 dark:border-yellow-700 dark:bg-slate-700 dark:text-white text-sm focus:outline-none" />
                                        <span className="ml-2 text-sm text-slate-500">Coins</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Content</label>
                                <RichTextEditor 
                                value={newChapter.content} 
                                onChange={(html) => setNewChapter({...newChapter, content: html})} 
                                />
                            </div>
                            <button type="submit" disabled={saving} className={`w-full py-3.5 bg-primary text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {saving ? (
                                    <><Loader2 size={20} className="animate-spin" /> Saving Chapter...</>
                                ) : (
                                    editingChapterId ? 'Update Chapter' : 'Publish Chapter'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Existing Chapters List */}
                    {selectedNovelId && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Existing Chapters</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volume</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                        {chapterList.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No chapters found for this novel.</td>
                                            </tr>
                                        ) : (
                                            chapterList.map((chapter) => (
                                                <tr key={chapter.id} className={editingChapterId === chapter.id ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">#{chapter.order}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 max-w-[100px] truncate" title={chapter.volume}>{chapter.volume || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{chapter.title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                        {chapter.isPaid ? `${chapter.price} Coins` : 'Free'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button 
                                                            onClick={() => handleEditChapter(chapter)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-colors"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteChapter(chapter.id)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}



            {/* Site Settings Tab */}
            {activeTab === 'frontend' && (
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Site Configuration</h3>
                            <p className="text-slate-500 dark:text-slate-400">Manage global settings, feature toggles, and system preferences.</p>
                        </div>
                        
                        <div className="p-8">
                            {/* Theme Selection */}
                            <div className="mb-8 bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-700/30 dark:to-slate-700/50 p-6 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col md:flex-row items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center">
                                        <Sparkles className="mr-2 text-indigo-500" size={20} /> Global Theme
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Choose the visual style for the entire platform.</p>
                                </div>
                                <div className="flex gap-3 mt-4 md:mt-0">
                                    <button
                                        onClick={() => handleThemeChange('default')}
                                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${!siteSettings.theme || siteSettings.theme === 'default' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-md ring-1 ring-indigo-500/20' : 'bg-transparent text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700'}`}
                                    >
                                        Default
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('unique')}
                                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${siteSettings.theme === 'unique' ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700'}`}
                                    >
                                        Holo Theme
                                    </button>
                                </div>
                            </div>



                            {/* System Toggles */}
                            <div>
                                <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
                                    <Activity size={16} className="mr-2" /> System & Logic
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <div className="flex items-start">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4 text-blue-600 dark:text-blue-400">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Payment System</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">Master switch for all monetization features. Turning this off disables premium chapters and coin purchases.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={siteSettings.enablePayments}
                                                onChange={() => toggleSetting('enablePayments')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-start">
                                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-4 text-yellow-600 dark:text-yellow-400">
                                                <Coins size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">XP Conversion Rate</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">XP required for 1 Coin.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={siteSettings.xpConversionRate || 100} 
                                                onChange={e => setSiteSettings({...siteSettings, xpConversionRate: parseInt(e.target.value) || 100})} 
                                                onBlur={() => handleUpdateSetting('xpConversionRate', siteSettings.xpConversionRate || 100)}
                                                className="w-20 p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-right font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-start">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4 text-purple-600 dark:text-purple-400">
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Top Up Wallet Button</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle visibility of the "Top Up Wallet" button on User Profiles.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={siteSettings.showTopUp}
                                                onChange={() => toggleSetting('showTopUp')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-start">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4 text-green-600 dark:text-green-400">
                                                <Key size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Demo Credentials</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Show login hints (Email: admin@example.com) on the login page.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={siteSettings.showDemoCredentials}
                                                onChange={() => toggleSetting('showDemoCredentials')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-start">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4 text-orange-600 dark:text-orange-400">
                                                <Volume2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Text-to-Speech</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Enable the audio player functionality in the chapter reader.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={siteSettings.enableTTS}
                                                onChange={() => toggleSetting('enableTTS')}
                                                className="sr-only peer"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Rank Badge Configuration */}
                            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-wider">
                                        <Trophy size={16} className="mr-2" /> Rank Badges & Frames
                                    </h4>
                                    <button
                                        onClick={async () => {
                                            setIsSavingRanks(true);
                                            try {
                                                const configToSave = siteSettings.rankConfig && siteSettings.rankConfig.length > 0 
                                                    ? siteSettings.rankConfig 
                                                    : [
                                                        { label: 'Mortal', image: '/badges/mortal.png', ringColor: 'ring-stone-400' },
                                                        { label: 'Body Tempering', image: '/badges/body_tempering.png', ringColor: 'ring-orange-700' },
                                                        { label: 'Qi Condensation', image: '/badges/qi_condensation.png', ringColor: 'ring-blue-400' },
                                                        { label: 'Foundation', image: '/badges/foundation.png', ringColor: 'ring-yellow-400' },
                                                        { label: 'Golden Core', image: '/badges/golden_core.png', ringColor: 'ring-yellow-500 shadow-gold' }
                                                      ];
                                                
                                                await handleUpdateSetting('rankConfig', configToSave);
                                                // Refresh local state to ensure it shows immediately
                                                setSiteSettings(prev => ({ ...prev, rankConfig: configToSave }));
                                                
                                                // Show success toast manually since alert() is unreliable
                                                const toast = document.createElement('div');
                                                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce transition-all duration-300 flex items-center gap-2';
                                                toast.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Ranks Saved Successfully!';
                                                document.body.appendChild(toast);
                                                setTimeout(() => {
                                                    toast.classList.add('opacity-0', 'translate-y-4');
                                                    setTimeout(() => toast.remove(), 300);
                                                }, 3000);

                                            } catch (error) {
                                                console.error("Save failed:", error);
                                                const toast = document.createElement('div');
                                                toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-pulse flex items-center gap-2';
                                                toast.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Failed to save ranks';
                                                document.body.appendChild(toast);
                                                setTimeout(() => toast.remove(), 3000);
                                            } finally {
                                                setIsSavingRanks(false);
                                            }
                                        }}
                                        disabled={isSavingRanks}
                                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                                    >
                                        {isSavingRanks ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                        Save Badges
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {((siteSettings.rankConfig && siteSettings.rankConfig.length > 0) ? siteSettings.rankConfig : [
                                        { label: 'Mortal', image: '/badges/mortal.png', ringColor: 'ring-stone-400' },
                                        { label: 'Body Tempering', image: '/badges/body_tempering.png', ringColor: 'ring-orange-700' },
                                        { label: 'Qi Condensation', image: '/badges/qi_condensation.png', ringColor: 'ring-blue-400' },
                                        { label: 'Foundation', image: '/badges/foundation.png', ringColor: 'ring-yellow-400' },
                                        { label: 'Golden Core', image: '/badges/golden_core.png', ringColor: 'ring-yellow-500 shadow-gold' }
                                    ]).map((rank, index) => (
                                        <div key={index} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{rank.label}</span>
                                            
                                            {/* Badge Preview */}
                                            <div className="w-20 h-20 mb-3 relative flex items-center justify-center">
                                                <img src={rank.image} alt={rank.label} className="w-full h-full object-contain filter drop-shadow-md" />
                                            </div>

                                            {/* Ring Color Preview/Edit */}
                                            <div className="w-full mb-3">
                                                 <input 
                                                    type="text" 
                                                    value={rank.ringColor}
                                                    onChange={(e) => {
                                                        const currentConfig = (siteSettings.rankConfig && siteSettings.rankConfig.length > 0) 
                                                            ? [...siteSettings.rankConfig] 
                                                            : [
                                                                { label: 'Mortal', image: '/badges/mortal.png', ringColor: 'ring-stone-400' },
                                                                { label: 'Body Tempering', image: '/badges/body_tempering.png', ringColor: 'ring-orange-700' },
                                                                { label: 'Qi Condensation', image: '/badges/qi_condensation.png', ringColor: 'ring-blue-400' },
                                                                { label: 'Foundation', image: '/badges/foundation.png', ringColor: 'ring-yellow-400' },
                                                                { label: 'Golden Core', image: '/badges/golden_core.png', ringColor: 'ring-yellow-500 shadow-gold' }
                                                            ];
                                                        
                                                        // Immutable update
                                                        currentConfig[index] = { ...currentConfig[index], ringColor: e.target.value };
                                                        setSiteSettings(prev => ({ ...prev, rankConfig: currentConfig }));
                                                    }}
                                                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center"
                                                    placeholder="Ring Class (e.g. ring-red-500)"
                                                 />
                                            </div>

                                            {/* Upload Button */}
                                            <label className="cursor-pointer flex items-center justify-center w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                                <Upload size={12} className="mr-1.5" /> Change Icon
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                const currentConfig = (siteSettings.rankConfig && siteSettings.rankConfig.length > 0) 
                                                                    ? [...siteSettings.rankConfig] 
                                                                    : [
                                                                        { label: 'Mortal', image: '/badges/mortal.png', ringColor: 'ring-stone-400' },
                                                                        { label: 'Body Tempering', image: '/badges/body_tempering.png', ringColor: 'ring-orange-700' },
                                                                        { label: 'Qi Condensation', image: '/badges/qi_condensation.png', ringColor: 'ring-blue-400' },
                                                                        { label: 'Foundation', image: '/badges/foundation.png', ringColor: 'ring-yellow-400' },
                                                                        { label: 'Golden Core', image: '/badges/golden_core.png', ringColor: 'ring-yellow-500 shadow-gold' }
                                                                    ];

                                                                // Immutable update
                                                                currentConfig[index] = { ...currentConfig[index], image: reader.result as string };
                                                                setSiteSettings(prev => ({ ...prev, rankConfig: currentConfig }));
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Theme Settings Tab */}
            {activeTab === 'theme' && (
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Theme Settings</h3>
                                <p className="text-slate-500">Customize the global appearance of your NovelVerse site.</p>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-slate-700 rounded-lg">
                                <Palette size={32} className="text-primary" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Primary Color</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative overflow-hidden w-10 h-10 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
                                            <input 
                                                type="color" 
                                                value={siteSettings.themeSettings?.primaryColor || '#4f46e5'}
                                                onChange={(e) => handleUpdateThemeSettings('primaryColor', e.target.value)}
                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={siteSettings.themeSettings?.primaryColor || '#4f46e5'}
                                            onChange={(e) => handleUpdateThemeSettings('primaryColor', e.target.value)}
                                            className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white uppercase font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Secondary Color</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative overflow-hidden w-10 h-10 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
                                            <input 
                                                type="color" 
                                                value={siteSettings.themeSettings?.secondaryColor || '#ec4899'}
                                                onChange={(e) => handleUpdateThemeSettings('secondaryColor', e.target.value)}
                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={siteSettings.themeSettings?.secondaryColor || '#ec4899'}
                                            onChange={(e) => handleUpdateThemeSettings('secondaryColor', e.target.value)}
                                            className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white uppercase font-mono"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Text Color</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative overflow-hidden w-10 h-10 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
                                            <input 
                                                type="color" 
                                                value={siteSettings.themeSettings?.textColor || '#0f172a'}
                                                onChange={(e) => handleUpdateThemeSettings('textColor', e.target.value)}
                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={siteSettings.themeSettings?.textColor || '#0f172a'}
                                            onChange={(e) => handleUpdateThemeSettings('textColor', e.target.value)}
                                            className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white uppercase font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Background Color</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative overflow-hidden w-10 h-10 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
                                            <input 
                                                type="color" 
                                                value={siteSettings.themeSettings?.backgroundColor || '#f8fafc'}
                                                onChange={(e) => handleUpdateThemeSettings('backgroundColor', e.target.value)}
                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={siteSettings.themeSettings?.backgroundColor || '#f8fafc'}
                                            onChange={(e) => handleUpdateThemeSettings('backgroundColor', e.target.value)}
                                            className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white uppercase font-mono"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Base background for light mode.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Font Family</label>
                                    <select 
                                        value={siteSettings.themeSettings?.fontFamily || 'Inter'}
                                        onChange={(e) => handleUpdateThemeSettings('fontFamily', e.target.value)}
                                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="Inter">Inter (Default)</option>
                                        <option value="Roboto">Roboto</option>
                                        <option value="Open Sans">Open Sans</option>
                                        <option value="Merriweather">Merriweather (Serif)</option>
                                        <option value="Outfit">Outfit</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Corner Radius</label>
                                    <select 
                                        value={siteSettings.themeSettings?.borderRadius || '0.5rem'}
                                        onChange={(e) => handleUpdateThemeSettings('borderRadius', e.target.value)}
                                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="0">Square (0px)</option>
                                        <option value="0.25rem">Small (4px)</option>
                                        <option value="0.5rem">Medium (8px)</option>
                                        <option value="1rem">Large (16px)</option>
                                        <option value="1.5rem">Extra Large (24px)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                         <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Live Preview</h4>
                                    <p className="text-xs text-slate-500">Changes apply immediately to the site.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                   handleUpdateThemeSettings('primaryColor', '#4f46e5');
                                   handleUpdateThemeSettings('secondaryColor', '#ec4899');
                                   handleUpdateThemeSettings('backgroundColor', '#f8fafc');
                                   handleUpdateThemeSettings('textColor', '#0f172a');
                                   handleUpdateThemeSettings('fontFamily', 'Inter');
                                   handleUpdateThemeSettings('borderRadius', '0.5rem');
                                }}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Reset to Default
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Manager Tab */}
            {activeTab === 'layout' && (
                <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
                     {/* Search Tool */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Find Novels</h3>
                        <form onSubmit={handleLayoutSearch} className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <input 
                                    value={layoutSearchQuery}
                                    onChange={(e) => setLayoutSearchQuery(e.target.value)}
                                    placeholder="Search by title..."
                                    className="w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                />
                                {layoutSearchQuery && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setLayoutSearchQuery('');
                                            setLayoutSearchResults([]); 
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                disabled={layoutSearching}
                                className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {layoutSearching ? 'Searching...' : <Search size={20} />}
                            </button>
                        </form>
                        
                        {layoutSearchResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                                {layoutSearchResults.map(novel => (
                                    <div key={novel.id} className="flex items-center p-2 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <img src={novel.coverUrl} alt="" className="w-8 h-12 object-cover rounded mr-3" />
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="text-sm font-bold truncate dark:text-white">{novel.title}</div>
                                            <div className="text-xs text-slate-500">{novel.id}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleUpdateFeaturedConfig('heroNovelId', novel.id)}
                                                className="p-1.5 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded hover:bg-indigo-200 relative"
                                                title="Set as Hero"
                                            >
                                                Hero
                                                {siteSettings.featuredConfig?.heroNovelId === novel.id && (
                                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => addToConfigList('weeklyNovelIds', novel.id)}
                                                className="p-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200 relative"
                                                title="Add to Weekly"
                                            >
                                                +W
                                                {(siteSettings.featuredConfig?.weeklyNovelIds || []).includes(novel.id) && (
                                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => addToConfigList('heroSliderIds', novel.id)}
                                                className="p-1.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded hover:bg-purple-200 relative"
                                                title="Add to Hero Slider"
                                            >
                                                +S
                                                {(siteSettings.featuredConfig?.heroSliderIds || []).includes(novel.id) && (
                                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => addToConfigList('risingNovelIds', novel.id)}
                                                className="p-1.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded hover:bg-orange-200 relative"
                                                title="Add to Rising"
                                            >
                                                +R
                                                {(siteSettings.featuredConfig?.risingNovelIds || []).includes(novel.id) && (
                                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const current = siteSettings.featuredConfig?.rankingConfig || {};
                                                    const list = current.powerNovelIds || [];
                                                    if(!list.includes(novel.id)) {
                                                        const newConfig = { ...current, powerNovelIds: [...list, novel.id] };
                                                        handleUpdateFeaturedConfig('rankingConfig', newConfig as any);
                                                    }
                                                }}
                                                className="p-1.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded hover:bg-yellow-200 relative"
                                                title="Add to Power Ranking"
                                            >
                                                +P
                                                {(siteSettings.featuredConfig?.rankingConfig?.powerNovelIds || []).includes(novel.id) && (
                                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Hero Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hero Banner</h3>
                                    <p className="text-xs text-slate-500">The main featured book at the top.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-xs font-bold mr-2 text-slate-500">Enable Section</span>
                                     <button
                                         onClick={() => toggleSetting('showHero')}
                                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteSettings.showHero ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                     >
                                         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.showHero ? 'translate-x-6' : 'translate-x-1'}`} />
                                     </button>

                                     <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                                     <select
                                        value={siteSettings.featuredConfig?.heroMode || 'static'}
                                        onChange={(e) => handleUpdateFeaturedConfig('heroMode', e.target.value)}
                                        className="text-xs p-1 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 dark:text-white"
                                     >
                                        <option value="static">Static Image</option>
                                        <option value="slider">Carousel Slider</option>
                                     </select>
                                    
                                    {siteSettings.featuredConfig?.heroMode === 'static' && siteSettings.featuredConfig?.heroNovelId && (
                                        <button 
                                            onClick={() => handleUpdateFeaturedConfig('heroNovelId', null as any)}
                                            className="text-xs text-red-500 hover:text-red-700 flex items-center"
                                        >
                                            <Trash2 size={12} className="mr-1" /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                                <input 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                    value={siteSettings.featuredConfig?.heroTitle || ''}
                                    placeholder="Featured Novel"
                                    onChange={e => handleUpdateFeaturedConfig('heroTitle', e.target.value)}
                                />
                            </div>
                            
                            {siteSettings.featuredConfig?.heroMode === 'slider' ? (
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Selected Slides ({siteSettings.featuredConfig.heroSliderIds?.length || 0})</div>
                                    {(siteSettings.featuredConfig.heroSliderIds || []).map(id => (
                                        <div key={id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-700">
                                            <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{id}</span>
                                            <span className="text-xs font-bold truncate max-w-[150px] mx-2 dark:text-white">
                                                 {novels.find(n => n.id === id)?.title || layoutSearchResults.find(n => n.id === id)?.title || "..."}
                                            </span>
                                            <button onClick={() => removeFromConfigList('heroSliderIds', id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {(siteSettings.featuredConfig.heroSliderIds || []).length === 0 && (
                                        <div className="text-center py-6 text-slate-400 italic text-sm">
                                            No slides selected. Add from search results.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                siteSettings.featuredConfig?.heroNovelId ? (
                                    <div className="bg-slate-900 rounded-lg p-4 text-white relative overflow-hidden group">
                                         <div className="flex items-center relative z-10">
                                            <div className="text-4xl font-bold mr-4">★</div>
                                            <div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Hero</div>
                                                <div className="font-mono text-sm">{siteSettings.featuredConfig.heroNovelId}</div>
                                                <div className="text-sm font-bold text-indigo-400">
                                                    {novels.find(n => n.id === siteSettings.featuredConfig?.heroNovelId)?.title || layoutSearchResults.find(n => n.id === siteSettings.featuredConfig?.heroNovelId)?.title || "Unknown/Unloaded Title"}
                                                </div>
                                            </div>
                                         </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center">
                                        <div className="text-slate-400 mb-2">Auto-Selected</div>
                                        <div className="text-xs text-slate-500">System picks the #1 Weekly Featured novel</div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Weekly Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Featured</h3>
                                    <p className="text-xs text-slate-500">Top row grid (5 slots recommended).</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded mr-2">
                                        {(siteSettings.featuredConfig?.weeklyNovelIds || []).length} Selected
                                    </span>
                                    <span className="text-xs font-bold mr-1 text-slate-500">Enable</span>
                                     <button
                                        onClick={() => toggleSetting('showWeeklyFeatured')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteSettings.showWeeklyFeatured ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.showWeeklyFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                                <input 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                    value={siteSettings.featuredConfig?.weeklyTitle || ''}
                                    placeholder="Weekly Featured"
                                    onChange={e => handleUpdateFeaturedConfig('weeklyTitle', e.target.value)}
                                />
                            </div>
                            
                            {/* List */}
                            <div className="space-y-2">
                                {(siteSettings.featuredConfig?.weeklyNovelIds || []).map(id => (
                                    <div key={id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-700">
                                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{id}</span>
                                        <span className="text-xs font-bold truncate max-w-[150px] mx-2 dark:text-white">
                                             {novels.find(n => n.id === id)?.title || layoutSearchResults.find(n => n.id === id)?.title || "..."}
                                        </span>
                                        <button onClick={() => removeFromConfigList('weeklyNovelIds', id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(siteSettings.featuredConfig?.weeklyNovelIds || []).length === 0 && (
                                    <div className="text-center py-6 text-slate-400 italic text-sm">
                                        Using Automatic Selection
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rising Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rising Stars</h3>
                                    <p className="text-xs text-slate-500">Rising fictions section (4 slots).</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded mr-2">
                                        {(siteSettings.featuredConfig?.risingNovelIds || []).length} Selected
                                    </span>
                                    <span className="text-xs font-bold mr-1 text-slate-500">Enable</span>
                                     <button
                                        onClick={() => toggleSetting('showRising')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteSettings.showRising ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.showRising ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                                <input 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                    value={siteSettings.featuredConfig?.risingTitle || ''}
                                    placeholder="Rising Stars"
                                    onChange={e => handleUpdateFeaturedConfig('risingTitle', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                {(siteSettings.featuredConfig?.risingNovelIds || []).map(id => (
                                    <div key={id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-700">
                                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{id}</span>
                                          <span className="text-xs font-bold truncate max-w-[150px] mx-2 dark:text-white">
                                             {novels.find(n => n.id === id)?.title || layoutSearchResults.find(n => n.id === id)?.title || "..."}
                                        </span>
                                        <button onClick={() => removeFromConfigList('risingNovelIds', id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(siteSettings.featuredConfig?.risingNovelIds || []).length === 0 && (
                                    <div className="text-center py-6 text-slate-400 italic text-sm">
                                        Using Automatic Selection
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Slider Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">3D Book Slider</h3>
                                    <p className="text-xs text-slate-500">Carousel items (10 recommended).</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded mr-2">
                                        {(siteSettings.featuredConfig?.sliderNovelIds || []).length} Selected
                                    </span>
                                    <span className="text-xs font-bold mr-1 text-slate-500">Enable</span>
                                     <button
                                        onClick={() => toggleSetting('showBookSlider')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteSettings.showBookSlider ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.showBookSlider ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                                <input 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                    value={siteSettings.featuredConfig?.sliderTitle || ''}
                                    placeholder="Popular on NovelVerse"
                                    onChange={e => handleUpdateFeaturedConfig('sliderTitle', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                {(siteSettings.featuredConfig?.sliderNovelIds || []).map(id => (
                                    <div key={id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-700">
                                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{id}</span>
                                          <span className="text-xs font-bold truncate max-w-[150px] mx-2 dark:text-white">
                                             {novels.find(n => n.id === id)?.title || layoutSearchResults.find(n => n.id === id)?.title || "..."}
                                        </span>
                                        <button onClick={() => removeFromConfigList('sliderNovelIds', id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(siteSettings.featuredConfig?.sliderNovelIds || []).length === 0 && (
                                    <div className="text-center py-6 text-slate-400 italic text-sm">
                                        Using Automatic Selection
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>

                     {/* Category Section Manager */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Feature</h3>
                                <p className="text-xs text-slate-500">Display a specific category grid (2 rows, 4 columns).</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold mr-2 text-slate-500">Enable Section</span>
                                <button
                                    onClick={() => handleUpdateCategorySection('show', !siteSettings.featuredConfig?.homeCategorySection?.show)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteSettings.featuredConfig?.homeCategorySection?.show ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.featuredConfig?.homeCategorySection?.show ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                                <input 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                    value={siteSettings.featuredConfig?.homeCategorySection?.title || 'Category Feature'}
                                    placeholder="Category Feature"
                                    onChange={e => handleUpdateCategorySection('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Category</label>
                                <select
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                    value={siteSettings.featuredConfig?.homeCategorySection?.category || ''}
                                    onChange={e => handleUpdateCategorySection('category', e.target.value)}
                                >
                                    <option value="">-- Select Category or Tag --</option>
                                    <optgroup label="Main Categories">
                                        <option value="Original">Original</option>
                                        <option value="Fanfic">Fanfic</option>
                                        <option value="Translation">Translation</option>
                                    </optgroup>
                                    <optgroup label="Popular Tags">
                                        {tagStats.map(stat => (
                                            <option key={stat.name} value={stat.name}>{stat.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                     </div>

                     {/* Rankings Manager */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rankings Managers</h3>
                                <p className="text-xs text-slate-500">Curate the leaderboards. Empty lists will auto-fill from stats.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold mr-1 text-slate-500">Enable Section</span>
                                <button
                                    onClick={() => toggleSetting('showRankings')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteSettings.showRankings ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.showRankings ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                            <input 
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                value={siteSettings.featuredConfig?.rankingConfig?.ranksTitle || ''}
                                placeholder="Stats & Rankings"
                                onChange={e => {
                                    const current = siteSettings.featuredConfig?.rankingConfig || {};
                                    const newConfig = { ...current, ranksTitle: e.target.value };
                                    handleUpdateFeaturedConfig('rankingConfig', newConfig as any);
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(['powerNovelIds', 'collectionNovelIds', 'activeNovelIds'] as const).map(listKey => (
                                <div key={listKey} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/30">
                                    <h4 className="font-bold text-sm mb-2 capitalize text-slate-700 dark:text-slate-300">{listKey.replace('NovelIds', '')} Ranking</h4>
                                    <div className="space-y-2 min-h-[100px]">
                                        {(siteSettings.featuredConfig?.rankingConfig?.[listKey] || []).map(id => (
                                            <div key={id} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                                                <span className="truncate max-w-[120px] dark:text-slate-300">{novels.find(n => n.id === id)?.title || id}</span>
                                                <button 
                                                    onClick={() => {
                                                        const current = siteSettings.featuredConfig?.rankingConfig || {};
                                                        const list = current[listKey] || [];
                                                        const newConfig = { ...current, [listKey]: list.filter(itemId => itemId !== id) };
                                                        handleUpdateFeaturedConfig('rankingConfig', newConfig as any);
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {(siteSettings.featuredConfig?.rankingConfig?.[listKey] || []).length === 0 && (
                                            <div className="text-xs text-center text-slate-400 py-4 italic">Auto-Generated</div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-xs text-slate-400">
                                        Use Search Above to Add
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>



                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Tag Cloud Editor */}
                         <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tag Analytics & Cloud</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold mr-1 text-slate-500">Enable</span>
                                    <button
                                        onClick={() => toggleSetting('showTags')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteSettings.showTags ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.showTags ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                                <input 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                    value={siteSettings.featuredConfig?.tagsTitle || ''}
                                    placeholder="Popular Tags"
                                    onChange={e => handleUpdateFeaturedConfig('tagsTitle', e.target.value)}
                                />
                            </div>

                            <p className="text-xs text-slate-500 mb-4">Click tags from the analytics table to toggle them in the homepage cloud.</p>
                            
                            <div className="mb-4 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                                <table className="min-w-full text-xs text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700 font-bold">
                                        <tr>
                                            <th className="p-2">Tag</th>
                                            <th className="p-2">Novels</th>
                                            <th className="p-2">Total Views</th>
                                            <th className="p-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {tagStats.map(stat => {
                                            const isActive = (siteSettings.featuredConfig?.tagConfig || []).includes(stat.name);
                                            return (
                                                <tr 
                                                    key={stat.name} 
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                                                    onClick={() => {
                                                        const currentTags = siteSettings.featuredConfig?.tagConfig || [];
                                                        if (isActive) {
                                                            handleUpdateTags(currentTags.filter(t => t !== stat.name));
                                                        } else {
                                                            handleUpdateTags([...currentTags, stat.name]);
                                                        }
                                                    }}
                                                >
                                                    <td className="p-2 font-medium dark:text-white">{stat.name}</td>
                                                    <td className="p-2">{stat.count}</td>
                                                    <td className="p-2">{stat.views.toLocaleString()}</td>
                                                    <td className="p-2">
                                                        {isActive && <span className="text-green-500 font-bold">Active</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                             <div className="mt-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Manual Entry (Comma Separated)</label>
                                <textarea
                                    className="w-full h-20 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                                    placeholder="Action, Adventure, System..."
                                    value={(siteSettings.featuredConfig?.tagConfig || []).join(', ')}
                                    onChange={(e) => handleUpdateTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                                />
                            </div>
                        </div>

                        {/* Promo Banner Editor */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Promo Banner</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold mr-1 text-slate-500">Enable</span>
                                    <button
                                        onClick={() => toggleSetting('showPromo')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteSettings.showPromo ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteSettings.showPromo ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                    <input 
                                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                        value={siteSettings.featuredConfig?.promoConfig?.title || ''}
                                        onChange={e => handleUpdatePromo('title', e.target.value)}
                                        placeholder="Meet NovelVerse"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
                                    <textarea 
                                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                        rows={3}
                                        value={siteSettings.featuredConfig?.promoConfig?.content || ''}
                                        onChange={e => handleUpdatePromo('content', e.target.value)}
                                        placeholder="Marketing text..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Btn 1 Text</label>
                                        <input 
                                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                            value={siteSettings.featuredConfig?.promoConfig?.primaryButtonText || ''}
                                            onChange={e => handleUpdatePromo('primaryButtonText', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Btn 2 Text</label>
                                        <input 
                                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                                            value={siteSettings.featuredConfig?.promoConfig?.secondaryButtonText || ''}
                                            onChange={e => handleUpdatePromo('secondaryButtonText', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};