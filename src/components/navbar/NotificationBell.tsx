import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/utils/api";
import { motion } from "framer-motion";

interface Notification {
    id: number;
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
}

const NotificationBell = () => {
    const { isAuthenticated } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get<{data: {count: number}}>('/notifications/unread-count');
            setUnreadCount(res.data.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get<{data: {data: Notification[]}}>('/notifications');
            setNotifications(res.data.data.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/mark-read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative">
            <motion.button
                onClick={handleToggle}
                className="relative p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Notifications"
            >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-foreground rounded-full ring-2 ring-background animate-pulse-subtle" />
                )}
            </motion.button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden text-foreground">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-xs text-primary hover:underline">
                                View all
                            </Link>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No notifications yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 transition-colors hover:bg-muted/50 ${!n.read_at ? 'bg-muted/30' : ''}`}
                                            onClick={() => { if (!n.read_at) markAsRead(n.id) }}
                                        >
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <p className={`text-sm ${!n.read_at ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                                                {!n.read_at && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"></span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{n.body}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
