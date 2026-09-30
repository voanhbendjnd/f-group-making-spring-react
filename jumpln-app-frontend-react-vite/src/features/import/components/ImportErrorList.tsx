import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ImportRowError } from '../types';

export interface ImportErrorListProps {
  errors: ImportRowError[];
}

export const ImportErrorList: React.FC<ImportErrorListProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  // Map English field names to Vietnamese
  const fieldNameMap: Record<string, string> = {
    rollNumber: 'Mã sinh viên',
    fullName: 'Họ và tên',
    originalMajor: 'Mã ngành',
    majorCode: 'Mã ngành',
    memberCode: 'Mã thành viên',
    email: 'Địa chỉ Email',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="alert alert-error" style={{ marginBottom: 0 }}>
        <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div className="alert-content">
          <div className="alert-title">
            Chưa có sinh viên nào được lưu ({errors.length} lỗi phát hiện bởi máy chủ)
          </div>
          <div>
            Theo nguyên tắc an toàn dữ liệu, hệ thống từ chối toàn bộ tệp khi có dòng bị lỗi.
            Vui lòng mở lại tệp Excel trên máy tính, sửa các dòng dưới đây và thực hiện nhập lại.
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Dòng Excel</th>
              <th style={{ width: '140px' }}>Mã SV (nếu có)</th>
              <th style={{ width: '150px' }}>Trường dữ liệu</th>
              <th>Chi tiết lỗi cần chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((err, idx) => (
              <tr key={idx} style={{ backgroundColor: '#fffbfa' }}>
                <td style={{ fontWeight: 700, color: 'var(--color-error)' }}>
                  Dòng {err.row}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {err.rollNumber || '—'}
                </td>
                <td>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-error-bg)',
                      color: 'var(--color-error)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                  >
                    {fieldNameMap[err.field] || err.field}
                  </span>
                </td>
                <td style={{ color: 'var(--color-text-main)' }}>
                  {err.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
