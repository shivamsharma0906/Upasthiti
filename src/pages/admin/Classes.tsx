import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Users, 
  Video, 
  Trash2 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ClassItem {
  id: string;
  name: string;
  department: string;
  instructor: string;
  schedule: string;
  studentsCount: number;
}

export const Classes = () => {
  const [classes, setClasses] = useState<ClassItem[]>([
    { id: '1', name: 'Mathematics 101', department: 'Science', instructor: 'Prof. David Brown', schedule: 'Mon, Wed (09:00 AM - 10:30 AM)', studentsCount: 45 },
    { id: '2', name: 'Physics Labs', department: 'Science', instructor: 'Dr. Emily Carter', schedule: 'Tue, Thu (11:00 AM - 12:30 PM)', studentsCount: 38 },
    { id: '3', name: 'Organic Chemistry', department: 'Science', instructor: 'Ms. Lisa Garcia', schedule: 'Wed, Fri (01:00 PM - 02:30 PM)', studentsCount: 42 },
    { id: '4', name: 'English Hamlet Study', department: 'Humanities', instructor: 'Prof. Sarah Wilson', schedule: 'Mon, Fri (10:00 AM - 11:30 AM)', studentsCount: 30 },
  ]);

  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newInst, setNewInst] = useState('');
  const [newSched, setNewSched] = useState('');

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDept || !newInst || !newSched) {
      toast({
        title: "Missing Fields",
        description: "Please populate all class specifications.",
        variant: "destructive"
      });
      return;
    }

    const newClass: ClassItem = {
      id: Date.now().toString(),
      name: newName,
      department: newDept,
      instructor: newInst,
      schedule: newSched,
      studentsCount: 0
    };

    setClasses([...classes, newClass]);
    setNewName('');
    setNewDept('');
    setNewInst('');
    setNewSched('');

    toast({
      title: "Class Registered",
      description: `Course "${newClass.name}" successfully created.`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    setClasses(classes.filter(c => c.id !== id));
    toast({
      title: "Class Deleted",
      description: `Removed "${name}" from scheduling directory.`,
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">Academic Course Offerings & Timetable</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Administer institutional course sections, room allotments, and instructor mappings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Table / List */}
        <div className="lg:col-span-2 space-y-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900">{cls.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {cls.department}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground font-medium">
                    <p className="flex items-center gap-1.5 text-gray-700">
                      <Users className="h-3.5 w-3.5 text-primary" /> Instructor: <span className="font-semibold">{cls.instructor}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Schedule: {cls.schedule}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5" /> Enrolled: {cls.studentsCount} Students
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id, cls.name)} className="text-destructive hover:bg-destructive/10 self-end sm:self-center">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Class Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" /> Create Class
              </CardTitle>
              <CardDescription>Setup a new course offering</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Class Name</label>
                  <Input 
                    placeholder="e.g. Mathematics 101" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Department</label>
                  <Input 
                    placeholder="e.g. Science" 
                    value={newDept} 
                    onChange={(e) => setNewDept(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Instructor Name</label>
                  <Input 
                    placeholder="Prof. David Brown" 
                    value={newInst} 
                    onChange={(e) => setNewInst(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Timetable Schedule</label>
                  <Input 
                    placeholder="e.g. Mon, Wed (09:00 AM - 10:30 AM)" 
                    value={newSched} 
                    onChange={(e) => setNewSched(e.target.value)} 
                    required
                  />
                </div>
                <Button type="submit" className="w-full mt-2 gap-2">
                  <Plus className="h-4 w-4" /> Create Course
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
