import React from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useNavigate } from 'react-router-dom';

export interface TopNavbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              color: 'var(--color-text-main)',
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-xs)',
            }}
            title={isSidebarCollapsed ? 'Mở thanh điều hướng bên trái' : 'Thu gọn thanh điều hướng bên trái'}
            aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
          >
            <Menu size={20} />
          </button>
        )}

        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {isAdmin ? (
            <span>
              Hệ thống Quản lý Sinh viên & Xếp nhóm · <strong style={{ color: 'var(--color-text-main)' }}>Học kỳ Fall 2026</strong>
            </span>
          ) : (
            <span>
              Cổng thông tin sinh viên · <strong style={{ color: 'var(--color-text-main)' }}>F-Group Making</strong>
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <UserIcon size={16} style={{ color: 'var(--color-text-subtle)' }} />
          <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
            {user?.name || user?.email}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ gap: '0.375rem' }}
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};
