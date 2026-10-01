import React, { useState } from 'react';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FileDropzone } from '@/features/import/components/FileDropzone';
import { ImportPreviewTable } from '@/features/import/components/ImportPreviewTable';
import { ImportErrorList } from '@/features/import/components/ImportErrorList';
import { ImportSuccessSummary } from '@/features/import/components/ImportSuccessSummary';
import { parseExcelClientSide, type ParseExcelResult } from '@/features/import/utils/excelParser';
import { importApi } from '@/features/import/api/importApi';
import type { ImportResult } from '@/features/import/types';

export const StudentImportPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingClient, setIsParsingClient] = useState<boolean>(false);
  const [clientParseResult, setClientParseResult] = useState<ParseExcelResult | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverResult, setServerResult] = useState<ImportResult | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setServerResult(null);
    setGenericError(null);
    setIsParsingClient(true);

    try {
      const result = await parseExcelClientSide(file);
      setClientParseResult(result);
    } catch (err: any) {
      setGenericError(err.message || 'Không thể đọc tệp Excel đã chọn.');
      setClientParseResult(null);
    } finally {
      setIsParsingClient(false);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setClientParseResult(null);
    setServerResult(null);
    setGenericError(null);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setGenericError(null);

    try {
      const result = await importApi.importExcel(selectedFile);
      setServerResult(result);

      if (result.success) {
        try {
          confetti({ particleCount: 90, spread: 70 });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setGenericError(err.message || 'Quá trình nhập dữ liệu gặp sự cố. Vui lòng kiểm tra lại tệp và thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State: Successfully imported
  if (serverResult && serverResult.success) {
    return (
      <div>
        <PageHeader
          title="Kết quả nhập sinh viên"
          breadcrumbs={[
            { label: 'Quản trị', href: '/admin/dashboard' },
            { label: 'Danh sách sinh viên', href: '/admin/students' },
            { label: 'Nhập từ Excel' },
          ]}
        />
        <ImportSuccessSummary
          totalImported={serverResult.totalImported}
          onReset={handleFileRemove}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Nhập sinh viên từ Excel"
        description="Tải lên tệp Excel danh sách sinh viên để tạo hồ sơ và tài khoản chờ kích hoạt trong hệ thống."
        breadcrumbs={[
          { label: 'Quản trị', href: '/admin/dashboard' },
          { label: 'Danh sách sinh viên', href: '/admin/students' },
          { label: 'Nhập từ Excel' },
        ]}
        action={
          <Link to="/admin/students" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Quay lại danh sách</span>
          </Link>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Step 1: File Dropzone */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">1. Chọn tệp danh sách Excel</h3>
              <p className="card-subtitle">
                Hệ thống sẽ tự động kiểm tra định dạng và đọc dữ liệu từ dòng 3 trở đi
              </p>
            </div>
          </div>

          <FileDropzone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            disabled={isParsingClient || isSubmitting}
          />
        </div>

        {/* Parsing state */}
        {isParsingClient && (
          <div className="card" style={{ padding: '2rem' }}>
            <LoadingSpinner message="Đang đọc và phân tích cấu trúc tệp Excel..." />
          </div>
        )}

        {/* Generic or transport error */}
        {genericError && (
          <div className="alert alert-error">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div className="alert-content">{genericError}</div>
          </div>
        )}

        {/* Server Validation Errors (success = false) */}
        {serverResult && !serverResult.success && serverResult.errors && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'var(--color-error)' }}>
                Kết quả kiểm tra dữ liệu từ máy chủ
              </h3>
            </div>
            <ImportErrorList errors={serverResult.errors} />
          </div>
        )}

        {/* Step 2: Client Preview and Validation */}
        {clientParseResult && !serverResult?.success && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">2. Xem trước & Kiểm tra dữ liệu</h3>
                <p className="card-subtitle">
                  Rà soát thông tin sinh viên trước khi gửi lên máy chủ để tạo tài khoản
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleConfirmImport}
                loading={isSubmitting}
                icon={<Send size={16} />}
                disabled={clientParseResult.rows.length === 0}
              >
                Xác nhận nhập {clientParseResult.validCount} sinh viên
              </Button>
            </div>

            <ImportPreviewTable
              rows={clientParseResult.rows}
              validCount={clientParseResult.validCount}
              invalidCount={clientParseResult.invalidCount}
            />

            {/* Bottom confirmation action */}
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {clientParseResult.invalidCount > 0 ? (
                  <span style={{ color: 'var(--color-error)', fontWeight: 500 }}>
                    * Tệp có {clientParseResult.invalidCount} dòng chứa dữ liệu chưa hợp lệ. Backend áp dụng cơ chế "All-or-Nothing" (từ chối toàn bộ nếu có lỗi). Bạn nên sửa các dòng lỗi trước khi gửi.
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                    ✓ Tất cả {clientParseResult.validCount} dòng đều hợp lệ và sẵn sàng nhập.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={handleFileRemove} disabled={isSubmitting}>
                  Hủy bỏ
                </Button>

                <Button
                  variant="primary"
                  onClick={handleConfirmImport}
                  loading={isSubmitting}
                  icon={<Send size={16} />}
                  disabled={clientParseResult.rows.length === 0}
                >
                  Xác nhận nhập vào hệ thống
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
