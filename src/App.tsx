import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Login } from "./pages/Login";
import ManualEntry from "./pages/ManualEntry";
import FaceRecognition from "./pages/FaceRecognition";
import QrScanner from "./pages/qr-scanner";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { UpasthitiDashboard } from "./pages/teacher/UpasthitiDashboard";
import { Schedule as UpasthitiSchedule } from "./components/upasthiti/Schedule";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import Students from "./pages/teacher/Students";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute roles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
            </Route>
            
            {/* Teacher Routes */}
            <Route path="/teacher" element={
              <ProtectedRoute roles={['teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<TeacherDashboard />} />
              <Route path="students" element={<Students />} />
            </Route>
            
            <Route path="/teacher/upasthiti" element={
              <ProtectedRoute roles={['teacher']}>
                <UpasthitiDashboard />
              </ProtectedRoute>
            } />

            {/* Attendance flows */}
            <Route path="/manual-entry" element={
              <ProtectedRoute roles={['teacher']}>
                <ManualEntry />
              </ProtectedRoute>
            } />
            <Route path="/face-recognition" element={
              <ProtectedRoute roles={['teacher']}>
                <FaceRecognition />
              </ProtectedRoute>
            } />
            <Route path="/qr-scanner" element={
              <ProtectedRoute roles={['teacher','student']}>
                <QrScanner />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
