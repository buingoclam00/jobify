'use client';

import { Button } from '@/components/ui';
import { ArrowRight, Loader2, MapPin, Search } from 'lucide-react';
import { useState } from 'react';

interface JobSearchBarProps {
  value: string;
  location: string;
  onSearch: (query: string, location?: string) => void;
  loading?: boolean;
}

const JobSearchBar = ({ value, location, onSearch, loading = false }: JobSearchBarProps) => {
  const [query, setQuery] = useState(value);
  const [locationValue, setLocationValue] = useState(location);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, locationValue);
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onSearch(searchTerm, locationValue);
  };

  const popularSearches = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack',
    'React Developer',
    'Node.js',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
  ];

  return (
    <div className="space-y-4">
      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col md:flex-row gap-3 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Job Title/Company Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Vị trí, công ty, kỹ năng..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Location Search */}
          <div className="md:w-64 relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Địa điểm"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Tìm kiếm
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Popular Searches */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Tìm kiếm phổ biến:</span>
        {popularSearches.map((term) => (
          <button
            key={term}
            onClick={() => handleQuickSearch(term)}
            className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 hover:text-blue-600"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default JobSearchBar;