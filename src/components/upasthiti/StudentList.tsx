import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  year: string;
  attendancePercentage: number;
}

const mockStudents: Student[] = [
  { id: '1', rollNo: 'CS2021001', name: 'Rahul Sharma', department: 'Computer Science', year: '3rd', attendancePercentage: 85 },
  { id: '2', rollNo: 'CS2021002', name: 'Priya Patel', department: 'Computer Science', year: '3rd', attendancePercentage: 92 },
  { id: '3', rollNo: 'CS2021003', name: 'Amit Kumar', department: 'Computer Science', year: '3rd', attendancePercentage: 78 },
  { id: '4', rollNo: 'EC2022045', name: 'Sneha Singh', department: 'Electronics', year: '2nd', attendancePercentage: 88 },
  { id: '5', rollNo: 'EC2022046', name: 'Vikash Yadav', department: 'Electronics', year: '2nd', attendancePercentage: 45 },
  { id: '6', rollNo: 'ME2020123', name: 'Arjun Reddy', department: 'Mechanical', year: '4th', attendancePercentage: 67 },
  { id: '7', rollNo: 'ME2020124', name: 'Deepika Sharma', department: 'Mechanical', year: '4th', attendancePercentage: 95 },
  { id: '8', rollNo: 'CE2021089', name: 'Ravi Kumar', department: 'Civil', year: '3rd', attendancePercentage: 82 },
];

export const StudentList = () => {
  const [students] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Student List</h2>
        <Badge variant="secondary" className="ml-2">
          {filteredStudents.length} students
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or roll number..."
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
                  : 'No students available.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};