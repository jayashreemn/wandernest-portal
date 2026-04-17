import React, { useState } from 'react';
import axiosInstance from '@/utils/axios';
import { usePlaces } from '../../../hooks';
import { ChevronDown, X } from 'lucide-react';

const SearchBar = () => {
  const Places = usePlaces();
  const { setPlaces, setLoading } = Places;

  const [searchText, setSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
  });

  const handleSearch = async (e) => {
    clearTimeout(searchTimeout);
    const inputValue = e.target.value;
    setSearchText(inputValue);

    if (inputValue.trimStart() !== '') {
      setLoading(true);
      setSearchTimeout(
        setTimeout(async () => {
          try {
            const { data } = await axiosInstance.get(
              `/places/search/${inputValue.trimStart()}`,
            );
            setPlaces(data);
            setLoading(false);
          } catch (error) {
            console.log('Search error:', error);
            setLoading(false);
          }
        }, 500),
      );
    } else {
      // If search is empty, fetch all places
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/places');
        setPlaces(data.places);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching all places:', error);
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minRating) params.append('minRating', filters.minRating);

      const { data } = await axiosInstance.get(`/places/filter?${params.toString()}`);
      setPlaces(data);
      setLoading(false);
      setShowFilters(false);
    } catch (error) {
      console.log('Filter error:', error);
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
    });
    setSearchText('');
    // Fetch all places
    setLoading(true);
    axiosInstance
      .get('/places')
      .then(({ data }) => {
        setPlaces(data.places);
        setLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching places:', error);
        setLoading(false);
      });
  };

  const hasActiveFilters =
    filters.location ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.bedrooms ||
    filters.bathrooms;

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        {/* Search Input */}
        <div className="flex flex-1 max-w-md overflow-hidden rounded-full border border-gray-400 bg-gray-300 shadow-sm hover:shadow-lg">
          <div className="grow min-w-0">
            <input
              type="search"
              placeholder="Where you want to go?"
              className="h-full w-full border-none py-2 px-4 text-sm focus:outline-none md:text-base"
              onChange={(e) => handleSearch(e)}
              value={searchText}
            />
          </div>
          <button
            className="flex items-center bg-primary py-2 px-3 text-white md:px-3 flex-shrink-0"
            onClick={handleSearch}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <span className="ml-1 hidden md:block text-sm">Search</span>
          </button>
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
            hasActiveFilters
              ? 'bg-blue-600 text-white shadow-lg'
              : 'border border-gray-400 bg-white text-gray-700 hover:shadow-lg'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 flex-shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6a1 1 0 011-1h16a1 1 0 011 1v2.5a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 9.207A1 1 0 013 8.5V6z"
            />
          </svg>
          <span className="hidden md:inline text-sm">Filter</span>
          {hasActiveFilters && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600">
              {Object.values(filters).filter(v => v).length}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 hidden md:block ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-2xl sm:w-96 sm:left-auto">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filters Grid */}
            <div className="space-y-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Search by city..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="$0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="$5000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Any Rating</option>
                  <option value="1">1+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={applyFilters}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
