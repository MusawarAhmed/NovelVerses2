import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { NovelService } from '../services/novelService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    type: 'new_chapter' | 'comment_reply' | 'system_announcement';
    title: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
    metadata?: {
        novelId?: string;
        novelTitle?: string;
        chapterId?: string;
        chapterTitle?: string;
    };
}

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const [notifs, count] = await Promise.all([
                NovelService.getNotifications(10, 0),
                NovelService.getUnreadCount()
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (!notification.isRead) {
                await NovelService.markNotificationAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => prev.map(n => 
                    n.id === notification.id ? { ...n, isRead: true } : n
                ));
            }
            setIsOpen(false);
            navigate(notification.link);
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            await NovelService.markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        try {
            await NovelService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            const deletedNotif = notifications.find(n => n.id === notificationId);
            if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_chapter':
                return '📖';
            case 'comment_reply':
                return '💬';
            case 'system_announcement':
                return '📢';
            default:
                return '🔔';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading || unreadCount === 0}
                                    className="text-xs text-primary hover:text-indigo-700 dark:hover:text-indigo-400 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCheck size={14} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                                            !notification.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-slate-500 dark:text-slate-500">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDelete(e, notification.id)}
                                                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center">
                                <button className="text-xs text-primary hover:text-indigo-700 dark:hover:text-indigo-400 font-medium">
                                    View All Notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
