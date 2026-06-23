import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    window.dispatchEvent(new Event('resize'));
  }, [isCollapsed]);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors duration-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

