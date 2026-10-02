import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Check, 
  X, 
  Mail, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: '1', name: 'Dr. Emily Carter', email: 'emily.carter@email.com', subject: 'Biology', appliedDate: '2026-07-10', status: 'pending' },
    { id: '2', name: 'Prof. David Brown', email: 'david.brown@email.com', subject: 'Mathematics', appliedDate: '2026-07-09', status: 'pending' },
    { id: '3', name: 'Ms. Lisa Garcia', email: 'lisa.garcia@email.com', subject: 'Chemistry', appliedDate: '2026-07-08', status: 'pending' },
    { id: '4', name: 'Prof. Sarah Wilson', email: 'sarah.wilson@email.com', subject: 'Physics', appliedDate: '2026-07-05', status: 'approved' },
    { id: '5', name: 'Dr. John Miller', email: 'john.miller@email.com', subject: 'Computer Science', appliedDate: '2026-07-01', status: 'rejected' },
  ]);

  const handleApprove = (id: string, name: string) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    toast({
      title: "Teacher Approved",
      description: `${name} has been approved as an official instructor.`,
    });
  };

  const handleReject = (id: string, name: string) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
    toast({
      title: "Application Rejected",
      description: `Rejected application of ${name}.`,
      variant: "destructive"
    });
  };

  const pending = teachers.filter(t => t.status === 'pending');
  const otherInstructors = teachers.filter(t => t.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">Faculty Directory & Onboarding</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Review instructor onboarding applications, course assignments, and departmental faculty.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" /> Pending Applications
            </CardTitle>
            <CardDescription>Instructor applications awaiting review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending.length > 0 ? (
              pending.map((teacher) => (
                <div key={teacher.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 bg-amber-50/10 hover:bg-amber-50/20 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {teacher.email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {teacher.subject}</p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(teacher.id, teacher.name)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(teacher.id, teacher.name)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/50 mb-2" />
                <p className="text-muted-foreground text-sm font-medium">All applications have been reviewed.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing Directory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Active Directory
            </CardTitle>
            <CardDescription>Official catalog of registered instructors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherInstructors.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {teacher.email}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {teacher.subject}</p>
                </div>
                <div>
                  {teacher.status === 'approved' ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-xs">
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 text-xs">
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
