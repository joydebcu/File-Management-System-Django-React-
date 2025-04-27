import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { fileService } from '../services/fileService';

interface SearchAndFilterProps {
  onFilterChange: (filters: any) => void;
}

const SIZE_UNITS = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [minSizeUnit, setMinSizeUnit] = useState('MB');
  const [maxSizeUnit, setMaxSizeUnit] = useState('MB');
  const [uploadedAfter, setUploadedAfter] = useState('');
  const [uploadedBefore, setUploadedBefore] = useState('');
  const [sortField, setSortField] = useState('uploaded_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch available file types
  const { data: fileTypes = [] } = useQuery({
    queryKey: ['fileTypes'],
    queryFn: () => fileService.getFileTypes(),
  });

  const convertToBytes = (value: string, unit: string) => {
    if (!value) return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    return Math.round(numValue * SIZE_UNITS[unit as keyof typeof SIZE_UNITS]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: any = {};
    const newActiveFilters: string[] = [];
    
    if (search) {
      filters.search = search;
      newActiveFilters.push('search');
    }
    if (fileType) {
      filters.file_type = fileType;
      newActiveFilters.push('file_type');
    }
    if (minSize) {
      const minSizeBytes = convertToBytes(minSize, minSizeUnit);
      if (minSizeBytes) {
        filters.min_size = minSizeBytes;
        newActiveFilters.push('min_size');
      }
    }
    if (maxSize) {
      const maxSizeBytes = convertToBytes(maxSize, maxSizeUnit);
      if (maxSizeBytes) {
        filters.max_size = maxSizeBytes;
        newActiveFilters.push('max_size');
      }
    }
    if (uploadedAfter) {
      filters.uploaded_after = uploadedAfter;
      newActiveFilters.push('uploaded_after');
    }
    if (uploadedBefore) {
      filters.uploaded_before = uploadedBefore;
      newActiveFilters.push('uploaded_before');
    }
    if (sortField) {
      filters.ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;
    }

    setActiveFilters(newActiveFilters);
    onFilterChange(filters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleRemoveFilter = (filterName: string) => {
    // Reset the corresponding filter value
    switch (filterName) {
      case 'search':
        setSearch('');
        break;
      case 'file_type':
        setFileType('');
        break;
      case 'min_size':
        setMinSize('');
        break;
      case 'max_size':
        setMaxSize('');
        break;
      case 'uploaded_after':
        setUploadedAfter('');
        break;
      case 'uploaded_before':
        setUploadedBefore('');
        break;
    }

    // Remove from active filters
    setActiveFilters(prev => prev.filter(f => f !== filterName));

    // Create new filters object without the removed filter
    const newFilters: any = {};
    if (search && filterName !== 'search') newFilters.search = search;
    if (fileType && filterName !== 'file_type') newFilters.file_type = fileType;
    if (minSize && filterName !== 'min_size') newFilters.min_size = parseInt(minSize);
    if (maxSize && filterName !== 'max_size') newFilters.max_size = parseInt(maxSize);
    if (uploadedAfter && filterName !== 'uploaded_after') newFilters.uploaded_after = uploadedAfter;
    if (uploadedBefore && filterName !== 'uploaded_before') newFilters.uploaded_before = uploadedBefore;
    if (sortField) {
      newFilters.ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;
    }

    // Trigger filter change with updated filters
    onFilterChange(newFilters);
  };

  const handleRemoveAllFilters = () => {
    // Reset all filter values
    setSearch('');
    setFileType('');
    setMinSize('');
    setMaxSize('');
    setUploadedAfter('');
    setUploadedBefore('');
    setSortField('uploaded_at');
    setSortDirection('desc');
    setActiveFilters([]);

    // Trigger filter change with empty filters
    onFilterChange({});
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    handleSearch(new Event('submit') as any);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map(filter => (
            <span
              key={filter}
              className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800"
            >
              {filter.replace('_', ' ')}
              <button
                onClick={() => handleRemoveFilter(filter)}
                className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </span>
          ))}
          <button
            onClick={handleRemoveAllFilters}
            className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Clear All
          </button>
        </div>
      )}
      <form onSubmit={handleSearch} onKeyDown={handleKeyDown} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 sm:pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base"
                placeholder="Search files..."
              />
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-1">
              File Type
            </label>
            <select
              id="fileType"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base"
            >
              <option value="">All Types</option>
              {fileTypes.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="minSize" className="block text-sm font-medium text-gray-700 mb-1">
              Min Size
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="minSize"
                value={minSize}
                onChange={(e) => setMinSize(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base"
                placeholder="Minimum size"
                step="0.01"
              />
              <select
                value={minSizeUnit}
                onChange={(e) => setMinSizeUnit(e.target.value)}
                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base"
              >
                <option value="B">B</option>
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
              </select>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="maxSize" className="block text-sm font-medium text-gray-700 mb-1">
              Max Size
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="maxSize"
                value={maxSize}
                onChange={(e) => setMaxSize(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base"
                placeholder="Maximum size"
                step="0.01"
              />
              <select
                value={maxSizeUnit}
                onChange={(e) => setMaxSizeUnit(e.target.value)}
                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base"
              >
                <option value="B">B</option>
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
              </select>
            </div>
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
              onKeyDown={handleKeyDown}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base"
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
              onKeyDown={handleKeyDown}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSort('original_filename')}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sort by Name
              {sortField === 'original_filename' && (
                sortDirection === 'desc' ? <ArrowDownIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowUpIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSort('size')}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sort by Size
              {sortField === 'size' && (
                sortDirection === 'desc' ? <ArrowDownIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowUpIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSort('uploaded_at')}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sort by Date
              {sortField === 'uploaded_at' && (
                sortDirection === 'desc' ? <ArrowDownIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowUpIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}; 