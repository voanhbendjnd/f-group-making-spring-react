import React from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

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
  const { t } = useTranslation();

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
            title={isSidebarCollapsed ? t('nav.toggleSidebarOpen') : t('nav.toggleSidebarCollapse')}
            aria-label={t('nav.toggleSidebarOpen')}
          >
            <Menu size={20} />
          </button>
        )}

        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {isAdmin ? (
            <span>{t('nav.adminSubtitle')}</span>
          ) : (
            <span>{t('nav.studentSubtitle')}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <LanguageSwitcher size="sm" />

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
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </header>
  );
};
