import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/utils/api";

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
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
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
            <button
                onClick={handleToggle}
                className="flex items-center justify-center hover:bg-white/10 border border-transparent p-2 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer text-white relative focus-visible:outline-none"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

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
