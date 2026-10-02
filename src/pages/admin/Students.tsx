import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  Trash2, 
  Mail, 
  BookOpen, 
  Plus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  rollNumber: string;
  status: 'active' | 'suspended';
}

export const Students = () => {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newClass, setNewClass] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('ems_token');
        const res = await fetch(`${API_BASE}/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const studentList: Student[] = (data.users || [])
            .filter((u: any) => u.role === 'student')
            .map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              class: 'Not assigned yet',
              rollNumber: 'Not assigned yet',
              status: 'active' as const,
            }));
          if (isMounted) setStudents(studentList);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in the student details.",
        variant: "destructive",
      });
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail.toLowerCase(),
      class: newClass.trim() || 'Not assigned yet',
      rollNumber: 'Not assigned yet',
      status: 'active'
    };

    setStudents([...students, newStudent]);
    setNewName('');
    setNewEmail('');
    setNewClass('');

    toast({
      title: "Student Added",
      description: `Successfully enrolled ${newStudent.name}.`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    setStudents(students.filter(s => s.id !== id));
    toast({
      title: "Student Removed",
      description: `Successfully deleted ${name} from records.`,
      variant: "destructive"
    });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) || 
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">Student Directory & Enrollment</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage institutional student registrations, roll assignments, and enrollment credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students by name, email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-9"
            />
          </div>

          <div className="space-y-3">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold font-mono text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{student.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {student.class}</span>
                          <span>•</span>
                          <span className="font-mono">Roll: {student.rollNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border-0 ${student.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
                        {student.status}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id, student.name)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-12 border border-dashed rounded-2xl bg-muted/20">
                <p className="text-muted-foreground text-sm">
                  {students.length === 0 ? 'No students enrolled yet.' : 'No students found matching search filters.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Register Student */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-primary" /> Register Student
              </CardTitle>
              <CardDescription>Add a new student profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <Input 
                    placeholder="Enter full name" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="student@school.com" 
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Class / Section (Optional)</label>
                  <Input 
                    placeholder="e.g. Grade 10 - A" 
                    value={newClass} 
                    onChange={(e) => setNewClass(e.target.value)} 
                  />
                </div>
                <Button type="submit" className="w-full mt-2 gap-2">
                  <Plus className="h-4 w-4" /> Register Student
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
