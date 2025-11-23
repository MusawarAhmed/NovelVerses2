
import { User, Novel, Chapter, Transaction, SiteSettings, Comment, ReadingHistoryItem } from '../types';

// --- Expanded Mock Data for "Webnovel" Feel ---
const MOCK_NOVELS: Novel[] = [
  // --- Weekly Featured Candidates ---
  {
    id: '1',
    title: "The Azure Sovereign",
    author: "Celestial Quill",
    description: "In a world where martial arts determine one's destiny, a young orphan discovers a mysterious azure ring that holds the soul of an ancient dragon. His journey to the peak of the cultivation world begins now.",
    coverUrl: "https://picsum.photos/seed/azure/300/450",
    tags: ["Eastern", "Cultivation", "Action"],
    category: 'Original',
    status: 'Ongoing',
    views: 1250000,
    rating: 4.9,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isWeeklyFeatured: true
  },
  {
    id: '2',
    title: "Reborn as a Cyber-Cat",
    author: "Neon Whisker",
    description: "After a fatal server crash, elite hacker Jin wakes up in 2077... as a cybernetic stray cat? He must navigate the neon-lit streets of Neo-Tokyo, hacking corp mainframes with his neural-linked paws.",
    coverUrl: "https://picsum.photos/seed/cybercat/300/450",
    tags: ["Sci-Fi", "Cyberpunk", "Reincarnation"],
    category: 'Original',
    status: 'Ongoing',
    views: 84000,
    rating: 4.7,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isWeeklyFeatured: true
  },
  {
    id: '8',
    title: "My Vampire System",
    author: "BloodMoon",
    description: "In a future where humans fight aliens, Quinn receives a system that turns him into a vampire. He must hide his identity while leveling up to save humanity.",
    coverUrl: "https://picsum.photos/seed/vampire/300/450",
    tags: ["System", "Vampire", "Action"],
    category: 'Original',
    status: 'Ongoing',
    views: 2150000,
    rating: 4.8,
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    isWeeklyFeatured: true
  },
  {
    id: '5',
    title: "System: Level Up in Apocalypse",
    author: "SystemLord",
    description: "The world ended on a Tuesday. On Wednesday, Jack got a notification: [System Initialized]. Now he hunts zombies to pay his rent.",
    coverUrl: "https://picsum.photos/seed/zombie/300/450",
    tags: ["System", "Apocalypse", "Action"],
    category: 'Original',
    status: 'Ongoing',
    views: 670000,
    rating: 4.6,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isWeeklyFeatured: true
  },
  {
    id: '9',
    title: "The CEO's Contract Mage",
    author: "RosePetal",
    description: "She thought she was just applying for a secretary job. She didn't know the CEO was the Archmage of the West Tower, and the contract included magical binding.",
    coverUrl: "https://picsum.photos/seed/romance/300/450",
    tags: ["Romance", "Urban Fantasy", "Magic"],
    category: 'Original',
    status: 'Completed',
    views: 450000,
    rating: 4.5,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    isWeeklyFeatured: true
  },

  // --- Fanfics ---
  {
    id: '4',
    title: "Harry Potter: The Shadow Mage",
    author: "MagicFan99",
    description: "What if Harry was sorted into Slytherin and discovered an ancient form of shadow magic? A retelling of the classic saga with a darker twist.",
    coverUrl: "https://picsum.photos/seed/shadow/300/450",
    tags: ["Fanfic", "Magic", "Adventure"],
    category: 'Fanfic',
    status: 'Ongoing',
    views: 890000,
    rating: 4.8,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    isWeeklyFeatured: false
  },
  {
    id: '7',
    title: "Naruto: The Wind Sage",
    author: "NinjaWrite",
    description: "An OC enters the world of Naruto with the ability to manipulate wind at a molecular level. Watch him reshape the ninja world.",
    coverUrl: "https://picsum.photos/seed/ninja/300/450",
    tags: ["Fanfic", "Action", "Anime"],
    category: 'Fanfic',
    status: 'Completed',
    views: 550000,
    rating: 4.3,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    isWeeklyFeatured: false
  },
  {
    id: '10',
    title: "One Piece: Marine Admiral",
    author: "JusticeSeeker",
    description: "Reincarnated as a Marine Recruit with a Glint-Glint Fruit variant. Absolute Justice takes on a new meaning.",
    coverUrl: "https://picsum.photos/seed/marine/300/450",
    tags: ["Fanfic", "Pirates", "System"],
    category: 'Fanfic',
    status: 'Ongoing',
    views: 320000,
    rating: 4.6,
    updatedAt: new Date().toISOString(),
    isWeeklyFeatured: false
  },

  // --- Rising / High Quality ---
  {
    id: '3',
    title: "Silence of the Stars",
    author: "Void Walker",
    description: "Humanity has expanded to the edges of the galaxy, only to find that the stars are going out one by one. Captain Elara Vance commands the last scout ship.",
    coverUrl: "https://picsum.photos/seed/stars/300/450",
    tags: ["Sci-Fi", "Mystery", "Space Opera"],
    category: 'Original',
    status: 'Completed',
    views: 45000,
    rating: 4.9,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    isWeeklyFeatured: false
  },
  {
    id: '6',
    title: "The Villainess Wants to Farm",
    author: "CozyTea",
    description: "Reincarnated as the villainess destined to die, she decides to flee to the countryside and start a magical vegetable farm instead.",
    coverUrl: "https://picsum.photos/seed/cottage/300/450",
    tags: ["Romance", "Slice of Life", "Fantasy"],
    category: 'Original',
    status: 'Ongoing',
    views: 32000,
    rating: 4.8,
    updatedAt: new Date().toISOString(),
    isWeeklyFeatured: false
  },
  {
    id: '11',
    title: "Dungeon Hotel",
    author: "Innkeeper",
    description: "I inherited a hotel inside the S-Class Dungeon. The guests are monsters, but they pay in gold.",
    coverUrl: "https://picsum.photos/seed/hotel/300/450",
    tags: ["System", "Slice of Life", "Comedy"],
    category: 'Original',
    status: 'Ongoing',
    views: 28000,
    rating: 4.7,
    updatedAt: new Date().toISOString(),
    isWeeklyFeatured: false
  },
  {
    id: '12',
    title: "Sword God in a Magic World",
    author: "BladeMaster",
    description: "Transmigrated to a world of wizards with zero mana, but maximum sword talent.",
    coverUrl: "https://picsum.photos/seed/sword/300/450",
    tags: ["Fantasy", "Action", "Transmigration"],
    category: 'Original',
    status: 'Ongoing',
    views: 15000,
    rating: 4.6,
    updatedAt: new Date().toISOString(),
    isWeeklyFeatured: false
  },
  
  // --- Filler / Rankings Material ---
  {
    id: '13',
    title: "Global Evolution",
    author: "BioHazard",
    description: "The rain changed everything. Plants grew sentient, animals mutated. Humans are no longer the top of the food chain.",
    coverUrl: "https://picsum.photos/seed/jungle/300/450",
    tags: ["Sci-Fi", "Horror", "Survival"],
    category: 'Original',
    status: 'Ongoing',
    views: 900000,
    rating: 4.5,
    updatedAt: new Date(Date.now() - 1000 * 60).toISOString(), // 1 min ago
    isWeeklyFeatured: false
  },
  {
    id: '14',
    title: "Marvel: Tech Genius",
    author: "IronFan",
    description: "Building Stark tech in a garage before Tony even builds the Mark 1.",
    coverUrl: "https://picsum.photos/seed/tech/300/450",
    tags: ["Fanfic", "Sci-Fi", "Marvel"],
    category: 'Fanfic',
    status: 'Ongoing',
    views: 750000,
    rating: 4.4,
    updatedAt: new Date().toISOString(),
    isWeeklyFeatured: false
  },
  {
    id: '15',
    title: "Ascension of the Alchemist",
    author: "PotionBrewer",
    description: "Turning lead to gold is child's play. I turn water into divine nectar.",
    coverUrl: "https://picsum.photos/seed/alchemy/300/450",
    tags: ["Eastern", "Cultivation"],
    category: 'Original',
    status: 'Completed',
    views: 1200000,
    rating: 4.7,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
    isWeeklyFeatured: false
  }
];

// Helper to generate longer chapter content
const generateLongContent = (title: string, volume: string, chapterNum: number) => {
    const paragraphs = [
        "The sky above was the color of television, tuned to a dead channel. It wasn't supposed to be like this, not today, not when the fate of the realm hung in the balance. He gripped the hilt of his sword, feeling the cold steel bite into his palm.",
        "\"We have to move,\" she whispered, her voice barely audible over the howling wind. \"They're coming.\"",
        "He nodded, glancing back at the ruins of what was once their home. \"I know. But where can we go? The borders are sealed, and the Shadow Guards are everywhere.\"",
        "Suddenly, a blinding light erupted from the horizon. The ground shook violently, throwing them off balance. It was starting. The prophecy had spoken of this day, the day the stars would fall and the seas would boil.",
        "He remembered the old master's words: 'Power comes not from strength, but from the will to endure.' He took a deep breath, channeling his inner energy. The air around him shimmered with a faint azure glow.",
        "\"Watch out!\" she screamed, pushing him aside just as a massive boulder crashed where he had been standing. Dust and debris filled the air, choking them.",
        "They scrambled to their feet, running towards the dense forest. The trees here were ancient, their roots twisted like gnarled fingers. Shadows danced in the periphery of their vision, whispering secrets of a forgotten age.",
        "As they ran, he thought about his training. The endless hours of meditation, the grueling physical exercises, the pain of unlocking his meridians. It all led to this moment. He couldn't fail. He wouldn't fail.",
        "They reached a clearing, panting heavily. In the center stood a stone pedestal, ancient runes glowing softly on its surface. \"Is this it?\" he asked, approaching it cautiously.",
        "\"It has to be,\" she replied, her eyes wide with awe. \"The Sanctuary of the Lost.\""
    ];

    let content = `<h3>${title}</h3><p class="italic text-slate-500 mb-4">Volume: ${volume}</p>`;
    
    // Repeat paragraphs to create length (approx 2000 words)
    for (let i = 0; i < 15; i++) {
        content += `<p>${paragraphs[i % paragraphs.length]}</p>`;
        content += `<p>Section ${i + 1}: The journey continued with renewed vigor. The challenges they faced were merely stepping stones on the path to greatness. He felt his cultivation base stirring, a sign that a breakthrough was imminent.</p>`;
        if (i % 3 === 0) {
            content += `<p>"Do you think we'll make it?" she asked, her voice trembling slightly.</p><p>"We have to," he replied firmly. "For everyone we lost."</p>`;
        }
    }
    
    content += `<p class="mt-8 font-bold text-center">To be continued...</p>`;
    return content;
};

const generateChaptersForNovels = (novels: Novel[]): Chapter[] => {
    let allChapters: Chapter[] = [];
    
    novels.forEach(novel => {
        const chapterCount = Math.floor(Math.random() * 15) + 15; // 15-30 chapters per novel
        for (let i = 1; i <= chapterCount; i++) {
            const volume = i <= 10 ? "Volume 1: The Beginning" : "Volume 2: Rising Storm";
            const isPaid = i > 5; 
            
            allChapters.push({
                id: `${novel.id}_c${i}`,
                novelId: novel.id,
                title: `Chapter ${i}: The Story Continues`,
                content: generateLongContent(`Chapter ${i}`, volume, i),
                volume: volume,
                order: i,
                isPaid: isPaid,
                price: isPaid ? 15 : 0,
                createdAt: new Date(new Date().getTime() - (chapterCount - i) * 86400000).toISOString() 
            });
        }
    });
    return allChapters;
};

const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    username: 'AdminUser',
    email: 'admin@novelverse.com',
    role: 'admin',
    coins: 9999,
    bookmarks: [],
    purchasedChapters: [],
    readingHistory: []
  },
  {
    id: 'user1',
    username: 'ReaderOne',
    email: 'reader@novelverse.com',
    role: 'user',
    coins: 50, 
    bookmarks: ['1', '8'],
    purchasedChapters: [],
    readingHistory: []
  }
];

const DEFAULT_SITE_SETTINGS: SiteSettings = {
    showHero: true,
    showWeeklyFeatured: true,
    showRankings: true,
    showRising: true,
    showTags: true,
    showPromo: true,
    enablePayments: true,
};

// Generate random comments
const generateComments = (): Comment[] => {
    const comments: Comment[] = [];
    const usernames = ["DragonSlayer", "BookWorm99", "DaoistPeace", "SystemUser", "Lurker", "KeyboardWarrior"];
    const messages = [
        "Great chapter! Can't wait for the next one.",
        "The MC is too OP, please nerf.",
        "Finally, some character development!",
        "I noticed a typo in the third paragraph.",
        "This cliffhanger is killing me!",
        "Does anyone know when the next update is?",
        "First!",
        "Thanks for the chapter author-san."
    ];
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];

    for (let i = 0; i < 50; i++) {
        comments.push({
            id: `cmt_${i}`,
            chapterId: `mock_chapter_${Math.floor(Math.random() * 100)}`, // Placeholder linking
            userId: `user_${Math.floor(Math.random() * 100)}`,
            username: usernames[Math.floor(Math.random() * usernames.length)],
            content: messages[Math.floor(Math.random() * messages.length)],
            likes: Math.floor(Math.random() * 100),
            createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
            avatarColor: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    return comments;
};

export const MockBackendService = {
  init: () => {
    if (!localStorage.getItem('nv_novels')) {
      localStorage.setItem('nv_novels', JSON.stringify(MOCK_NOVELS));
    }
    // Regenerate chapters if they seem short or empty (forcing update for this task)
    const currentNovels = JSON.parse(localStorage.getItem('nv_novels') || '[]');
    // Always regenerate for this demo to ensure long content exists
    const newChapters = generateChaptersForNovels(currentNovels);
    localStorage.setItem('nv_chapters', JSON.stringify(newChapters));

    if (!localStorage.getItem('nv_users')) {
      localStorage.setItem('nv_users', JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem('nv_transactions')) {
      localStorage.setItem('nv_transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('nv_site_settings')) {
        localStorage.setItem('nv_site_settings', JSON.stringify(DEFAULT_SITE_SETTINGS));
    }
    if (!localStorage.getItem('nv_comments')) {
        localStorage.setItem('nv_comments', JSON.stringify(generateComments()));
    }
  },

  getNovels: (): Novel[] => {
    return JSON.parse(localStorage.getItem('nv_novels') || '[]');
  },

  getNovelById: (id: string): Novel | undefined => {
    const novels = MockBackendService.getNovels();
    return novels.find(n => n.id === id);
  },

  // --- Homepage & Ranking Logic ---
  
  getWeeklyFeatured: (limit?: number): Novel[] => {
    const novels = MockBackendService.getNovels();
    const featured = novels.filter(n => n.isWeeklyFeatured);
    const result = featured.length > 0 ? featured : novels.slice(0, 5);
    return limit ? result.slice(0, limit) : result;
  },

  getRankedNovels: (type: 'Power' | 'Collection' | 'Active', limit?: number): Novel[] => {
    const novels = MockBackendService.getNovels();
    let sorted: Novel[] = [];
    
    if (type === 'Power') {
        sorted = [...novels].sort((a, b) => b.rating - a.rating);
    } else if (type === 'Collection') {
        sorted = [...novels].sort((a, b) => b.views - a.views);
    } else if (type === 'Active') {
        sorted = [...novels].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else {
        sorted = novels;
    }
    return limit ? sorted.slice(0, limit) : sorted;
  },

  getRisingStars: (limit?: number): Novel[] => {
      const novels = MockBackendService.getNovels();
      const rising = novels.filter(n => n.views < 50000 && n.rating >= 4.5);
      const result = rising.length > 0 ? rising : novels;
      return limit ? result.slice(0, limit) : result;
  },
  
  // ------------------------------------------------

  createNovel: (novel: Omit<Novel, 'id' | 'updatedAt' | 'views' | 'rating'>) => {
    const novels = MockBackendService.getNovels();
    const newNovel: Novel = {
      ...novel,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: new Date().toISOString(),
      views: 0,
      rating: 0
    };
    novels.push(newNovel);
    localStorage.setItem('nv_novels', JSON.stringify(novels));
    return newNovel;
  },

  updateNovel: (updatedNovel: Novel) => {
    const novels = MockBackendService.getNovels();
    const index = novels.findIndex(n => n.id === updatedNovel.id);
    if (index !== -1) {
      novels[index] = { ...updatedNovel, updatedAt: new Date().toISOString() };
      localStorage.setItem('nv_novels', JSON.stringify(novels));
    }
  },

  deleteNovel: (id: string) => {
    let novels = MockBackendService.getNovels();
    novels = novels.filter(n => n.id !== id);
    localStorage.setItem('nv_novels', JSON.stringify(novels));

    let chapters: Chapter[] = JSON.parse(localStorage.getItem('nv_chapters') || '[]');
    chapters = chapters.filter(c => c.novelId !== id);
    localStorage.setItem('nv_chapters', JSON.stringify(chapters));
    
    let users: User[] = JSON.parse(localStorage.getItem('nv_users') || '[]');
    users = users.map(u => ({
        ...u,
        bookmarks: u.bookmarks.filter(bid => bid !== id)
    }));
    localStorage.setItem('nv_users', JSON.stringify(users));
  },

  getChapters: (novelId: string): Chapter[] => {
    const chapters: Chapter[] = JSON.parse(localStorage.getItem('nv_chapters') || '[]');
    return chapters.filter(c => c.novelId === novelId).sort((a, b) => a.order - b.order);
  },

  getChapter: (id: string): Chapter | undefined => {
    const chapters: Chapter[] = JSON.parse(localStorage.getItem('nv_chapters') || '[]');
    return chapters.find(c => c.id === id);
  },

  createChapter: (chapter: Omit<Chapter, 'id' | 'createdAt'>) => {
    const chapters = JSON.parse(localStorage.getItem('nv_chapters') || '[]');
    const newChapter: Chapter = {
      ...chapter,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    chapters.push(newChapter);
    localStorage.setItem('nv_chapters', JSON.stringify(chapters));
    
    const novels = MockBackendService.getNovels();
    const novelIndex = novels.findIndex(n => n.id === chapter.novelId);
    if (novelIndex >= 0) {
      novels[novelIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('nv_novels', JSON.stringify(novels));
    }
    return newChapter;
  },

  updateChapter: (updatedChapter: Chapter) => {
    const chapters = JSON.parse(localStorage.getItem('nv_chapters') || '[]');
    const index = chapters.findIndex((c: Chapter) => c.id === updatedChapter.id);
    if (index !== -1) {
      chapters[index] = updatedChapter;
      localStorage.setItem('nv_chapters', JSON.stringify(chapters));
    }
  },

  deleteChapter: (id: string) => {
    let chapters = JSON.parse(localStorage.getItem('nv_chapters') || '[]');
    chapters = chapters.filter((c: Chapter) => c.id !== id);
    localStorage.setItem('nv_chapters', JSON.stringify(chapters));
  },

  login: (email: string): User | undefined => {
    const users: User[] = JSON.parse(localStorage.getItem('nv_users') || '[]');
    return users.find(u => u.email === email);
  },

  signup: (username: string, email: string): User => {
    const users: User[] = JSON.parse(localStorage.getItem('nv_users') || '[]');
    if (users.find(u => u.email === email)) throw new Error("User already exists");
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      role: 'user',
      coins: 50,
      bookmarks: [],
      purchasedChapters: [],
      readingHistory: []
    };
    users.push(newUser);
    localStorage.setItem('nv_users', JSON.stringify(users));
    return newUser;
  },

  getUser: (id: string): User | undefined => {
    const users: User[] = JSON.parse(localStorage.getItem('nv_users') || '[]');
    return users.find(u => u.id === id);
  },

  getAllUsers: (): User[] => {
    return JSON.parse(localStorage.getItem('nv_users') || '[]');
  },

  updateUser: (user: User) => {
    const users = MockBackendService.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
        users[idx] = user;
        localStorage.setItem('nv_users', JSON.stringify(users));
    }
  },

  deleteUser: (id: string) => {
    const users = MockBackendService.getAllUsers();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem('nv_users', JSON.stringify(newUsers));
  },

  purchaseChapter: (userId: string, chapterId: string): boolean => {
    const settings = MockBackendService.getSiteSettings();
    if (!settings.enablePayments) return true;

    const users: User[] = JSON.parse(localStorage.getItem('nv_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const chapter = MockBackendService.getChapter(chapterId);
    if (!chapter) return false;

    const user = users[userIndex];
    if (user.purchasedChapters.includes(chapterId)) return true;
    if (user.coins < chapter.price) return false;

    user.coins -= chapter.price;
    user.purchasedChapters.push(chapterId);
    users[userIndex] = user;
    localStorage.setItem('nv_users', JSON.stringify(users));

    const transactions: Transaction[] = JSON.parse(localStorage.getItem('nv_transactions') || '[]');
    transactions.unshift({
        id: Math.random().toString(36).substr(2, 9),
        userId: userId,
        amount: chapter.price,
        type: 'purchase',
        description: `Purchased ${chapter.title}`,
        date: new Date().toISOString()
    });
    localStorage.setItem('nv_transactions', JSON.stringify(transactions));

    return true;
  },

  toggleBookmark: (userId: string, novelId: string): string[] => {
    const users: User[] = JSON.parse(localStorage.getItem('nv_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return [];

    const user = users[userIndex];
    if (user.bookmarks.includes(novelId)) {
      user.bookmarks = user.bookmarks.filter(id => id !== novelId);
    } else {
      user.bookmarks.push(novelId);
    }
    users[userIndex] = user;
    localStorage.setItem('nv_users', JSON.stringify(users));
    return user.bookmarks;
  },

  // --- Reading History ---
  saveReadingHistory: (userId: string, novelId: string, chapterId: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('nv_users') || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;

    const user = users[idx];
    if (!user.readingHistory) user.readingHistory = [];

    // Remove existing entry for this novel if any
    user.readingHistory = user.readingHistory.filter(h => h.novelId !== novelId);
    
    // Add new entry to the top
    user.readingHistory.unshift({
      novelId,
      chapterId,
      lastReadAt: new Date().toISOString()
    });

    // Optional: Limit history size
    if (user.readingHistory.length > 20) {
      user.readingHistory = user.readingHistory.slice(0, 20);
    }

    users[idx] = user;
    localStorage.setItem('nv_users', JSON.stringify(users));
  },

  getTransactions: (): Transaction[] => {
      return JSON.parse(localStorage.getItem('nv_transactions') || '[]');
  },

  getStats: () => {
      const novels = MockBackendService.getNovels();
      const chapters = JSON.parse(localStorage.getItem('nv_chapters') || '[]');
      const users = JSON.parse(localStorage.getItem('nv_users') || '[]');
      const transactions: Transaction[] = JSON.parse(localStorage.getItem('nv_transactions') || '[]');
      
      const totalRevenue = transactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
          totalNovels: novels.length,
          totalChapters: chapters.length,
          totalUsers: users.length,
          totalRevenue
      };
  },

  // --- Comments ---
  getComments: (chapterId: string): Comment[] => {
      const allComments = JSON.parse(localStorage.getItem('nv_comments') || '[]');
      return allComments.slice(0, 8); 
  },

  createComment: (chapterId: string, userId: string, username: string, content: string) => {
      const comments = JSON.parse(localStorage.getItem('nv_comments') || '[]');
      const newComment: Comment = {
          id: `cmt_${Date.now()}`,
          chapterId,
          userId,
          username,
          content,
          likes: 0,
          createdAt: new Date().toISOString(),
          avatarColor: 'bg-indigo-500'
      };
      comments.unshift(newComment);
      localStorage.setItem('nv_comments', JSON.stringify(comments));
      return newComment;
  },

  // --- Frontend Settings ---
  getSiteSettings: (): SiteSettings => {
      return JSON.parse(localStorage.getItem('nv_site_settings') || JSON.stringify(DEFAULT_SITE_SETTINGS));
  },

  updateSiteSettings: (settings: SiteSettings) => {
      localStorage.setItem('nv_site_settings', JSON.stringify(settings));
  }
};
