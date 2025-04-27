import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface SearchAndFilterProps {
  onFilterChange: (filters: any) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [uploadedAfter, setUploadedAfter] = useState('');
  const [uploadedBefore, setUploadedBefore] = useState('');
  const [sortField, setSortField] = useState('uploaded_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: any = {};
    
    if (search) filters.search = search;
    if (fileType) filters.file_type = fileType;
    if (minSize) filters.min_size = parseInt(minSize);
    if (maxSize) filters.max_size = parseInt(maxSize);
    if (uploadedAfter) filters.uploaded_after = uploadedAfter;
    if (uploadedBefore) filters.uploaded_before = uploadedBefore;
    if (sortField) {
      filters.ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;
    }

    onFilterChange(filters);
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    handleSearch(new Event('submit') as any);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Search files..."
              />
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-1">
              File Type
            </label>
            <input
              type="text"
              id="fileType"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="e.g., pdf, jpg"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="minSize" className="block text-sm font-medium text-gray-700 mb-1">
              Min Size (bytes)
            </label>
            <input
              type="number"
              id="minSize"
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Minimum size"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="maxSize" className="block text-sm font-medium text-gray-700 mb-1">
              Max Size (bytes)
            </label>
            <input
              type="number"
              id="maxSize"
              value={maxSize}
              onChange={(e) => setMaxSize(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Maximum size"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="uploadedAfter" className="block text-sm font-medium text-gray-700 mb-1">
              Uploaded After
            </label>
            <input
              type="date"
              id="uploadedAfter"
              value={uploadedAfter}
              onChange={(e) => setUploadedAfter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="uploadedBefore" className="block text-sm font-medium text-gray-700 mb-1">
              Uploaded Before
            </label>
            <input
              type="date"
              id="uploadedBefore"
              value={uploadedBefore}
              onChange={(e) => setUploadedBefore(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleSort('original_filename')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sort by Name
              {sortField === 'original_filename' && (
                sortDirection === 'desc' ? <ArrowDownIcon className="ml-2 h-4 w-4" /> : <ArrowUpIcon className="ml-2 h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSort('size')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sort by Size
              {sortField === 'size' && (
                sortDirection === 'desc' ? <ArrowDownIcon className="ml-2 h-4 w-4" /> : <ArrowUpIcon className="ml-2 h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSort('uploaded_at')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sort by Date
              {sortField === 'uploaded_at' && (
                sortDirection === 'desc' ? <ArrowDownIcon className="ml-2 h-4 w-4" /> : <ArrowUpIcon className="ml-2 h-4 w-4" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}; 