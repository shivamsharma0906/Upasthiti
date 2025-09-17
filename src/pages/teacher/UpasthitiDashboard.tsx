import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UpasthitiSidebar } from '@/components/upasthiti/UpasthitiSidebar';
import { PendingApprovals } from '@/components/upasthiti/PendingApprovals';
import { Schedule } from '@/components/upasthiti/Schedule';
import { StudentList } from '@/components/upasthiti/StudentList';
import { AttendanceAlerts } from '@/components/upasthiti/AttendanceAlerts';

export const UpasthitiDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialActive = params.get('active') || 'pending-approvals';
  const isModal = params.get('mode') === 'modal';

  const [activeSection, setActiveSection] = useState(initialActive);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'pending-approvals':
        return <PendingApprovals />;
      case 'schedule':
        return <Schedule />;
      case 'student-list':
        return <StudentList />;
      case 'attendance-alerts':
        return <AttendanceAlerts />;
      default:
        return <PendingApprovals />;
    }
  };

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-background border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Upasthiti</h1>
              <p className="text-sm text-muted-foreground">Attendance Management System</p>
            </div>
            <button className="text-sm px-3 py-1 border rounded" onClick={() => navigate(-1)}>Close</button>
          </div>
          <div className="p-4">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <UpasthitiSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Upasthiti</h1>
            <p className="text-muted-foreground">Attendance Management System</p>
          </div>
          
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};