import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// Type guard to ensure components are valid
const isValidComponent = (component: any): component is React.FC => {
  return typeof component === 'function' && component.prototype?.render === undefined;
};

// Fallback components
const FallbackSidebar: React.FC = () => <div className="w-64 bg-gray-200">Sidebar Placeholder</div>;
const FallbackHeader: React.FC = () => <div className="h-16 bg-gray-300">Header Placeholder</div>;

// Define DashboardLayout with children prop
export const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen flex bg-background">
      {isValidComponent(Sidebar) ? <Sidebar /> : <FallbackSidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isValidComponent(Header) ? <Header /> : <FallbackHeader />}
        <main className="flex-1 overflow-auto p-6 bg-muted/20">
          {children || <Outlet />} {/* Render children or Outlet as fallback */}
        </main>
      </div>
    </div>
  );
};