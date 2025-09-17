import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Video
} from 'lucide-react';

export const StudentDashboard = () => {
  const upcomingAssignments = [
    { id: 1, title: 'Math Assignment #3', subject: 'Mathematics', dueDate: '2024-01-15', status: 'pending' },
    { id: 2, title: 'Physics Lab Report', subject: 'Physics', dueDate: '2024-01-18', status: 'pending' },
    { id: 3, title: 'English Essay', subject: 'English', dueDate: '2024-01-20', status: 'submitted' },
  ];

  const recentMaterials = [
    { id: 1, title: 'Calculus Chapter 5', subject: 'Mathematics', type: 'pdf', date: '2024-01-10' },
    { id: 2, title: 'Chemistry Experiments', subject: 'Chemistry', type: 'video', date: '2024-01-09' },
    { id: 3, title: 'History Timeline', subject: 'History', type: 'pdf', date: '2024-01-08' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Alex!</h1>
        <p className="text-primary-foreground/80">Ready to continue your learning journey?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Assignments"
          value="12"
          icon={FileText}
          description="3 pending submission"
          variant="primary"
        />
        <StatsCard
          title="Attendance"
          value="94%"
          icon={Calendar}
          description="This semester"
          variant="success"
        />
        <StatsCard
          title="Course Progress"
          value="78%"
          icon={BookOpen}
          description="Across all subjects"
          variant="primary"
        />
        <StatsCard
          title="Grade Average"
          value="85.2"
          icon={TrendingUp}
          description="+2.3 from last month"
          trend={2.3}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upcoming Assignments
            </CardTitle>
            <CardDescription>
              Assignments due soon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex-1">
                  <h4 className="font-medium">{assignment.title}</h4>
                  <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {assignment.status === 'submitted' ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-warning" />
                    )}
                    <span className="text-sm">{assignment.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              View All Assignments
            </Button>
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Attendance Overview
            </CardTitle>
            <CardDescription>
              Your attendance progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Mathematics</span>
                <span className="text-sm text-muted-foreground">18/20</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Physics</span>
                <span className="text-sm text-muted-foreground">16/18</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Chemistry</span>
                <span className="text-sm text-muted-foreground">19/20</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>

            <Button className="w-full" variant="outline">
              View Detailed Attendance
            </Button>
          </CardContent>
        </Card>

        {/* Recent Learning Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recent Materials
            </CardTitle>
            <CardDescription>
              Recently added study materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMaterials.map((material) => (
              <div key={material.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {material.type === 'video' ? (
                    <Video className="w-5 h-5 text-primary" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{material.title}</h4>
                  <p className="text-xs text-muted-foreground">{material.subject}</p>
                </div>
                <span className="text-xs text-muted-foreground">{material.date}</span>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              Browse All Materials
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Video className="w-4 h-4" />
              Join Live Class
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <FileText className="w-4 h-4" />
              Submit Assignment
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <BookOpen className="w-4 h-4" />
              Download Materials
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <TrendingUp className="w-4 h-4" />
              View Performance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};