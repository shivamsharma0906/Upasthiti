import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  timestamp: number;
  isRead: boolean;
  link?: string;
}

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('ems_token');
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('ems_token');
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast({
        title: 'All Notifications Marked Read',
        description: 'Your notification center has been updated.',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <button 
              onClick={() => navigate('/student')} 
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-foreground font-semibold">Notification Center</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-primary" />
            Official Student Notifications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time updates regarding your attendance, academic notices, and institutional circulars.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-2 text-xs font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
              <span>Mark All Read</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNotifications}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. FILTER TABS */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none border",
              filter === 'all'
                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none border flex items-center gap-1.5",
              filter === 'unread'
                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
            )}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
          {user?.name} • {user?.rollNumber || 'Enrolled Student'}
        </span>
      </div>

      {/* 3. NOTIFICATION LIST / EMPTY STATE */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="bg-card border border-border rounded-xl p-4 shadow-xs animate-pulse space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted/60 rounded" />
            </div>
          ))}
        </div>
      ) : displayedNotifications.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center shadow-xs space-y-3">
          <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {filter === 'unread' 
              ? 'You are all caught up! All notifications have been read.'
              : 'Institutional circulars and real-time attendance alerts will appear here when issued.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedNotifications.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-card border rounded-xl p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3",
                  !item.isRead ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-border/80"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border",
                    item.type === 'alert' && "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900",
                    item.type === 'warning' && "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
                    item.type === 'success' && "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900",
                    item.type === 'info' && "bg-primary/10 text-primary border-primary/20"
                  )}>
                    {item.type === 'alert' && <AlertCircle className="h-4 w-4" />}
                    {item.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                    {item.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                    {item.type === 'info' && <Info className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "text-sm font-bold text-foreground",
                        !item.isRead && "font-extrabold"
                      )}>
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground pt-1">
                      <Clock className="h-3 w-3" />
                      <span>{timeStr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(item.link!)}
                      className="h-7 text-xs text-primary gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}

                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="text-[11px] text-muted-foreground hover:text-foreground hover:underline font-medium"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
