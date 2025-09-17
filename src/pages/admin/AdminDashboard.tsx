import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Shield,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export const AdminDashboard = () => {
  const pendingApprovals = [
    { id: 1, name: 'Dr. Emily Carter', email: 'emily.carter@email.com', subject: 'Biology', appliedDate: '2024-01-10' },
    { id: 2, name: 'Prof. David Brown', email: 'david.brown@email.com', subject: 'Mathematics', appliedDate: '2024-01-09' },
    { id: 3, name: 'Ms. Lisa Garcia', email: 'lisa.garcia@email.com', subject: 'Chemistry', appliedDate: '2024-01-08' },
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'Server maintenance scheduled for tonight', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'New student registrations: 15 this week', time: '4 hours ago' },
    { id: 3, type: 'success', message: 'Backup completed successfully', time: '6 hours ago' },
  ];

  const recentActivities = [
    { id: 1, action: 'New student enrolled', user: 'Alex Johnson', time: '10 minutes ago', type: 'student' },
    { id: 2, action: 'Teacher approved', user: 'Sarah Wilson', time: '1 hour ago', type: 'teacher' },
    { id: 3, action: 'Class created', user: 'Mathematics 101', time: '2 hours ago', type: 'class' },
    { id: 4, action: 'System backup', user: 'System', time: '6 hours ago', type: 'system' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-primary-foreground/80">Monitor and manage your education system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value="1,247"
          icon={GraduationCap}
          description="Active enrollments"
          trend={5.2}
          variant="primary"
        />
        <StatsCard
          title="Active Teachers"
          value="89"
          icon={Users}
          description="3 pending approval"
          variant="success"
        />
        <StatsCard
          title="Classes"
          value="156"
          icon={BookOpen}
          description="Across all departments"
          variant="primary"
        />
        <StatsCard
          title="System Health"
          value="98.5%"
          icon={Shield}
          description="Uptime this month"
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Teacher Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              Teacher applications awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="flex-1">
                  <h4 className="font-medium">{teacher.name}</h4>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                  <p className="text-xs text-muted-foreground">{teacher.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-success hover:bg-success/10">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              View All Applications
            </Button>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Important system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="w-2 h-2 rounded-full mt-2 bg-current flex-shrink-0" 
                     style={{ 
                       color: alert.type === 'warning' ? 'hsl(var(--warning))' 
                            : alert.type === 'success' ? 'hsl(var(--success))' 
                            : 'hsl(var(--primary))' 
                     }} 
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              View All Alerts
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest system activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {activity.type === 'student' && <GraduationCap className="w-4 h-4 text-primary" />}
                  {activity.type === 'teacher' && <Users className="w-4 h-4 text-primary" />}
                  {activity.type === 'class' && <BookOpen className="w-4 h-4 text-primary" />}
                  {activity.type === 'system' && <Shield className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              View Activity Log
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Management Tools</CardTitle>
            <CardDescription>
              Administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline">
              <GraduationCap className="w-4 h-4" />
              Manage Students
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Users className="w-4 h-4" />
              Manage Teachers
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <BookOpen className="w-4 h-4" />
              Create Classes
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Shield className="w-4 h-4" />
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};