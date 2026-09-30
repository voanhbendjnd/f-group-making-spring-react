import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(at 50% 0%, #eff6ff 0%, #f8fafc 75%)',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px', margin: '0 auto' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
              marginBottom: '0.875rem',
            }}
          >
            F
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            F-Group Making
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Hệ thống phân nhóm & quản lý học tập
          </p>
        </div>

        <Outlet />

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
          © 2026 F-Group Making · Hệ thống bảo mật FPT University
        </div>
      </div>
    </div>
  );
};
