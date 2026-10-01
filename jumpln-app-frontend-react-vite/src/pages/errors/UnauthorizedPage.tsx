import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/app/providers/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isStudent, isAdmin } = useAuth();

  const handleGoHome = () => {
    if (isAdmin) navigate('/admin/dashboard');
    else if (isStudent) navigate('/student/dashboard');
    else navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <ShieldAlert size={40} />
      </div>

      <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem', color: 'var(--color-error)' }}>
        Không đủ quyền truy cập
      </h1>
      <p style={{ maxWidth: '460px', color: 'var(--color-text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
        Tài khoản của bạn không được phân quyền để truy cập vào khu vực này. Nếu bạn cho rằng đây là một sự nhầm lẫn, vui lòng liên hệ Quản trị viên.
      </p>

      <Button variant="primary" onClick={handleGoHome}>
        Quay lại trang chính
      </Button>
    </div>
  );
};
