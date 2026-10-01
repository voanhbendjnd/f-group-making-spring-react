import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, KeyRound, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { activationApi } from '@/features/activation/api/activationApi';
import type { ActivationKeyVerifyResult } from '@/features/activation/types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const ActivateAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read key from either ?key= or ?token=
  const key = searchParams.get('key') || searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [verifyResult, setVerifyResult] = useState<ActivationKeyVerifyResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isActivatedSuccess, setIsActivatedSuccess] = useState(false);

  // Step 1: Verify activation key on mount
  useEffect(() => {
    if (!key || !key.trim()) {
      setIsVerifying(false);
      setVerifyError('Đường dẫn kích hoạt thiếu mã xác thực. Vui lòng kiểm tra lại liên kết trong email của bạn.');
      return;
    }

    let isMounted = true;
    activationApi
      .verifyKey(key.trim())
      .then((res) => {
        if (isMounted) {
          setVerifyResult(res);
          setIsVerifying(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setVerifyError(
            err.message ||
              'Liên kết kích hoạt không hợp lệ, đã hết hạn hoặc tài khoản đã được kích hoạt trước đó.'
          );
          setIsVerifying(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [key]);

  // Validation rules
  const hasMinLength = password.length >= 4;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && passwordsMatch;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !key) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await activationApi.activateAccount({
        key: key.trim(),
        password,
      });

      setIsActivatedSuccess(true);
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore confetti if not supported
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Không thể kích hoạt tài khoản. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Verifying key
  if (isVerifying) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <LoadingSpinner message="Đang kiểm tra liên kết kích hoạt của bạn..." />
      </div>
    );
  }

  // State 2: Key is invalid / expired / missing
  if (verifyError || !verifyResult) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
          Liên kết không hợp lệ hoặc đã hết hạn
        </h2>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          {verifyError}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Đến trang Đăng nhập
          </Button>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)' }}>
            Nếu bạn chưa kích hoạt được, vui lòng liên hệ Quản trị viên để được cấp liên kết mới.
          </div>
        </div>
      </div>
    );
  }

  // State 3: Account Activated Successfully
  if (isActivatedSuccess) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <CheckCircle2 size={36} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
          Kích hoạt tài khoản thành công!
        </h2>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Chúc mừng <strong style={{ color: 'var(--color-text-main)' }}>{verifyResult.name || verifyResult.email}</strong>!
          Tài khoản sinh viên của bạn đã sẵn sàng. Bạn có thể đăng nhập ngay bằng mật khẩu vừa tạo.
        </p>

        <Button
          variant="primary"
          size="lg"
          icon={<ArrowRight size={18} />}
          onClick={() => navigate('/login')}
          style={{ width: '100%' }}
        >
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  // State 4: Set password form
  return (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <KeyRound size={24} />
        </div>

        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Kích hoạt tài khoản
        </h2>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          Xin chào <strong style={{ color: 'var(--color-text-main)' }}>{verifyResult.name || 'Sinh viên'}</strong> ({verifyResult.email})
        </p>
      </div>

      {submitError && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div className="alert-content">{submitError}</div>
        </div>
      )}

      <form onSubmit={handleActivate}>
        <Input
          label="Tạo mật khẩu mới"
          type="password"
          placeholder="Nhập mật khẩu mới của bạn"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu vừa tạo"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Requirements checklist */}
        <div
          style={{
            margin: '0.5rem 0 1.5rem',
            padding: '0.875rem 1rem',
            backgroundColor: 'var(--color-surface-muted)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '2px' }}>
            Yêu cầu mật khẩu:
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: hasMinLength ? 'var(--color-success)' : 'var(--color-text-muted)',
              fontWeight: hasMinLength ? 600 : 400,
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: hasMinLength ? 'var(--color-success-bg)' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hasMinLength ? <Check size={12} /> : null}
            </div>
            <span>Mật khẩu có ít nhất 4 ký tự</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: passwordsMatch ? 'var(--color-success)' : 'var(--color-text-muted)',
              fontWeight: passwordsMatch ? 600 : 400,
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: passwordsMatch ? 'var(--color-success-bg)' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {passwordsMatch ? <Check size={12} /> : null}
            </div>
            <span>Mật khẩu xác nhận trùng khớp</span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isFormValid}
          icon={<ShieldCheck size={18} />}
          style={{ width: '100%' }}
        >
          Hoàn tất kích hoạt tài khoản
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <Link to="/login" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Đã có mật khẩu? Đăng nhập tại đây
        </Link>
      </div>
    </div>
  );
};
