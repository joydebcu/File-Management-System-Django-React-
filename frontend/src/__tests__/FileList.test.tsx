import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FileList } from '../components/FileList';
import { fileService } from '../services/fileService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the fileService
jest.mock('../services/fileService');

describe('FileList Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockFiles = [
    {
      id: '1',
      original_filename: 'test1.txt',
      file_type: 'text/plain',
      size: 1000,
      uploaded_at: '2024-01-01T00:00:00Z',
      file: 'http://example.com/file1',
      content_hash: 'hash1',
      reference_count: 1,
      storage_savings: 0,
    },
    {
      id: '2',
      original_filename: 'test2.txt',
      file_type: 'text/plain',
      size: 2000,
      uploaded_at: '2024-01-02T00:00:00Z',
      file: 'http://example.com/file2',
      content_hash: 'hash2',
      reference_count: 3,
      storage_savings: 4000,
    },
  ];

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <FileList />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fileService.getFiles as jest.Mock).mockResolvedValue(mockFiles);
  });

  test('displays total storage savings', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Total Storage Savings')).toBeInTheDocument();
      expect(screen.getByText('4 KB')).toBeInTheDocument(); // 4000 bytes
    });
  });

  test('displays unique and duplicated files count', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Unique Files')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Deduplicated Files')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  test('displays file reference counts', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('1 reference')).toBeInTheDocument();
      expect(screen.getByText('3 references')).toBeInTheDocument();
    });
  });

  test('displays storage savings per file', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument(); // No savings for unique file
      expect(screen.getByText('4 KB')).toBeInTheDocument(); // Savings for duplicated file
    });
  });

  test('shows loading state', () => {
    (fileService.getFiles as jest.Mock).mockImplementation(() => new Promise(() => {}));
    renderComponent();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('shows error state', async () => {
    (fileService.getFiles as jest.Mock).mockRejectedValueOnce(new Error('Failed to load files'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to load files. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles file deletion', async () => {
    (fileService.deleteFile as jest.Mock).mockResolvedValueOnce(undefined);
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    expect(window.confirm).toHaveBeenCalled();
  });

  test('handles file download', async () => {
    (fileService.downloadFile as jest.Mock).mockResolvedValueOnce(undefined);
    renderComponent();

    await waitFor(() => {
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      fireEvent.click(downloadButtons[0]);
    });

    expect(fileService.downloadFile).toHaveBeenCalledWith(
      'http://example.com/file1',
      'test1.txt'
    );
  });
}); 