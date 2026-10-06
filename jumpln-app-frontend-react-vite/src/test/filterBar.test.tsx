import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentFilterBar } from '../features/students/components/StudentFilterBar';

describe('StudentFilterBar Component', () => {
  const initialFilters = {
    page: 1,
    size: 10,
    search: '',
    majorSearch: '',
  };

  it('allows user to type smoothly without inputs being disabled', () => {
    const handleFilterChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><StudentFilterBar
        filters={initialFilters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        isLoading={true}
      /></QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Nhập mã SV, họ tên hoặc email...');
    // Crucial check: input should NOT be disabled when isLoading is true (background fetching)
    expect(searchInput).not.toBeDisabled();

    fireEvent.change(searchInput, { target: { value: 'SE123456' } });
    expect(searchInput).toHaveValue('SE123456');
  });

  it('immediately applies filter on Enter key press without reloading', () => {
    const handleFilterChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><StudentFilterBar
        filters={initialFilters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        isLoading={false}
      /></QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Nhập mã SV, họ tên hoặc email...');
    fireEvent.change(searchInput, { target: { value: 'SE123456' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'SE123456',
        page: 1,
      })
    );
  });

  it('debounces filter changes when typing', async () => {
    const handleFilterChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><StudentFilterBar
        filters={initialFilters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        isLoading={false}
      /></QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Nhập mã SV, họ tên hoặc email...');
    fireEvent.change(searchInput, { target: { value: 'Nguyễn' } });

    // Immediately after typing, callback should not be fired yet due to 350ms debounce
    expect(handleFilterChange).not.toHaveBeenCalled();

    // After debounce interval, it should fire
    await waitFor(
      () => {
        expect(handleFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Nguyễn',
            page: 1,
          })
        );
      },
      { timeout: 1000 }
    );
  });
});
