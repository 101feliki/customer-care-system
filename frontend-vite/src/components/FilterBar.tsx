import React from 'react';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface FilterBarProps {
  filters: {
    category: string;
    status: string;
    dateRange: string;
    search: string;
  };
  setFilters: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const categories = ['all', 'email', 'sms', 'urgent', 'info'];
  const statuses = ['all', 'read', 'unread', 'cancelled'];
  const dateRanges = ['today', 'week', 'month', 'quarter', 'year'];

  return (
    <div className="px-6 py-4 bg-secondary border-b border-color">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="input"
          >
            {dateRanges.map((range) => (
              <option key={range} value={range}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ category: 'all', status: 'all', dateRange: 'today', search: '' })}
            className="btn bg-card border border-color hover:bg-hover text-primary"
          >
            <FunnelIcon className="h-3 w-4 mr-1" />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;