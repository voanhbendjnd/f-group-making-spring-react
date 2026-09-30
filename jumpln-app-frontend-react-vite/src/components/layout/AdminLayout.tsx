import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 900) {
      setMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('sidebar_collapsed', String(next));
        } catch {
          // ignore localStorage errors
        }
        return next;
      });
    }
  };

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="main-content">
        <TopNavbar
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
