import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCcw, Users, Mail } from 'lucide-react';
import { Button } from '@/components/common/Button';

export interface ImportSuccessSummaryProps {
  totalImported: number;
  onReset: () => void;
}

export const ImportSuccessSummary: React.FC<ImportSuccessSummaryProps> = ({
  totalImported,
  onReset,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '640px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#f0fdf4',
          color: 'var(--color-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 12px rgba(21, 128, 61, 0.2)',
        }}
      >
        <CheckCircle2 size={40} />
      </div>

      <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
        Nhập thành công {totalImported} sinh viên!
      </h2>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
        Hệ thống đã tạo hồ sơ sinh viên và tài khoản người dùng tương ứng với quyền sinh viên (ROLE_STUDENT).
        Các tài khoản hiện đang ở trạng thái <strong>Chờ kích hoạt</strong>.
      </p>

      {/* Workflow next step guide */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#eff6ff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #bfdbfe',
          padding: '1.25rem',
          textAlign: 'left',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.375rem' }}>
          <Mail size={18} />
          <span>Bước tiếp theo cần thực hiện</span>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.5 }}>
          Chuyển sang màn hình <strong>Danh sách sinh viên</strong>, chọn sinh viên hoặc chọn toàn bộ theo bộ lọc rồi bấm <strong>"Gửi email kích hoạt"</strong> để các bạn có thể tự thiết lập mật khẩu và đăng nhập.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
        <Button
          variant="secondary"
          icon={<RotateCcw size={16} />}
          onClick={onReset}
        >
          Nhập thêm tệp khác
        </Button>

        <Button
          variant="primary"
          icon={<Users size={16} />}
          onClick={() => navigate('/admin/students')}
        >
          Xem danh sách sinh viên & Gửi email
        </Button>
      </div>
    </div>
  );
};
