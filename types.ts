export interface ReadingHistoryItem {
  novelId: string;
  chapterId: string;
  lastReadAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Added password field
  role: 'user' | 'admin';
  coins: number;
  avatar?: string;
  bookmarks: string[]; // Novel IDs
  purchasedChapters: string[]; // Chapter IDs
  readingHistory: ReadingHistoryItem[]; 
  xp?: number;
  cultivationRank?: string;
}

export interface Novel {
  id: string;
  title: string;
  slug?: string;
  author: string;
  description: string;
  coverUrl: string;
  tags: string[];
  category: 'Original' | 'Fanfic' | 'Translation';
  status: 'Ongoing' | 'Completed';
  views: number;
  rating: number;
  updatedAt: string;
  isWeeklyFeatured?: boolean;
  offerPrice?: number; // Optional offer price (e.g. for bulk buy or promo)
  isFree?: boolean; // If true, overrides chapter paid status
}

export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  content: string; // HTML or Markdown
  volume: string; // New field for volume grouping
  order: number;
  isPaid: boolean;
  price: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase';
  description: string;
  date: string;
}

export interface Comment {
  id: string;
  chapterId?: string;
  novelId?: string;
  userId: string;
  username: string;
  content: string;
  likes: number;
  rating?: number;
  createdAt: string;
  avatarColor?: string; 
  paragraphId?: string;
}

export interface SiteSettings {
  showHero: boolean;
  showWeeklyFeatured: boolean;
  showRankings: boolean;
  showRising: boolean;
  showTags: boolean;
  showPromo: boolean;
  enablePayments: boolean;
  showDemoCredentials: boolean;
  showChapterSummary: boolean; // New setting
  enableTTS: boolean; // New setting for Text-to-Speech
  theme?: string;
}