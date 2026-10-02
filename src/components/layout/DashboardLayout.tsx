import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Operational Navigation */}
        <Header />

        {/* Scrollable Content Canvas */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 pb-20 md:pb-8 focus:outline-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Mobile-First Bottom Action Navigation */}
      <MobileNav />
    </div>
  );
};