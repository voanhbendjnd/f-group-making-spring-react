import React from 'react';
import { CheckCircle2, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Xin chào, ${user?.name || 'Sinh viên'}!`}
        description="Chào mừng bạn đến với Cổng thông tin F-Group Making. Tài khoản của bạn đã sẵn sàng tham gia xếp nhóm môn học."
      />

      {/* Account Status Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#dcfce7',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={30} />
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#166534' }}>
            Tài khoản đã kích hoạt & Xác thực thành công
          </div>
          <div style={{ fontSize: '0.875rem', color: '#15803d', marginTop: '2px' }}>
            Email đăng ký: <strong>{user?.email}</strong> · Quyền hạn: Sinh viên (ROLE_STUDENT)
          </div>
        </div>
      </div>

      {/* F-Group Making Information Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#eff6ff',
                color: 'var(--color-primary)',
              }}
            >
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem' }}>Tính năng Xếp nhóm F-Group</h3>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Hệ thống đang chuẩn bị mở cổng đăng ký và phân nhóm dự án cho các lớp chuyên ngành trong học kỳ này.
            Bạn sẽ nhận được thông báo qua email ngay khi giảng viên phụ trách mở đợt xếp nhóm.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef3c7',
                color: '#b45309',
              }}
            >
              <Calendar size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem' }}>Lịch trình dự kiến</h3>
          </div>

          <ul
            style={{
              paddingLeft: '1.25rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <li>
              <strong>Tuần 1 - 2:</strong> Hoàn tất kích hoạt tài khoản sinh viên toàn khóa.
            </li>
            <li>
              <strong>Tuần 3:</strong> Mở cổng đăng ký đề tài và ghép đội ngũ sinh viên.
            </li>
            <li>
              <strong>Tuần 4:</strong> Giảng viên công bố danh sách nhóm chính thức.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
