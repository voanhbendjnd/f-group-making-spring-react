import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { studentApi } from '../api/studentApi';
import type { Student } from '../types';

export interface SingleActivationModalProps {
  open: boolean;
  student: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SingleActivationModal: React.FC<SingleActivationModalProps> = ({
  open,
  student,
  onClose,
  onSuccess,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open || !student) return null;

  const handleSend = async () => {
    setIsSending(true);
    setErrorMsg(null);
    try {
      await studentApi.sendSingleActivation(student.userId, student.email);
      setIsSuccess(true);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi email kích hoạt. Vui lòng thử lại sau.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={isSending ? () => {} : handleClose}
      title={isSuccess ? 'Đã gửi email thành công' : 'Gửi email kích hoạt tài khoản'}
      footer={
        isSuccess ? (
          <Button variant="primary" onClick={handleClose}>
            Đóng
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose} disabled={isSending}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              loading={isSending}
              icon={<Send size={16} />}
            >
              Gửi email kích hoạt
            </Button>
          </>
        )
      }
    >
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#f0fdf4',
              color: 'var(--color-success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
            Yêu cầu đã được tiếp nhận
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Hệ thống đã gửi liên kết kích hoạt tài khoản đến địa chỉ <strong>{student.email}</strong>.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="alert-content">{errorMsg}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Xác nhận gửi email cho sinh viên
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Hệ thống sẽ cấp mã kích hoạt mới và gửi thư đến email của sinh viên này.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1rem',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div>
              Họ và tên: <strong>{student.fullName}</strong>
            </div>
            <div>
              Mã sinh viên: <strong>{student.rollNumber}</strong>
            </div>
            <div>
              Email nhận thư: <strong>{student.email}</strong>
            </div>
          </div>

          {student.hasActivationKey && !student.activated && (
            <p style={{ fontSize: '0.8125rem', color: '#b45309' }}>
              * Lưu ý: Sinh viên này đã từng được gửi mã kích hoạt trước đó. Gửi lại sẽ tạo một mã mới và vô hiệu hóa mã cũ.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};
