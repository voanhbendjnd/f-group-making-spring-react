import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  CheckCircle2,
  Clock,
  Mail,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { studentApi } from '@/features/students/api/studentApi';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Query 1: Total students
  const totalQuery = useQuery({
    queryKey: ['students-count-total'],
    queryFn: () => studentApi.getStudents({ page: 1, size: 1 }),
  });

  // Query 2: Activated students
  const activatedQuery = useQuery({
    queryKey: ['students-count-activated'],
    queryFn: () => studentApi.getStudents({ page: 1, size: 1, activated: true }),
  });

  // Query 3: Waiting for activation
  const waitingQuery = useQuery({
    queryKey: ['students-count-waiting'],
    queryFn: () => studentApi.getStudents({ page: 1, size: 1, activated: false }),
  });

  // Query 4: Email sent waiting for student to activate
  const emailSentQuery = useQuery({
    queryKey: ['students-count-sent'],
    queryFn: () =>
      studentApi.getStudents({ page: 1, size: 1, activated: false, hasActivationKey: true }),
  });

  // Query 5: Recent students preview
  const recentQuery = useQuery({
    queryKey: ['students-recent'],
    queryFn: () => studentApi.getStudents({ page: 1, size: 5, sort: 'userId,desc' }),
  });

  const totalStudents = totalQuery.data?.meta?.total ?? 0;
  const activatedStudents = activatedQuery.data?.meta?.total ?? 0;
  const waitingStudents = waitingQuery.data?.meta?.total ?? 0;
  const emailSentStudents = emailSentQuery.data?.meta?.total ?? 0;
  const notSentStudents = Math.max(0, waitingStudents - emailSentStudents);

  const recentStudents = recentQuery.data?.result || [];
  const isLoading = totalQuery.isLoading || recentQuery.isLoading;

  return (
    <div>
      <PageHeader
        title="Tổng quan hệ thống"
        description="Theo dõi tình trạng nhập dữ liệu sinh viên, số lượng tài khoản và trạng thái kích hoạt thư mời."
        action={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              icon={<Users size={16} />}
              onClick={() => navigate('/admin/students')}
            >
              Danh sách sinh viên
            </Button>
            <Button
              variant="primary"
              icon={<Upload size={16} />}
              onClick={() => navigate('/admin/students/import')}
            >
              Nhập Excel mới
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total students */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#eff6ff',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Tổng số sinh viên
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '2px' }}>
              {isLoading ? '...' : totalStudents.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Activated */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#f0fdf4',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 500 }}>
              Đã kích hoạt thành công
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '2px' }}>
              {isLoading ? '...' : activatedStudents.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Email sent waiting for activation */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#f0f9ff',
              color: 'var(--color-info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Mail size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: 500 }}>
              Đã gửi thư chờ kích hoạt
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-info)', marginTop: '2px' }}>
              {isLoading ? '...' : emailSentStudents.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Not sent invitation yet */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#fffbeb',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#b45309', fontWeight: 500 }}>
              Chờ gửi thư mời
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '2px' }}>
              {isLoading ? '...' : notSentStudents.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', color: 'var(--color-primary)' }}>
                <Upload size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem' }}>Nhập sinh viên từ tệp Excel</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Tải danh sách sinh viên theo mẫu Excel .xlsx để tự động khởi tạo hồ sơ và cấp tài khoản chờ kích hoạt.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRight size={16} />}
              onClick={() => navigate('/admin/students/import')}
            >
              Bắt đầu nhập tệp
            </Button>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', color: 'var(--color-success)' }}>
                <Mail size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem' }}>Gửi thư kích hoạt tài khoản</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Lọc theo ngành, tìm kiếm sinh viên chưa kích hoạt và gửi email chứa liên kết thiết lập mật khẩu chỉ với một cú nhấp chuột.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRight size={16} />}
              onClick={() => navigate('/admin/students')}
            >
              Đến danh sách gửi thư
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Students Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Sinh viên mới cập nhật gần đây</h3>
            <p className="card-subtitle">5 hồ sơ sinh viên gần nhất trong cơ sở dữ liệu</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowRight size={16} />}
            onClick={() => navigate('/admin/students')}
          >
            Xem tất cả
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Đang tải dữ liệu gần đây..." />
        ) : recentStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            Chưa có sinh viên nào. Hãy bấm "Nhập Excel mới" để bắt đầu.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Mã sinh viên</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Ngành</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => (
                  <tr key={s.userId}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{s.rollNumber}</td>
                    <td style={{ fontWeight: 500 }}>{s.fullName}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{s.email}</td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-muted)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                        }}
                      >
                        {s.majorCode || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        activated={s.activated}
                        hasActivationKey={s.hasActivationKey}
                        isKeyExpired={s.isKeyExpired}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
