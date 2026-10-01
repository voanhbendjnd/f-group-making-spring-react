import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Info, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { LoginRequest } from '../types';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setFormError(null);
    try {
      await login(data);
      // Determine redirection based on target or user role
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        // AuthContext updates synchronously from localStorage
        const stored = localStorage.getItem('f_group_auth_user');
        const user = stored ? JSON.parse(stored) : null;
        if (user?.authorities?.includes('ROLE_ADMIN')) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.');
    }
  };

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Đăng nhập hệ thống
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          Nhập thông tin tài khoản được cấp để tiếp tục
        </p>
      </div>

      {formError && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div className="alert-content">{formError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Địa chỉ Email"
          type="email"
          placeholder="ví dụ: an@fpt.edu.vn hoặc admin@djnd.tech"
          required
          autoComplete="username"
          autoFocus
          error={errors.username?.message}
          {...register('username', {
            required: 'Vui lòng nhập địa chỉ email của bạn',
            pattern: {
              value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
              message: 'Địa chỉ email không đúng định dạng',
            },
          })}
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Vui lòng nhập mật khẩu',
            minLength: {
              value: 4,
              message: 'Mật khẩu tối thiểu 4 ký tự',
            },
          })}
        />

        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          icon={<LogIn size={18} />}
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          Đăng nhập
        </Button>
      </form>

      {/* Notice regarding no public registration */}
      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: '0.625rem',
          alignItems: 'flex-start',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
          backgroundColor: 'var(--color-surface-muted)',
          padding: '0.875rem',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--color-text-main)' }}>Chưa có tài khoản?</strong>
          <br />
          Tài khoản sinh viên do Quản trị viên cấp qua thư kích hoạt. Hệ thống không cho phép tự đăng ký tài khoản. Vui lòng kiểm tra hộp thư email hoặc liên hệ nhà trường.
        </div>
      </div>
    </div>
  );
};
