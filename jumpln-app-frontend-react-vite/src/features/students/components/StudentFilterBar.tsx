import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StudentFilterParams } from '../types';

export interface StudentFilterBarProps {
  filters: StudentFilterParams;
  onFilterChange: (newFilters: StudentFilterParams) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const StudentFilterBar: React.FC<StudentFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  // Local state for smooth typing without lag or focus loss
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [majorCodeTerm, setMajorCodeTerm] = useState(filters.majorCode || '');

  // Synchronize when filters are modified from the outside (e.g. reset or clear)
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    setMajorCodeTerm(filters.majorCode || '');
  }, [filters.majorCode]);

  // Debounced search trigger (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchTerm.trim();
      if (trimmed !== (filters.search || '')) {
        onFilterChange({ ...filters, search: trimmed, page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounced majorCode trigger (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = majorCodeTerm.trim();
      if (trimmed !== (filters.majorCode || '')) {
        onFilterChange({ ...filters, majorCode: trimmed, page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [majorCodeTerm]);

  // Immediately apply on Enter without triggering page reload or form submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onFilterChange({
        ...filters,
        search: searchTerm.trim(),
        majorCode: majorCodeTerm.trim(),
        page: 1,
      });
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onFilterChange({ ...filters, search: '', page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let activated: boolean | undefined = undefined;
    if (val === 'activated') activated = true;
    if (val === 'unactivated') activated = false;

    onFilterChange({ ...filters, activated, page: 1 });
  };

  const handleKeyStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let hasActivationKey: boolean | undefined = undefined;
    if (val === 'sent') hasActivationKey = true;
    if (val === 'not_sent') hasActivationKey = false;

    onFilterChange({ ...filters, hasActivationKey, page: 1 });
  };

  const handleReset = () => {
    setSearchTerm('');
    setMajorCodeTerm('');
    onReset();
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(majorCodeTerm) ||
    Boolean(filters.search) ||
    Boolean(filters.majorCode) ||
    filters.activated !== undefined ||
    filters.hasActivationKey !== undefined;

  let currentStatusValue = 'all';
  if (filters.activated === true) currentStatusValue = 'activated';
  if (filters.activated === false) currentStatusValue = 'unactivated';

  let currentKeyValue = 'all';
  if (filters.hasActivationKey === true) currentKeyValue = 'sent';
  if (filters.hasActivationKey === false) currentKeyValue = 'not_sent';

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        marginBottom: '1.25rem',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Search input */}
        <div style={{ gridColumn: 'span 2', minWidth: '240px' }}>
          <label className="form-label" style={{ marginBottom: '0.375rem' }}>
            {t('students.searchLabel')}
          </label>
          <div style={{ position: 'relative' }}>
            {isLoading ? (
              <Loader2
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-primary)',
                  pointerEvents: 'none',
                  animation: 'spin 1s linear infinite',
                }}
              />
            ) : (
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-subtle)',
                  pointerEvents: 'none',
                }}
              />
            )}
            <input
              type="text"
              className="form-control"
              placeholder={t('students.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                paddingLeft: '2.5rem',
                paddingRight: searchTerm ? '2.25rem' : '0.875rem',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-subtle)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={t('students.clearSearchAria')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Major Code filter */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.375rem' }}>
            {t('students.majorLabel')}
          </label>
          <input
            type="text"
            className="form-control"
            placeholder={t('students.majorPlaceholder')}
            value={majorCodeTerm}
            onChange={(e) => setMajorCodeTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Account status filter */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.375rem' }}>
            {t('students.activationStatusLabel')}
          </label>
          <select
            className="form-control"
            value={currentStatusValue}
            onChange={handleStatusChange}
          >
            <option value="all">{t('students.allActivationStatus')}</option>
            <option value="activated">{t('students.activated')}</option>
            <option value="unactivated">{t('students.unactivated')}</option>
          </select>
        </div>

        {/* Key / Invitation status filter */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.375rem' }}>
            {t('students.emailStatusLabel')}
          </label>
          <select
            className="form-control"
            value={currentKeyValue}
            onChange={handleKeyStatusChange}
          >
            <option value="all">{t('students.allEmailStatus')}</option>
            <option value="sent">{t('students.emailSent')}</option>
            <option value="not_sent">{t('students.emailNotSent')}</option>
          </select>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', color: 'var(--color-text-muted)' }}
            >
              <Filter size={14} />
              <span>{t('students.clearFilters')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
