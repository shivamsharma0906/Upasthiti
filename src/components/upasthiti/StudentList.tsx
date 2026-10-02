import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  year: string;
  attendancePercentage: number;
}

export const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRealStudents = async () => {
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
              rollNo: 'Not assigned yet',
              name: u.name,
              department: 'General',
              year: 'Not assigned yet',
              attendancePercentage: 0,
            }));
          if (isMounted) setStudents(studentList);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRealStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  const departments = ['all', ...Array.from(new Set(students.map(s => s.department)))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const groupedStudents = filteredStudents.reduce((acc, student) => {
    if (!acc[student.department]) {
      acc[student.department] = [];
    }
    acc[student.department].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Student List</h2>
        <Badge variant="secondary" className="ml-2">
          {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Student Groups */}
      <div className="space-y-6">
        {Object.entries(groupedStudents).map(([department, departmentStudents]) => (
          <Card key={department}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {department}
                <Badge variant="outline">{departmentStudents.length} students</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium text-muted-foreground">Roll No</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Year</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-sm">{student.rollNo}</td>
                        <td className="p-2 font-medium">{student.name}</td>
                        <td className="p-2 text-muted-foreground">{student.year}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-24">
                              <Progress 
                                value={student.attendancePercentage} 
                                className="h-2"
                              />
                            </div>
                            <span className={`text-sm font-medium ${getAttendanceColor(student.attendancePercentage)}`}>
                              {student.attendancePercentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Students Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedDepartment !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No registered students in the system.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};