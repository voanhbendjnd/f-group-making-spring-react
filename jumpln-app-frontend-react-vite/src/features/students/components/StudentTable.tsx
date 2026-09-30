import React from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/common/Button';
import type { Student } from '../types';

export interface StudentTableProps {
  students: Student[];
  selectedUserIds: number[];
  onToggleSelect: (userId: number) => void;
  onToggleSelectAllPage: () => void;
  onSendSingle: (student: Student) => void;
  isLoading?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedUserIds,
  onToggleSelect,
  onToggleSelectAllPage,
  onSendSingle,
  isLoading,
}) => {
  const isAllPageSelected =
    students.length > 0 && students.every((s) => selectedUserIds.includes(s.userId));
  const isSomePageSelected =
    students.some((s) => selectedUserIds.includes(s.userId)) && !isAllPageSelected;

  return (
    <div className="table-container">
      <table className="table" aria-label="Danh sách sinh viên">
        <thead>
          <tr>
            <th style={{ width: '48px', textAlign: 'center' }}>
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomePageSelected;
                  }}
                  onChange={onToggleSelectAllPage}
                  disabled={isLoading || students.length === 0}
                  aria-label="Chọn tất cả sinh viên trên trang này"
                />
              </label>
            </th>
            <th>Mã sinh viên</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Ngành</th>
            <th>Mã thành viên</th>
            <th>Trạng thái tài khoản</th>
            <th style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const isSelected = selectedUserIds.includes(student.userId);

            return (
              <tr key={student.userId} className={isSelected ? 'is-selected' : ''}>
                <td style={{ textAlign: 'center' }}>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(student.userId)}
                      aria-label={`Chọn sinh viên ${student.fullName}`}
                    />
                  </label>
                </td>

                <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {student.rollNumber}
                </td>

                <td style={{ fontWeight: 500 }}>{student.fullName}</td>

                <td style={{ color: 'var(--color-text-muted)' }}>{student.email}</td>

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
                    {student.majorCode || 'N/A'}
                  </span>
                </td>

                <td style={{ color: 'var(--color-text-subtle)', fontSize: '0.8125rem' }}>
                  {student.memberCode}
                </td>

                <td>
                  <StatusBadge
                    activated={student.activated}
                    hasActivationKey={student.hasActivationKey}
                    isKeyExpired={student.isKeyExpired}
                  />
                </td>

                <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                  {student.activated ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-subtle)',
                        fontWeight: 500,
                      }}
                      title="Tài khoản đã kích hoạt — không cần gửi lại thư mời"
                    >
                      <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                      Đã kích hoạt
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Mail size={14} />}
                      onClick={() => onSendSingle(student)}
                    >
                      {student.hasActivationKey ? 'Gửi lại thư' : 'Gửi kích hoạt'}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
