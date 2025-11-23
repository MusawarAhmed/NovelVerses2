import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MockBackendService } from "../services/mockBackend";
import { GeminiService } from "../services/geminiService";
import { Novel, Transaction, User, Chapter, SiteSettings } from "../types";
import {
  Plus,
  Sparkles,
  Book,
  FileText,
  DollarSign,
  BarChart2,
  Users,
  Activity,
  Trash2,
  Shield,
  User as UserIcon,
  Edit,
  X,
  Save,
  RefreshCw,
  Bold,
  Italic,
  Underline,
  List,
  Code,
  Type,
  Strikethrough,
  Eye,
  Layers,
  LayoutTemplate,
  CreditCard,
  EyeOff,
} from "lucide-react";

// --- Custom Rich Text Editor Component ---
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const editorRef = useRef<HTMLDivElement>(null);

  // Ref to track if the update is coming from the user typing (internal) or parent prop (external)
  const isInternalChange = useRef(false);

  useEffect(() => {
    // Only update innerHTML from props if the change didn't originate from this component
    // This prevents cursor jumping issues
    if (editorRef.current && !isInternalChange.current && mode === "visual") {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value, mode]);

  const handleFormat = (
    command: string,
    val: string | undefined = undefined
  ) => {
    if (mode !== "visual") return;
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
      onMouseDown={(e) => {
        e.preventDefault();
        handleFormat(command, arg);
      }}
      className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ${
        active
          ? "bg-slate-200 dark:bg-slate-600 text-primary"
          : "text-slate-600 dark:text-slate-300"
      }`}
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
          {mode === "visual" && (
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
          onClick={() => setMode(mode === "visual" ? "code" : "visual")}
          className="flex items-center text-xs font-medium px-2 py-1 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors ml-2"
        >
          {mode === "visual" ? (
            <>
              <Code size={14} className="mr-1" /> HTML Source
            </>
          ) : (
            <>
              <Eye size={14} className="mr-1" /> Visual Editor
            </>
          )}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-grow relative overflow-hidden">
        {mode === "visual" ? (
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
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className="w-full h-full p-4 bg-slate-900 text-green-400 font-mono text-sm focus:outline-none resize-none"
            spellCheck={false}
          />
        )}
      </div>
      <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-400 flex justify-between">
        <span>{mode === "visual" ? "Writing Mode" : "HTML Mode"}</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
};

// --- Main Admin Component ---

export const Admin: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<
    "analytics" | "novels" | "chapters" | "users" | "frontend"
  >("analytics");
  const [novels, setNovels] = useState<Novel[]>([]);
  const [stats, setStats] = useState({
    totalNovels: 0,
    totalChapters: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    showHero: true,
    showWeeklyFeatured: true,
    showRankings: true,
    showRising: true,
    showTags: true,
    showPromo: true,
    enablePayments: true,
    showDemoCredentials: true,
  });

  // Form States
  const [isCreatingNovel, setIsCreatingNovel] = useState(false);
  const [editingNovelId, setEditingNovelId] = useState<string | null>(null);

  // User Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalMode, setUserModalMode] = useState<"view" | "edit" | null>(
    null
  ); // null = closed
  const [showPassword, setShowPassword] = useState(false);

  const initialNovelState = {
    title: "",
    author: "",
    description: "",
    tags: "",
    genre: "",
    coverUrl: "",
    status: "Ongoing",
    category: "Original",
    isWeeklyFeatured: false,
  };

  // Initialize Novel State from LocalStorage Draft if available
  const [newNovel, setNewNovel] = useState(() => {
    const draft = localStorage.getItem("nv_admin_novel_draft");
    return draft ? JSON.parse(draft) : initialNovelState;
  });

  const [generating, setGenerating] = useState(false);

  // Chapter States
  const [selectedNovelId, setSelectedNovelId] = useState(() => {
    const draft = localStorage.getItem("nv_admin_chapter_draft");
    return draft ? JSON.parse(draft).selectedNovelId || "" : "";
  });

  const [newChapter, setNewChapter] = useState(() => {
    const draft = localStorage.getItem("nv_admin_chapter_draft");
    return draft
      ? JSON.parse(draft).chapterData
      : { title: "", content: "", price: 0, isPaid: false, volume: "Volume 1" };
  });

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  // Auto-save Novel Draft
  useEffect(() => {
    // Only save draft if we are NOT editing an existing novel (creating new)
    if (!editingNovelId && isCreatingNovel) {
      localStorage.setItem("nv_admin_novel_draft", JSON.stringify(newNovel));
    }
  }, [newNovel, editingNovelId, isCreatingNovel]);

  // Auto-save Chapter Draft
  useEffect(() => {
    // Only save if not editing an existing chapter to avoid overwriting with dirty data
    if (!editingChapterId) {
      const draftData = {
        selectedNovelId,
        chapterData: newChapter,
      };
      localStorage.setItem("nv_admin_chapter_draft", JSON.stringify(draftData));
    }
  }, [newChapter, selectedNovelId, editingChapterId]);

  // Check for deep link state from NovelDetail page
  useEffect(() => {
    const state = location.state as { editNovelId?: string } | null;
    if (state?.editNovelId) {
      const novelToEdit = MockBackendService.getNovelById(state.editNovelId);
      if (novelToEdit) {
        setActiveTab("novels");
        handleEditNovel(novelToEdit);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  // Load chapter list when selected novel changes
  useEffect(() => {
    if (selectedNovelId) {
      setChapterList(MockBackendService.getChapters(selectedNovelId));
    } else {
      setChapterList([]);
    }
  }, [selectedNovelId]);

  const refreshData = () => {
    const data = MockBackendService.getNovels();
    setNovels(data);

    // Load Stats & Users
    setStats(MockBackendService.getStats());
    setTransactions(MockBackendService.getTransactions());
    setUsers(MockBackendService.getAllUsers());
    setSiteSettings(MockBackendService.getSiteSettings());

    // Auto set selected novel if creating chapter and none selected (and no draft)
    if (
      data.length > 0 &&
      !selectedNovelId &&
      !localStorage.getItem("nv_admin_chapter_draft")
    ) {
      setSelectedNovelId(data[0].id);
    }

    // Refresh chapter list if needed
    if (selectedNovelId) {
      setChapterList(MockBackendService.getChapters(selectedNovelId));
    }
  };

  const handleGenerateDescription = async () => {
    if (!newNovel.title || !newNovel.genre) {
      alert("Please fill in Title and Genre first.");
      return;
    }
    setGenerating(true);
    const desc = await GeminiService.generateSynopsis(
      newNovel.title,
      newNovel.genre,
      newNovel.tags.split(",")
    );
    setNewNovel({ ...newNovel, description: desc });
    setGenerating(false);
  };

  const handleSaveNovel = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingNovelId) {
      // Update existing
      const existing = novels.find((n) => n.id === editingNovelId);
      if (existing) {
        MockBackendService.updateNovel({
          ...existing,
          title: newNovel.title,
          author: newNovel.author,
          description: newNovel.description,
          tags: newNovel.tags.split(",").map((t) => t.trim()),
          coverUrl: newNovel.coverUrl || existing.coverUrl,
          status: newNovel.status as "Ongoing" | "Completed",
          category: newNovel.category as "Original" | "Fanfic" | "Translation",
          isWeeklyFeatured: newNovel.isWeeklyFeatured,
        });
      }
    } else {
      // Create new
      MockBackendService.createNovel({
        title: newNovel.title,
        author: newNovel.author,
        description: newNovel.description,
        tags: newNovel.tags.split(",").map((t) => t.trim()),
        coverUrl:
          newNovel.coverUrl ||
          `https://picsum.photos/seed/${newNovel.title.replace(
            /\s/g,
            ""
          )}/300/450`,
        status: newNovel.status as "Ongoing" | "Completed",
        category: newNovel.category as "Original" | "Fanfic" | "Translation",
        isWeeklyFeatured: newNovel.isWeeklyFeatured,
      });
      // Clear draft only on successful create
      localStorage.removeItem("nv_admin_novel_draft");
    }

    setIsCreatingNovel(false);
    setEditingNovelId(null);
    setNewNovel(initialNovelState);
    refreshData();
  };

  const handleDiscardNovel = () => {
    if (window.confirm("Discard changes and clear draft?")) {
      setIsCreatingNovel(false);
      setEditingNovelId(null);
      setNewNovel(initialNovelState);
      localStorage.removeItem("nv_admin_novel_draft");
    }
  };

  const handleEditNovel = (novel: Novel) => {
    setNewNovel({
      title: novel.title,
      author: novel.author,
      description: novel.description,
      tags: novel.tags.join(", "),
      genre: novel.tags[0] || "",
      coverUrl: novel.coverUrl,
      status: novel.status,
      category: novel.category,
      isWeeklyFeatured: !!novel.isWeeklyFeatured,
    });
    setEditingNovelId(novel.id);
    setIsCreatingNovel(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteNovel = (id: string) => {
    if (
      window.confirm(
        "Are you sure? This will delete the novel AND all its chapters permanently."
      )
    ) {
      MockBackendService.deleteNovel(id);
      refreshData();
    }
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNovelId) return;

    if (editingChapterId) {
      // Update Existing Chapter
      const existingChapter = chapterList.find(
        (c) => c.id === editingChapterId
      );
      if (existingChapter) {
        MockBackendService.updateChapter({
          ...existingChapter,
          title: newChapter.title,
          content: newChapter.content,
          price: newChapter.isPaid ? newChapter.price : 0,
          isPaid: newChapter.isPaid,
          volume: newChapter.volume || "Volume 1",
        });
        alert("Chapter updated successfully!");
      }
    } else {
      // Create New Chapter
      const existing = MockBackendService.getChapters(selectedNovelId);
      const order = existing.length + 1;

      MockBackendService.createChapter({
        novelId: selectedNovelId,
        title: newChapter.title,
        content: newChapter.content.startsWith("<")
          ? newChapter.content
          : `<p>${newChapter.content.replace(/\n/g, "</p><p>")}</p>`,
        price: newChapter.isPaid ? newChapter.price : 0,
        isPaid: newChapter.isPaid,
        order: order,
        volume: newChapter.volume || "Volume 1",
      });

      // Clear Draft only on new create
      localStorage.removeItem("nv_admin_chapter_draft");
      alert("Chapter uploaded successfully!");
    }

    // Reset Form
    setNewChapter({
      title: "",
      content: "",
      price: 0,
      isPaid: false,
      volume: "Volume 1",
    });
    setEditingChapterId(null);

    refreshData();
  };

  const handleEditChapter = (chapter: Chapter) => {
    setNewChapter({
      title: chapter.title,
      content: chapter.content,
      price: chapter.price,
      isPaid: chapter.isPaid,
      volume: chapter.volume || "Volume 1",
    });
    setEditingChapterId(chapter.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEditChapter = () => {
    setNewChapter({
      title: "",
      content: "",
      price: 0,
      isPaid: false,
      volume: "Volume 1",
    });
    setEditingChapterId(null);
  };

  const handleDeleteChapter = (id: string) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      MockBackendService.deleteChapter(id);
      // Check if we were editing this chapter
      if (editingChapterId === id) {
        handleCancelEditChapter();
      }
      refreshData();
    }
  };

  // --- User Management Functions ---

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      MockBackendService.deleteUser(id);
      refreshData();
    }
  };

  const handleUserRoleChange = (user: User, newRole: "admin" | "user") => {
    const updatedUser = { ...user, role: newRole };
    MockBackendService.updateUser(updatedUser);
    refreshData();
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setUserModalMode("view");
    setShowPassword(false);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserModalMode("edit");
    setShowPassword(false);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      MockBackendService.updateUser(selectedUser);
      setUserModalMode(null);
      refreshData();
    }
  };

  const toggleSetting = (key: keyof SiteSettings) => {
    const newSettings = { ...siteSettings, [key]: !siteSettings[key] };
    setSiteSettings(newSettings);
    MockBackendService.updateSiteSettings(newSettings);
  };

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1 ${
        activeTab === id
          ? "bg-primary text-white shadow-lg shadow-primary/30"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
      }`}
    >
      <Icon size={18} className="mr-3" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 md:min-h-screen">
        <div className="mb-8 px-4 py-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Admin Console
          </h2>
        </div>
        <nav>
          <SidebarItem id="analytics" label="Dashboard" icon={BarChart2} />
          <SidebarItem id="novels" label="Novels" icon={Book} />
          <SidebarItem id="chapters" label="Chapters" icon={FileText} />
          <SidebarItem id="users" label="Users & Roles" icon={Users} />
          <SidebarItem
            id="frontend"
            label="Site Settings"
            icon={LayoutTemplate}
          />
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
              {activeTab.replace("-", " ")}
            </h1>
          </div>

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="animate-fade-in">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Total Revenue
                    </h3>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.totalRevenue}
                  </div>
                  <p className="text-xs text-green-500 mt-1 font-medium">
                    +12% from last month
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Active Users
                    </h3>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.totalUsers}
                  </div>
                  <p className="text-xs text-blue-500 mt-1 font-medium">
                    +5 new today
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Total Novels
                    </h3>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                      <Book size={20} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.totalNovels}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Across 5 genres
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Total Chapters
                    </h3>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                      <FileText size={20} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.totalChapters}
                  </div>
                  <p className="text-xs text-orange-500 mt-1 font-medium">
                    Continually growing
                  </p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Recent Transactions
                  </h3>
                  <button className="text-sm text-primary hover:underline">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            No transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.slice(0, 10).map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                              {t.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                              {t.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                              {t.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                              +{t.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                              {new Date(t.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Frontend Management Tab */}
          {activeTab === "frontend" && (
            <div className="animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Site & Frontend Settings
                  </h3>
                  <p className="text-sm text-slate-500">
                    Toggle visibility of sections and manage global features.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      key: "enablePayments",
                      label: "Payment System",
                      desc: "Enable coin payments for premium chapters. If disabled, all chapters are free (Global Override).",
                    },
                    {
                      key: "showHero",
                      label: "Weekly Book Hero Section",
                      desc: "Large banner at the top with the weekly featured novel.",
                    },
                    {
                      key: "showWeeklyFeatured",
                      label: "Weekly Featured Grid",
                      desc: "Grid of 5 featured novels below the hero.",
                    },
                    {
                      key: "showRankings",
                      label: "Ranking Lists",
                      desc: "Three columns for Power, Collection, and Active rankings.",
                    },
                    {
                      key: "showRising",
                      label: "Rising Fictions",
                      desc: "Grid of potential starlet / rising novels.",
                    },
                    {
                      key: "showTags",
                      label: "Popular Tags Cloud",
                      desc: "List of searchable genre tags.",
                    },
                    {
                      key: "showPromo",
                      label: "Promotional Banner",
                      desc: "Bottom banner linking to auth/benefits pages.",
                    },
                    {
                      key: "showDemoCredentials",
                      label: "Show Demo Credentials",
                      desc: "Show admin/user credentials on login page.",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          toggleSetting(item.key as keyof SiteSettings)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          siteSettings[item.key as keyof SiteSettings]
                            ? "bg-primary"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            siteSettings[item.key as keyof SiteSettings]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    User Management
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Role (Assign)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Coins
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-slate-600 flex items-center justify-center text-primary dark:text-slate-200 font-bold">
                                {u.username[0].toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {u.username}
                                </div>
                                <div className="text-xs text-slate-500">
                                  ID: {u.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {u.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleUserRoleChange(
                                  u,
                                  e.target.value as "admin" | "user"
                                )
                              }
                              className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-primary cursor-pointer ${
                                u.role === "admin"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              }`}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
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
                    {userModalMode === "view" ? "User Details" : "Edit User"}
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
                        {selectedUser.username[0].toUpperCase()}
                      </div>
                      {userModalMode === "view" && (
                        <>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {selectedUser.username}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {selectedUser.email}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          ID
                        </label>
                        <input
                          disabled
                          value={selectedUser.id}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm font-mono text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Username
                        </label>
                        <input
                          disabled={userModalMode === "view"}
                          value={selectedUser.username}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              username: e.target.value,
                            })
                          }
                          className={`w-full p-2 rounded border text-sm ${
                            userModalMode === "view"
                              ? "bg-transparent border-transparent"
                              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Email
                        </label>
                        <input
                          disabled={userModalMode === "view"}
                          value={selectedUser.email}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              email: e.target.value,
                            })
                          }
                          className={`w-full p-2 rounded border text-sm ${
                            userModalMode === "view"
                              ? "bg-transparent border-transparent"
                              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            disabled={userModalMode === "view"}
                            value={selectedUser.password || ""}
                            placeholder={
                              userModalMode === "view"
                                ? "********"
                                : "Leave blank to keep current"
                            }
                            onChange={(e) =>
                              setSelectedUser({
                                ...selectedUser,
                                password: e.target.value,
                              })
                            }
                            className={`w-full p-2 pr-10 rounded border text-sm ${
                              userModalMode === "view"
                                ? "bg-transparent border-transparent"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Wallet Balance (Coins)
                        </label>
                        <div className="relative">
                          <CreditCard
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={16}
                          />
                          <input
                            type="number"
                            disabled={userModalMode === "view"}
                            value={selectedUser.coins}
                            onChange={(e) =>
                              setSelectedUser({
                                ...selectedUser,
                                coins: parseInt(e.target.value) || 0,
                              })
                            }
                            className={`w-full pl-8 p-2 rounded border text-sm ${
                              userModalMode === "view"
                                ? "bg-transparent border-transparent font-bold text-slate-900 dark:text-white"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Role
                        </label>
                        <select
                          disabled={userModalMode === "view"}
                          value={selectedUser.role}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              role: e.target.value as "admin" | "user",
                            })
                          }
                          className={`w-full p-2 rounded border text-sm ${
                            userModalMode === "view"
                              ? "bg-transparent border-transparent appearance-none"
                              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {/* Read Only Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-100 dark:border-slate-700 text-center">
                          <div className="text-lg font-bold text-primary">
                            {selectedUser.bookmarks.length}
                          </div>
                          <div className="text-xs text-slate-500">
                            Bookmarks
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-100 dark:border-slate-700 text-center">
                          <div className="text-lg font-bold text-primary">
                            {selectedUser.readingHistory?.length || 0}
                          </div>
                          <div className="text-xs text-slate-500">
                            Novels Read
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setUserModalMode(null)}
                        className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        {userModalMode === "view" ? "Close" : "Cancel"}
                      </button>
                      {userModalMode === "edit" && (
                        <button
                          type="submit"
                          className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                          Save Changes
                        </button>
                      )}
                      {userModalMode === "view" && (
                        <button
                          type="button"
                          onClick={() => setUserModalMode("edit")}
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
          {activeTab === "novels" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Novels Library
                </h2>
                <button
                  onClick={() => {
                    setIsCreatingNovel(true);
                    setEditingNovelId(null);
                    setNewNovel(initialNovelState);
                  }}
                  className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={18} className="mr-2" /> Add New Novel
                </button>
              </div>

              {isCreatingNovel && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8 border border-slate-200 dark:border-slate-700 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {editingNovelId ? "Edit Novel" : "Create New Novel"}
                      </h3>
                      {!editingNovelId && (
                        <span className="ml-3 text-xs text-slate-400 flex items-center">
                          <RefreshCw size={12} className="mr-1" /> Auto-save
                          enabled
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleDiscardNovel}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleSaveNovel} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                          Title
                        </label>
                        <input
                          required
                          value={newNovel.title}
                          onChange={(e) =>
                            setNewNovel({ ...newNovel, title: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                          Genre
                        </label>
                        <input
                          required
                          value={newNovel.genre}
                          onChange={(e) =>
                            setNewNovel({ ...newNovel, genre: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                          placeholder="e.g. Fantasy"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                          Author
                        </label>
                        <input
                          required
                          value={newNovel.author}
                          onChange={(e) =>
                            setNewNovel({ ...newNovel, author: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                            Status
                          </label>
                          <select
                            value={newNovel.status}
                            onChange={(e) =>
                              setNewNovel({
                                ...newNovel,
                                status: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                          >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                            Category
                          </label>
                          <select
                            value={newNovel.category}
                            onChange={(e) =>
                              setNewNovel({
                                ...newNovel,
                                category: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                          >
                            <option value="Original">Original</option>
                            <option value="Fanfic">Fanfic</option>
                            <option value="Translation">Translation</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Cover Image URL
                      </label>
                      <input
                        value={newNovel.coverUrl}
                        onChange={(e) =>
                          setNewNovel({ ...newNovel, coverUrl: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                      />
                      {newNovel.coverUrl && (
                        <img
                          src={newNovel.coverUrl}
                          alt="Preview"
                          className="mt-2 h-24 w-16 object-cover rounded border border-slate-300 dark:border-slate-600"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Tags (comma separated)
                      </label>
                      <input
                        value={newNovel.tags}
                        onChange={(e) =>
                          setNewNovel({ ...newNovel, tags: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="weeklyFeatured"
                        checked={newNovel.isWeeklyFeatured}
                        onChange={(e) =>
                          setNewNovel({
                            ...newNovel,
                            isWeeklyFeatured: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="weeklyFeatured"
                        className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Featured in Weekly Hero Section
                      </label>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Description
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateDescription}
                          disabled={generating}
                          className="text-xs flex items-center text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 transition-colors"
                        >
                          <Sparkles size={12} className="mr-1" />{" "}
                          {generating
                            ? "Generating..."
                            : "Auto-Generate with Gemini"}
                        </button>
                      </div>
                      <textarea
                        required
                        rows={4}
                        value={newNovel.description}
                        onChange={(e) =>
                          setNewNovel({
                            ...newNovel,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleDiscardNovel}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <Save size={18} className="mr-2" />{" "}
                        {editingNovelId ? "Update Novel" : "Create Novel"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Cover
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {novels.map((n) => (
                      <tr
                        key={n.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={n.coverUrl}
                            alt=""
                            className="h-12 w-8 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                          {n.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {n.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              n.status === "Ongoing"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {n.status}
                          </span>
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
          {activeTab === "chapters" && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                    <FileText className="mr-2 text-primary" />{" "}
                    {editingChapterId ? "Edit Chapter" : "Upload New Chapter"}
                  </h3>
                  <div className="flex items-center gap-3">
                    {!editingChapterId && (
                      <span className="text-xs text-slate-400 flex items-center">
                        <RefreshCw size={12} className="mr-1" /> Auto-save
                        enabled
                      </span>
                    )}
                    {editingChapterId && (
                      <button
                        onClick={handleCancelEditChapter}
                        className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
                <form onSubmit={handleSaveChapter} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Select Novel
                    </label>
                    <div className="relative">
                      <select
                        required
                        disabled={!!editingChapterId}
                        value={selectedNovelId}
                        onChange={(e) => setSelectedNovelId(e.target.value)}
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none disabled:opacity-50"
                      >
                        <option value="">-- Select a Novel --</option>
                        {novels.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.title}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        Chapter Title
                      </label>
                      <input
                        required
                        value={newChapter.title}
                        onChange={(e) =>
                          setNewChapter({
                            ...newChapter,
                            title: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g. Chapter 5: The Return"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        Volume Name
                      </label>
                      <div className="relative">
                        <Layers
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          required
                          value={newChapter.volume}
                          onChange={(e) =>
                            setNewChapter({
                              ...newChapter,
                              volume: e.target.value,
                            })
                          }
                          className="w-full pl-10 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                          placeholder="e.g. Volume 1: The Awakening"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={newChapter.isPaid}
                          onChange={(e) =>
                            setNewChapter({
                              ...newChapter,
                              isPaid: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </div>
                      <span className="ml-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        Premium Chapter
                      </span>
                    </label>

                    {newChapter.isPaid && (
                      <div className="flex items-center animate-fade-in ml-auto">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-l-md border border-r-0 border-yellow-200 dark:border-yellow-700">
                          <DollarSign
                            size={16}
                            className="text-yellow-700 dark:text-yellow-500"
                          />
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={newChapter.price}
                          onChange={(e) =>
                            setNewChapter({
                              ...newChapter,
                              price: parseInt(e.target.value),
                            })
                          }
                          className="w-24 p-1.5 rounded-r-md border border-yellow-200 dark:border-yellow-700 dark:bg-slate-700 dark:text-white text-sm focus:outline-none"
                        />
                        <span className="ml-2 text-sm text-slate-500">
                          Coins
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Content
                    </label>
                    <RichTextEditor
                      value={newChapter.content}
                      onChange={(html) =>
                        setNewChapter({ ...newChapter, content: html })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    {editingChapterId ? "Update Chapter" : "Publish Chapter"}
                  </button>
                </form>
              </div>

              {/* Existing Chapters List */}
              {selectedNovelId && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Existing Chapters
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Volume
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {chapterList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-center text-slate-500"
                            >
                              No chapters found for this novel.
                            </td>
                          </tr>
                        ) : (
                          chapterList.map((chapter) => (
                            <tr
                              key={chapter.id}
                              className={
                                editingChapterId === chapter.id
                                  ? "bg-indigo-50 dark:bg-indigo-900/20"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                #{chapter.order}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 max-w-[100px] truncate"
                                title={chapter.volume}
                              >
                                {chapter.volume || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                {chapter.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                {chapter.isPaid
                                  ? `${chapter.price} Coins`
                                  : "Free"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEditChapter(chapter)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-colors"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteChapter(chapter.id)
                                  }
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
        </div>
      </div>
    </div>
  );
};
