import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, Send } from 'lucide-react';
import { authApi } from '@/features/auth/api/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authApi.requestPasswordReset({ email: email.trim() });
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra lại email và thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <Mail size={24} />
        </div>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Quên mật khẩu?
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          Nhập email đăng ký tài khoản của bạn để nhận liên kết đặt lại mật khẩu
        </p>
      </div>

      {isSubmitted ? (
        <div style={{ textAlign: 'center' }}>
          <div
            className="alert alert-success"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}
          >
            <CheckCircle2 size={24} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
            <div className="alert-content">
              <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#166534' }}>
                Đã tiếp nhận yêu cầu!
              </strong>
              <span style={{ fontSize: '0.875rem', color: '#15803d', lineHeight: 1.5 }}>
                Nếu email <strong>{email}</strong> tồn tại trong hệ thống và đã được kích hoạt, một liên kết đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn. Vui lòng kiểm tra hòm thư (kể cả mục Spam).
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Liên kết có hiệu lực trong vòng 24 giờ. Vì lý do bảo mật, mỗi yêu cầu gửi lại cách nhau tối thiểu 1 phút.
          </p>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="outline" icon={<ArrowLeft size={16} />} style={{ width: '100%' }}>
              Quay lại Đăng nhập
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {errorMessage && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="alert-content">{errorMessage}</div>
            </div>
          )}

          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="ví dụ: student@fpt.edu.vn"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!email.trim() || isSubmitting}
            icon={<Send size={18} />}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            Gửi liên kết đặt lại
          </Button>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={16} /> Quay lại trang Đăng nhập
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
