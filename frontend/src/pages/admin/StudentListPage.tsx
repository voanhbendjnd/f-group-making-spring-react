import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Upload, Users } from 'lucide-react';
import { studentApi } from '@/features/students/api/studentApi';
import type { Student, StudentFilterParams } from '@/features/students/types';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { StudentFilterBar } from '@/features/students/components/StudentFilterBar';
import { BulkActionToolbar } from '@/features/students/components/BulkActionToolbar';
import { StudentTable } from '@/features/students/components/StudentTable';
import { BatchActivationModal } from '@/features/students/components/BatchActivationModal';
import { SingleActivationModal } from '@/features/students/components/SingleActivationModal';

export const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters state
  const [filters, setFilters] = useState<StudentFilterParams>({
    page: 1,
    size: 10,
    search: '',
    majorCode: '',
  });

  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isAllMatchingSelected, setIsAllMatchingSelected] = useState<boolean>(false);

  // Modal states
  const [singleStudentModal, setSingleStudentModal] = useState<Student | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Fetch students via TanStack Query with keepPreviousData for smooth pagination/search
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentApi.getStudents(filters),
    placeholderData: keepPreviousData,
  });

  const students = data?.result || [];
  const meta = data?.meta || { page: filters.page || 1, pageSize: filters.size || 10, pages: 1, total: 0 };

  // Calculate selection stats on current page
  const selectedStudents = students.filter((s) => selectedUserIds.includes(s.userId));
  const activeInSelected = selectedStudents.filter((s) => s.activated).length;
  const eligibleSelectedCount = selectedStudents.length - activeInSelected;

  // Selection handlers
  const handleToggleSelect = (userId: number) => {
    setIsAllMatchingSelected(false);
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAllPage = () => {
    setIsAllMatchingSelected(false);
    const currentPageIds = students.map((s) => s.userId);
    const allSelected = currentPageIds.every((id) => selectedUserIds.includes(id));

    if (allSelected) {
      // Unselect all on current page
      setSelectedUserIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleSelectAllMatching = () => {
    setIsAllMatchingSelected(true);
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
    setIsAllMatchingSelected(false);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setFilters((prev) => ({ ...prev, size: newSize, page: 1 }));
    setSelectedUserIds([]);
    setIsAllMatchingSelected(false);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      size: 10,
      search: '',
      majorCode: '',
      activated: undefined,
      hasActivationKey: undefined,
    });
    handleClearSelection();
  };

  const handleActivationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['students'] });
    handleClearSelection();
  };

  return (
    <div>
      <PageHeader
        title="Quản lý sinh viên"
        description="Xem danh sách sinh viên, lọc hồ sơ, và gửi email kích hoạt tài khoản một cách dễ dàng."
        action={
          <Button
            variant="primary"
            icon={<Upload size={16} />}
            onClick={() => navigate('/admin/students/import')}
          >
            Nhập sinh viên từ Excel
          </Button>
        }
      />

      {/* Filter Bar */}
      <StudentFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        isLoading={isFetching}
      />

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedUserIds.length}
        totalFilteredCount={meta.total}
        isAllMatchingSelected={isAllMatchingSelected}
        eligibleCount={eligibleSelectedCount}
        onSelectAllMatching={handleSelectAllMatching}
        onClearSelection={handleClearSelection}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
      />

      {/* Content States */}
      {isLoading && !data ? (
        <LoadingSpinner message="Đang tải danh sách sinh viên..." />
      ) : isError ? (
        <ErrorState
          title="Không thể tải danh sách sinh viên"
          message={(error as any)?.message || 'Vui lòng kiểm tra lại kết nối đến máy chủ.'}
          onRetry={() => refetch()}
        />
      ) : students.length === 0 ? (
        <EmptyState
          title="Không có sinh viên nào"
          description={
            filters.search || filters.majorCode || filters.activated !== undefined
              ? 'Không có kết quả nào phù hợp với bộ lọc hiện tại của bạn. Thử xóa bớt bộ lọc để tìm lại.'
              : 'Chưa có sinh viên nào trong hệ thống. Hãy bắt đầu bằng cách nhập danh sách từ tệp Excel.'
          }
          icon={<Users size={32} />}
          actionText={
            filters.search || filters.majorCode || filters.activated !== undefined
              ? 'Xóa bộ lọc'
              : 'Nhập sinh viên từ Excel'
          }
          onAction={
            filters.search || filters.majorCode || filters.activated !== undefined
              ? handleResetFilters
              : () => navigate('/admin/students/import')
          }
        />
      ) : (
        <div style={{ opacity: isFetching ? 0.65 : 1, transition: 'opacity 0.2s ease-in-out' }}>
          <StudentTable
            students={students}
            selectedUserIds={selectedUserIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAllPage={handleToggleSelectAllPage}
            onSendSingle={(student) => setSingleStudentModal(student)}
            isLoading={isFetching}
          />

          <Pagination
            meta={meta}
            currentPage={filters.page || 1}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* Modals */}
      <BatchActivationModal
        open={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={handleActivationSuccess}
        userIds={selectedUserIds}
        totalSelected={selectedUserIds.length}
        alreadyActiveCount={activeInSelected}
        isAllMatching={isAllMatchingSelected}
        filters={filters}
        totalFilteredCount={meta.total}
      />

      <SingleActivationModal
        open={Boolean(singleStudentModal)}
        student={singleStudentModal}
        onClose={() => setSingleStudentModal(null)}
        onSuccess={handleActivationSuccess}
      />
    </div>
  );
};
