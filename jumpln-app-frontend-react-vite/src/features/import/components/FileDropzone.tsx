import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';

export interface FileDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  selectedFile,
  onFileSelect,
  onFileRemove,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setErrorMessage(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setErrorMessage('Định dạng tệp không hợp lệ. Vui lòng chỉ chọn tệp Excel đuôi .xlsx');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Dung lượng tệp vượt quá giới hạn 5 MB. Vui lòng chọn tệp nhỏ hơn.');
      return;
    }

    if (file.size === 0) {
      setErrorMessage('Tệp Excel đã chọn bị rỗng (0 bytes). Vui lòng kiểm tra lại.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {errorMessage && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div className="alert-content">{errorMessage}</div>
        </div>
      )}

      {selectedFile ? (
        // File selected card
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#f8fafc',
            border: '2px solid #bfdbfe',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#dbeafe',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileSpreadsheet size={28} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--color-text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={selectedFile.name}
              >
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Dung lượng: {formatFileSize(selectedFile.size)} · Định dạng: Excel Workbook (.xlsx)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Đổi tệp khác
            </Button>
            <button
              type="button"
              onClick={onFileRemove}
              disabled={disabled}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-error)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Xóa tệp"
              aria-label="Xóa tệp"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        // Dropzone area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '3rem 2rem',
            border: `2px dashed ${isDragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: isDragOver ? 'var(--color-primary-light)' : '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isDragOver ? '#dbeafe' : 'var(--color-surface)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <UploadCloud size={32} />
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.375rem' }}>
            Kéo thả tệp Excel vào đây, hoặc <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>bấm để chọn</span>
          </h3>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '420px' }}>
            Hỗ trợ định dạng <strong>.xlsx</strong> (tối đa 5 MB). Dữ liệu sinh viên được đọc từ dòng 3 của sheet đầu tiên.
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Sample download banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={18} style={{ color: 'var(--color-success)' }} />
          <span>Bạn chưa có biểu mẫu chuẩn? Hãy tải tệp Excel mẫu để điền thông tin.</span>
        </div>

        <a
          href="/sample-students.xlsx"
          download="mau_danh_sach_sinh_vien.xlsx"
          className="btn btn-outline btn-sm"
          style={{ textDecoration: 'none' }}
        >
          <Download size={14} />
          <span>Tải tệp mẫu</span>
        </a>
      </div>
    </div>
  );
};
