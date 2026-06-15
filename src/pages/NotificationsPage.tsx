import { Bell, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Order Shipped", message: "Your order #ORD-1234 has been shipped.", type: "order", read: false, date: new Date() },
    { id: 2, title: "Price Drop Alert", message: "A product in your wishlist is on sale!", type: "alert", read: true, date: new Date(Date.now() - 86400000) },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="container-premium py-8 lg:py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8" /> Notifications
        </h1>
        <button onClick={markAllRead} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-border bg-card text-muted-foreground">
            You have no notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`p-5 rounded-2xl border transition-colors flex gap-4 ${n.read ? 'border-border bg-card' : 'border-foreground/20 bg-foreground/5'}`}>
              <div className="mt-1">
                {n.read ? <CheckCircle2 className="h-5 w-5 text-muted-foreground" /> : <div className="h-2.5 w-2.5 mt-1.5 rounded-full bg-foreground animate-pulse-subtle" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">{formatDistanceToNow(n.date, { addSuffix: true })}</p>
              </div>
              <button onClick={() => deleteNotification(n.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 h-fit rounded-lg hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
