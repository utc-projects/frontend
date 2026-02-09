import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const NotificationBell = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Socket listener
    useEffect(() => {
        if (!socket) return;

        socket.on('notification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Optional: Play sound or show browser notification here
        });

        return () => {
            socket.off('notification');
        };
    }, [socket]);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                title="Thông báo"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-700">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                            >
                                Đánh dấu đã đọc tất cả
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Không có thông báo mới</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id || Math.random()}
                                        className={`p-4 hover:bg-slate-50 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-800 leading-relaxed mb-1">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400">
                                                        {dayjs(notification.createdAt).fromNow()}
                                                    </span>
                                                    {notification.link && (
                                                        <Link
                                                            to={notification.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={() => {
                                                                if (!notification.isRead) markAsRead(notification._id);
                                                                setIsOpen(false);
                                                            }}
                                                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                                        >
                                                            Xem chi tiết <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="text-slate-400 hover:text-emerald-600 p-1 rounded-full hover:bg-emerald-50 transition-colors"
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
