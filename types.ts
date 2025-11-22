
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  coins: number;
  avatar?: string;
  bookmarks: string[]; // Novel IDs
  purchasedChapters: string[]; // Chapter IDs
}

export interface Novel {
  id: string;
  title: string;
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
