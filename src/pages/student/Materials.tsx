import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Download, 
  FileText, 
  Video, 
  FileArchive, 
  ExternalLink,
  RefreshCw,
  User as UserIcon,
  Calendar,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface CourseMaterialItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'video' | 'zip' | 'document' | 'link';
  fileSize?: string;
  faculty: string;
  publicationDate: string;
  program: string;
  semester: string;
  section: string;
}

export const Materials: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState<CourseMaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch(`${API_BASE}/materials`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    } catch (err) {
      console.error('Failed to load course materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [user?.id]);

  const uniqueSubjects = useMemo(() => {
    const list = Array.from(new Set(materials.map(m => m.subject).filter(Boolean)));
    return ['ALL', ...list];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = 
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.faculty.toLowerCase().includes(search.toLowerCase());

      const matchesSubject = selectedSubject === 'ALL' || m.subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [materials, search, selectedSubject]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
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
            <span className="text-foreground font-semibold">Course Materials</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-primary" />
            Institutional Course Materials & Resources
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authorized lecture notes, laboratory manuals, and reading documents published by your faculty.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMaterials}
            disabled={isLoading}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. SEARCH & SUBJECT FILTER CONTROLS */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by material title, topic, or faculty..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {uniqueSubjects.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {uniqueSubjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none border whitespace-nowrap",
                  selectedSubject === sub
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                )}
              >
                {sub === 'ALL' ? 'All Subjects' : sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. CONTENT AREA: LOADING / REAL MATERIALS / EMPTY STATE */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-xs animate-pulse space-y-3">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-10 bg-muted/40 rounded-lg" />
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center shadow-xs space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            No course materials have been published yet.
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Authorized lecture presentations, laboratory guidelines, and textbook references for {user?.program || 'your enrolled courses'} will appear here once uploaded by your professors.
          </p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-xs text-xs text-muted-foreground space-y-1">
          <Search className="h-7 w-7 text-muted-foreground/40 mx-auto mb-1" />
          <p className="font-semibold text-foreground">No course materials match your search.</p>
          <p>Try clearing your search query or switching subject filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-card border border-border rounded-xl p-5 shadow-xs transition-all hover:border-primary/40 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {material.subject}
                  </span>

                  <Badge variant="outline" className="text-[10px] font-mono uppercase">
                    {material.fileType}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-foreground leading-snug">
                  {material.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {material.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5 text-muted-foreground text-[11px]">
                  <p className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    <span className="truncate">{material.faculty}</span>
                  </p>
                  <p className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar className="h-3 w-3" />
                    <span>{material.publicationDate}</span>
                  </p>
                </div>

                {material.fileUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(material.fileUrl, '_blank')}
                    className="h-8 text-xs font-medium gap-1 text-primary"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Access</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Materials;
