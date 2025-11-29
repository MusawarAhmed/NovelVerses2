import api from './api';
import { Novel, Chapter, User, Comment, Transaction } from '../types';

// Helper to map _id to id
const mapId = (item: any): any => {
    if (!item) return item;
    if (Array.isArray(item)) return item.map(mapId);
    if (typeof item === 'object' && item._id) {
        const { _id, ...rest } = item;
        return { id: _id, ...rest };
    }
    return item;
};

export const NovelService = {
    // Auth
    login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        return mapId(res.data.user);
    },
    signup: async (username, email, password) => {
        const res = await api.post('/auth/register', { username, email, password });
        localStorage.setItem('token', res.data.token);
        return mapId(res.data.user);
    },
    loadUser: async () => {
        const res = await api.get('/auth/user');
        return mapId(res.data);
    },
    logout: () => {
        localStorage.removeItem('token');
    },

    // Novels
    getNovels: async (params?: { limit?: number, skip?: number, category?: string, sort?: string, status?: string, search?: string }): Promise<Novel[]> => {
        const query = new URLSearchParams(params as any).toString();
        const res = await api.get(`/novels?${query}`);
        return mapId(res.data);
    },
    getNovelById: async (id: string): Promise<Novel> => {
        const res = await api.get(`/novels/${id}`);
        return mapId(res.data);
    },
    
    // Chapters
    getChapters: async (novelId: string): Promise<Chapter[]> => {
        const res = await api.get(`/chapters/novel/${novelId}`);
        return mapId(res.data);
    },
    getChapter: async (id: string): Promise<Chapter> => {
        const res = await api.get(`/chapters/${id}`);
        return mapId(res.data);
    },

    // User Actions
    purchaseChapter: async (chapterId: string) => {
        const res = await api.post(`/users/purchase/${chapterId}`);
        return res.data;
    },
    toggleBookmark: async (novelId: string) => {
        const res = await api.post(`/users/bookmark/${novelId}`);
        return res.data; // Returns updated bookmarks array
    },
    updateProfile: async (data: any) => {
        const res = await api.put('/users/profile', data);
        return mapId(res.data);
    },
    addCoins: async (amount: number) => {
        const res = await api.post('/users/add-coins', { amount });
        return res.data;
    },
    saveReadingHistory: async (novelId: string, chapterId: string) => {
        const res = await api.post('/users/history', { novelId, chapterId });
        return res.data;
    },
    getTransactions: async (): Promise<Transaction[]> => {
        const res = await api.get('/users/transactions');
        return mapId(res.data);
    },

    // Comments
    getComments: async (chapterId: string): Promise<Comment[]> => {
        const res = await api.get(`/comments/chapter/${chapterId}`);
        return mapId(res.data);
    },
    getNovelReviews: async (novelId: string): Promise<Comment[]> => {
        const res = await api.get(`/comments/novel/${novelId}`);
        return mapId(res.data);
    },
    createComment: async (chapterId: string, userId: string, username: string, content: string, paragraphId?: string) => {
        // Note: userId is taken from token in backend, but we keep signature compatible if needed or just pass payload
        const res = await api.post('/comments', { chapterId, content, username, paragraphId });
        return mapId(res.data);
    },
    createReview: async (novelId: string, content: string, rating: number) => {
        const res = await api.post('/comments', { novelId, content, rating });
        return mapId(res.data);
    },

    // Admin / CRUD
    createNovel: async (data: any) => {
        const res = await api.post('/novels', data);
        return mapId(res.data);
    },
    updateNovel: async (id: string, data: any) => {
        const res = await api.put(`/novels/${id}`, data);
        return mapId(res.data);
    },
    deleteNovel: async (id: string) => {
        const res = await api.delete(`/novels/${id}`);
        return res.data;
    },
    createChapter: async (data: any) => {
        const res = await api.post('/chapters', data);
        return mapId(res.data);
    },
    updateChapter: async (id: string, data: any) => {
        const res = await api.put(`/chapters/${id}`, data);
        return mapId(res.data);
    },
    deleteChapter: async (id: string) => {
        const res = await api.delete(`/chapters/${id}`);
        return res.data;
    },

    // Admin Stats & Users
    getStats: async () => {
        const res = await api.get('/admin/stats');
        return res.data;
    },
    getAllUsers: async (): Promise<User[]> => {
        const res = await api.get('/users');
        return mapId(res.data);
    },
    updateSiteSettings: async (settings: any) => {
        const res = await api.put('/admin/settings', settings);
        return res.data;
    },

    createUser: async (userData: any) => {
        const res = await api.post('/users', userData);
        return mapId(res.data);
    },

    getSiteSettings: async (): Promise<any> => {
        try {
            const res = await api.get('/admin/settings');
            return res.data;
        } catch (e) {
            return {
                showHero: true,
                showWeeklyFeatured: true,
                showRankings: true,
                showRising: true,
                showTags: true,
                showPromo: true,
                enablePayments: true,
                showDemoCredentials: true,
                showChapterSummary: true,
                enableTTS: true,
                theme: 'default',
            };
        }
    },

    // Helpers for Home Page (Client-side filtering for now)
    getWeeklyFeatured: async (limit?: number): Promise<Novel[]> => {
        const novels = await NovelService.getNovels({ limit: 1000 });
        const featured = novels.filter(n => n.isWeeklyFeatured);
        const result = featured.length > 0 ? featured : novels.slice(0, 5);
        return limit ? result.slice(0, limit) : result;
    },

    getRankedNovels: async (type: 'Power' | 'Collection' | 'Active', limit?: number): Promise<Novel[]> => {
        const novels = await NovelService.getNovels({ limit: 1000 });
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

    getRisingStars: async (limit?: number): Promise<Novel[]> => {
        const novels = await NovelService.getNovels({ limit: 1000 });
        const rising = novels.filter(n => n.views < 50000 && n.rating >= 4.5);
        const result = rising.length > 0 ? rising : novels;
        return limit ? result.slice(0, limit) : result;
    },

    // Notifications
    getNotifications: async (limit = 20, skip = 0) => {
        const res = await api.get(`/notifications?limit=${limit}&skip=${skip}`);
        return mapId(res.data);
    },
    getUnreadCount: async () => {
        const res = await api.get('/notifications/unread-count');
        return res.data.count;
    },
    markNotificationAsRead: async (id: string) => {
        const res = await api.put(`/notifications/${id}/read`);
        return mapId(res.data);
    },
    markAllNotificationsAsRead: async () => {
        const res = await api.put('/notifications/read-all');
        return res.data;
    },
    deleteNotification: async (id: string) => {
        const res = await api.delete(`/notifications/${id}`);
        return res.data;
    },
    createAnnouncement: async (title: string, message: string, link?: string) => {
        const res = await api.post('/notifications/announcement', { title, message, link });
        return res.data;
    },

    // Init (Placeholder for compatibility, does nothing now)
    init: () => {},

    awardXP: async (amount: number) => {
        const res = await api.post('/users/xp', { amount });
        return res.data;
    }
};
