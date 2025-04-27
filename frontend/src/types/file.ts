export interface File {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  file: string;
  content_hash: string;
  reference_count: number;
  storage_savings: number;
  message?: string;
  is_duplicate?: boolean;
} 