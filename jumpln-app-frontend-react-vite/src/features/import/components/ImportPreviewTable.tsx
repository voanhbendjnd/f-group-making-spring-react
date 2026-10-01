import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ParsedStudentRow } from '../types';

export interface ImportPreviewTableProps {
  rows: ParsedStudentRow[];
  validCount: number;
  invalidCount: number;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  rows,
  validCount,
  invalidCount,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'valid' | 'invalid'>('all');
  const [previewLimit, setPreviewLimit] = useState<number>(10);

  const filteredRows = rows.filter((row) => {
    if (filterType === 'valid') return row.isValid;
    if (filterType === 'invalid') return !row.isValid;
    return true;
  });

  const displayedRows = filteredRows.slice(0, previewLimit);
  const hasMore = filteredRows.length > previewLimit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Metrics overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)' }}>Tổng số dòng dữ liệu</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            {rows.length}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#f0fdf4',
            borderColor: '#bbf7d0',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: '#166534' }}>Dòng hợp lệ sẵn sàng nhập</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {validCount}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: invalidCount > 0 ? '#fef2f2' : 'var(--color-surface)',
            borderColor: invalidCount > 0 ? '#fecaca' : 'var(--color-border)',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: invalidCount > 0 ? 'var(--color-error)' : 'var(--color-text-subtle)' }}>
            Dòng phát hiện lỗi
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: invalidCount > 0 ? 'var(--color-error)' : 'var(--color-text-muted)',
            }}
          >
            {invalidCount}
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Xem trước dữ liệu:</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`btn btn-sm ${filterType === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontWeight: filterType === 'all' ? 700 : 500 }}
            >
              Tất cả ({rows.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('valid')}
              className={`btn btn-sm ${filterType === 'valid' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontWeight: filterType === 'valid' ? 700 : 500 }}
            >
              Hợp lệ ({validCount})
            </button>
            {invalidCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterType('invalid')}
                className={`btn btn-sm ${filterType === 'invalid' ? 'btn-danger' : 'btn-ghost'}`}
                style={{ fontWeight: filterType === 'invalid' ? 700 : 500 }}
              >
                Có lỗi ({invalidCount})
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Đang hiển thị {displayedRows.length} / {filteredRows.length} dòng
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Dòng</th>
              <th>Mã sinh viên</th>
              <th>Họ và tên</th>
              <th>Ngành</th>
              <th>Mã thành viên</th>
              <th>Email</th>
              <th>Kiểm tra</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row) => (
              <tr key={row.rowNumber} style={!row.isValid ? { backgroundColor: '#fffbfa' } : undefined}>
                <td style={{ fontWeight: 600, color: 'var(--color-text-subtle)' }}>
                  #{row.rowNumber}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {row.rollNumber || '—'}
                </td>
                <td>{row.fullName || '—'}</td>
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
                    {row.extractedMajorCode || row.originalMajor || '—'}
                  </span>
                </td>
                <td style={{ color: 'var(--color-text-subtle)', fontSize: '0.8125rem' }}>
                  {row.memberCode || '—'}
                </td>
                <td>{row.email || '—'}</td>
                <td>
                  {row.isValid ? (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Hợp lệ
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="badge badge-error">
                        <AlertTriangle size={12} /> Phát hiện lỗi
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>
                        {row.validationErrors.join(', ')}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setPreviewLimit((prev) => prev + 20)}
          >
            Hiển thị thêm 20 dòng tiếp theo...
          </button>
        </div>
      )}
    </div>
  );
};
