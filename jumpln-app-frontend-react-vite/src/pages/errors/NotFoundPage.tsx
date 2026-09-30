import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

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
          backgroundColor: 'var(--color-surface-muted)',
          color: 'var(--color-text-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <FileQuestion size={40} />
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404 - Không tìm thấy trang</h1>
      <p style={{ maxWidth: '460px', color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>
        Đường dẫn bạn vừa truy cập không tồn tại hoặc đã bị di chuyển sang một vị trí khác.
      </p>

      <Button variant="primary" onClick={() => navigate('/')}>
        Về trang chủ
      </Button>
    </div>
  );
};
