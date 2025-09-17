import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, Phone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AlertStudent {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  year: string;
  attendancePercentage: number;
  lastAttended: string;
  contactEmail: string;
  contactPhone: string;
}

const alertStudents: AlertStudent[] = [
  {
    id: '1',
    rollNo: 'EC2022046',
    name: 'Vikash Yadav',
    department: 'Electronics',
    year: '2nd Year',
    attendancePercentage: 45,
    lastAttended: '2024-01-10',
    contactEmail: 'vikash.yadav@college.edu',
    contactPhone: '+91 98765 43210'
  },
  {
    id: '2',
    rollNo: 'CS2021045',
    name: 'Anjali Sharma',
    department: 'Computer Science',
    year: '3rd Year',
    attendancePercentage: 42,
    lastAttended: '2024-01-08',
    contactEmail: 'anjali.sharma@college.edu',
    contactPhone: '+91 87654 32109'
  },
  {
    id: '3',
    rollNo: 'ME2020089',
    name: 'Rohit Kumar',
    department: 'Mechanical',
    year: '4th Year',
    attendancePercentage: 38,
    lastAttended: '2024-01-05',
    contactEmail: 'rohit.kumar@college.edu',
    contactPhone: '+91 76543 21098'
  }
];

export const AttendanceAlerts = () => {
  const handleSendEmail = (student: AlertStudent) => {
    toast({
      title: "Email Sent",
      description: `Attendance warning email sent to ${student.name}`,
    });
  };

  const handleCall = (student: AlertStudent) => {
    toast({
      title: "Call Initiated",
      description: `Calling ${student.name} at ${student.contactPhone}`,
    });
  };

  const getSeverityColor = (percentage: number) => {
    if (percentage < 30) return 'bg-destructive/20 border-destructive text-destructive-foreground';
    if (percentage < 40) return 'bg-warning/20 border-warning text-warning-foreground';
    return 'bg-orange-500/20 border-orange-500 text-orange-900 dark:text-orange-100';
  };

  const getSeverityLabel = (percentage: number) => {
    if (percentage < 30) return 'Critical';
    if (percentage < 40) return 'High';
    return 'Medium';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-destructive" />
        <h2 className="text-2xl font-bold text-foreground">Attendance Alerts</h2>
        <Badge variant="destructive" className="ml-2">
          {alertStudents.length} critical
        </Badge>
      </div>

      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h3 className="font-semibold text-destructive">Low Attendance Warning</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          The following students have attendance below 50% and require immediate attention.
        </p>
      </div>

      {alertStudents.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Attendance Alerts</h3>
              <p className="text-muted-foreground">All students are maintaining good attendance.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {alertStudents.map((student) => (
            <Card 
              key={student.id} 
              className={`border-2 ${getSeverityColor(student.attendancePercentage)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <div className="space-y-1 mt-2">
                      <div className="text-sm text-muted-foreground">
                        {student.department} • {student.year}
                      </div>
                      <div className="text-sm font-mono text-muted-foreground">
                        Roll No: {student.rollNo}
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {getSeverityLabel(student.attendancePercentage)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Attendance:</span>
                    <span className="text-lg font-bold text-destructive">
                      {student.attendancePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-destructive h-2 rounded-full transition-all duration-300"
                      style={{ width: `${student.attendancePercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last attended: {student.lastAttended}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-mono text-xs">{student.contactEmail}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-mono">{student.contactPhone}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleSendEmail(student)}
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button
                    onClick={() => handleCall(student)}
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};