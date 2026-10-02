import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  AlertCircle, 
  RefreshCw, 
  Tag, 
  ShieldAlert, 
  Info,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  publishedDate: string;
  author: string;
  authorRole: string;
  priority: 'urgent' | 'important' | 'general';
  category: string;
  program?: string;
  semester?: string;
  section?: string;
}

export const Announcements: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'important' | 'general'>('all');

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/announcements`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user?.id]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch = 
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase());

      const matchesPriority = priorityFilter === 'all' || a.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [announcements, search, priorityFilter]);

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
            <span>Learning</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Announcements</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-primary" />
            Institutional Announcements & Circulars
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Official department notices, examination schedules, and university notifications for your academic group.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnnouncements}
            disabled={isLoading}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. SEARCH & PRIORITY FILTER */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars by keyword, category, or author..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <span className="text-xs text-muted-foreground font-medium mr-1 hidden sm:inline">Priority:</span>
          {(['all', 'urgent', 'important', 'general'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none border capitalize",
                priorityFilter === p
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTENT AREA: LOADING / REAL ANNOUNCEMENTS / EMPTY STATE */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-xs animate-pulse space-y-3">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-5 w-64 bg-muted rounded" />
              <div className="h-12 bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center shadow-xs space-y-3">
          <Megaphone className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            No official announcements posted for your academic group yet.
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            When university leadership, department heads, or your course faculty issue circulars relevant to {user?.program || 'your degree'} ({user?.section || 'your section'}), they will appear here.
          </p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-xs text-xs text-muted-foreground space-y-1">
          <Search className="h-7 w-7 text-muted-foreground/40 mx-auto mb-1" />
          <p className="font-semibold text-foreground">No circulars match your search or filter.</p>
          <p>Try resetting the priority filter or clearing your search term.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAnnouncements.map((announcement) => {
            const isUrgent = announcement.priority === 'urgent';
            const isImportant = announcement.priority === 'important';

            return (
              <div
                key={announcement.id}
                className={cn(
                  "bg-card border rounded-xl p-5 shadow-xs transition-all space-y-3",
                  isUrgent 
                    ? "border-rose-300 dark:border-rose-900 bg-rose-50/15" 
                    : isImportant 
                    ? "border-amber-300 dark:border-amber-900 bg-amber-50/15" 
                    : "border-border hover:border-border/90"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isUrgent ? (
                      <Badge variant="destructive" className="text-[10px] font-mono uppercase font-bold">
                        <ShieldAlert className="h-3 w-3 mr-1" /> Urgent Notice
                      </Badge>
                    ) : isImportant ? (
                      <Badge variant="outline" className="text-[10px] font-mono border-amber-400 text-amber-700 dark:text-amber-300 font-bold">
                        Important
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        General
                      </Badge>
                    )}

                    <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {announcement.category}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{announcement.publishedDate}</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground">
                    {announcement.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {announcement.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <UserIcon className="h-3 w-3 text-primary" />
                    <span>Issued by: <span className="font-semibold text-foreground/80">{announcement.author}</span> ({announcement.authorRole})</span>
                  </span>

                  {(announcement.program || announcement.section) && (
                    <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
                      Target: {announcement.program} {announcement.section && `• Sec ${announcement.section}`}
                    </span>
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

export default Announcements;
