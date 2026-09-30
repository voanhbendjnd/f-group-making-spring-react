import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { studentApi } from '../api/studentApi';
import type { BatchActivationResult, StudentFilterParams } from '../types';

export interface BatchActivationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Either a list of userIds selected
  userIds: number[];
  totalSelected: number;
  alreadyActiveCount: number;
  // Or sending all matching
  isAllMatching: boolean;
  filters: StudentFilterParams;
  totalFilteredCount: number;
}

export const BatchActivationModal: React.FC<BatchActivationModalProps> = ({
  open,
  onClose,
  onSuccess,
  userIds,
  totalSelected,
  alreadyActiveCount,
  isAllMatching,
  filters,
  totalFilteredCount,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<BatchActivationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const eligibleCount = isAllMatching
    ? totalFilteredCount
    : Math.max(0, totalSelected - alreadyActiveCount);

  const handleSend = async () => {
    setIsSending(true);
    setErrorMsg(null);

    try {
      let res: BatchActivationResult;
      if (isAllMatching) {
        res = await studentApi.sendActivateAllMatching(filters.search, filters.majorCode);
      } else {
        res = await studentApi.sendBatchActivation(userIds);
      }

      setResult(res);
      try {
        confetti({ particleCount: 75, spread: 60 });
      } catch {
        // ignore
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi email kích hoạt hàng loạt. Vui lòng thử lại sau.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setErrorMsg(null);
    onClose();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={isSending ? () => {} : handleClose}
      title={result ? 'Kết quả gửi email kích hoạt' : 'Xác nhận gửi email kích hoạt hàng loạt'}
      maxWidth="580px"
      footer={
        result ? (
          <Button variant="primary" onClick={handleClose}>
            Hoàn tất & Đóng
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose} disabled={isSending}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              loading={isSending}
              icon={<Send size={16} />}
              disabled={eligibleCount === 0}
            >
              Gửi {eligibleCount} thư kích hoạt
            </Button>
          </>
        )
      }
    >
      {result ? (
        // Results View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#dcfce7',
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
              <h4 style={{ color: '#166534', fontWeight: 700, fontSize: '1.125rem' }}>
                Yêu cầu đã được tiếp nhận thành công
              </h4>
              <p style={{ color: '#15803d', fontSize: '0.875rem', marginTop: '2px' }}>
                Hệ thống đã sinh khóa kích hoạt và đang tiến hành gửi email đến các sinh viên.
              </p>
            </div>
          </div>

          {/* Metrics summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              textAlign: 'center',
            }}
          >
            <div style={{ padding: '0.875rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>Tổng yêu cầu</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {result.totalRequested}
              </div>
            </div>

            <div style={{ padding: '0.875rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Đã gửi thành công</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>
                {result.totalProcessed}
              </div>
            </div>

            <div style={{ padding: '0.875rem', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Bỏ qua (đã active)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-warning)' }}>
                {result.totalSkippedAlreadyActive}
              </div>
            </div>
          </div>

          {/* List of sent emails */}
          {result.sentEmails && result.sentEmails.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Danh sách email sinh viên nhận thư ({result.sentEmails.length}):
              </div>
              <div
                style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--color-surface-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                }}
              >
                {result.sentEmails.map((email, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-success)' }}>✓</span>
                    <span>{email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Confirmation View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="alert-content">{errorMsg}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
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
                flexShrink: 0,
              }}
            >
              <Mail size={24} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {isAllMatching
                  ? `Gửi thư kích hoạt cho toàn bộ ${totalFilteredCount} sinh viên theo bộ lọc`
                  : `Gửi thư kích hoạt cho ${eligibleCount} sinh viên được chọn`}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Hệ thống sẽ tạo mã kích hoạt bảo mật và tự động gửi email hướng dẫn tạo mật khẩu đến từng sinh viên.
              </p>
            </div>
          </div>

          {/* Breakdown Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Tổng số sinh viên được chọn:</span>
              <strong style={{ color: 'var(--color-text-main)' }}>
                {isAllMatching ? totalFilteredCount : totalSelected}
              </strong>
            </div>

            {!isAllMatching && alreadyActiveCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-warning)' }}>
                <span>Đã kích hoạt trước đó (tự động loại trừ):</span>
                <strong>- {alreadyActiveCount}</strong>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--color-border)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: 'var(--color-primary)',
              }}
            >
              <span>Số email kích hoạt sẽ được gửi:</span>
              <span>{eligibleCount} email</span>
            </div>
          </div>

          {eligibleCount === 0 && (
            <div className="alert alert-warning" style={{ margin: 0 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                Tất cả các sinh viên được chọn đều đã kích hoạt tài khoản. Không có email nào cần gửi.
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
