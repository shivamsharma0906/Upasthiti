import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole, isStudentProfileComplete } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  allowIncompleteProfile?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  roles, 
  allowIncompleteProfile = false 
}: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate portal based on user role
    const redirectPath = user.role === 'student' ? '/student' 
      : user.role === 'teacher' ? '/teacher' 
      : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  // Access Control: If student profile is incomplete, block dashboard access and redirect to /student/complete-profile
  if (user.role === 'student') {
    const isComplete = isStudentProfileComplete(user);
    if (!isComplete && !allowIncompleteProfile) {
      return <Navigate to="/student/complete-profile" replace />;
    }
  }

  return <>{children}</>;
};