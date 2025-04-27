import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { SearchAndFilter } from './components/SearchAndFilter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [filters, setFilters] = useState<any>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Abnormal File Hub</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">A secure file management system</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>
            <SearchAndFilter onFilterChange={setFilters} />
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <FileList key={refreshKey} filters={filters} />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
