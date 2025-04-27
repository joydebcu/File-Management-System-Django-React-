import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../components/FileUpload';
import { fileService } from '../services/fileService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the fileService
jest.mock('../services/fileService');

const mockFile = new File(['test file content'], 'test.txt', { type: 'text/plain' });

describe('FileUpload Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <FileUpload onUploadSuccess={jest.fn()} />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows success message for new file upload', async () => {
    (fileService.uploadFile as jest.Mock).mockResolvedValueOnce({
      message: 'File uploaded successfully',
      is_duplicate: false,
    });

    renderComponent();

    const fileInput = screen.getByLabelText(/upload a file/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
    });
  });

  test('shows deduplication message for duplicate file', async () => {
    (fileService.uploadFile as jest.Mock).mockResolvedValueOnce({
      message: 'File was deduplicated successfully. This file has 2 references.',
      is_duplicate: true,
    });

    renderComponent();

    const fileInput = screen.getByLabelText(/upload a file/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/File was deduplicated successfully/i)).toBeInTheDocument();
    });
  });

  test('shows error message on upload failure', async () => {
    (fileService.uploadFile as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

    renderComponent();

    const fileInput = screen.getByLabelText(/upload a file/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to upload file. Please try again.')).toBeInTheDocument();
    });
  });

  test('clears success message after 5 seconds', async () => {
    jest.useFakeTimers();
    (fileService.uploadFile as jest.Mock).mockResolvedValueOnce({
      message: 'File uploaded successfully',
      is_duplicate: false,
    });

    renderComponent();

    const fileInput = screen.getByLabelText(/upload a file/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(5000);

    expect(screen.queryByText('File uploaded successfully')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  test('disables upload button when no file is selected', () => {
    renderComponent();
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).toBeDisabled();
  });

  test('enables upload button when file is selected', () => {
    renderComponent();
    const fileInput = screen.getByLabelText(/upload a file/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).not.toBeDisabled();
  });
}); 