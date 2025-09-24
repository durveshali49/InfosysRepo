/**
 * Customer Search Component
 * Interface for customers to search and filter service listings
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Filter, X, BarChart3 } from 'lucide-react';
import ListingCard from './ListingCard';
import './CustomerSearch.css';

const CustomerSearch = () => {
  const navigate = useNavigate();
  // State management
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location_city: '',
    location_zip: '',
    min_price: '',
    max_price: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 12;

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Available categories
  const categories = [
    'All Categories', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 
    'Painting', 'Gardening', 'Moving', 'Tutoring', 'Pet Care', 'Beauty', 'Other'
  ];

  /**
   * Handle logout
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  /**
   * Fetch all listings from the API
   */
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5000/api/listings/search', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setListings(data.listings);
        setFilteredListings(data.listings);
      } else {
        setError(data.message || 'Failed to fetch listings');
      }
    } catch (err) {
      console.error('Fetch listings error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply search and filters to listings
   */
  const applyFiltersAndSearch = () => {
    let filtered = [...listings];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.service_name.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query) ||
        listing.location_city.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'All Categories') {
      filtered = filtered.filter(listing => listing.category === filters.category);
    }

    // Apply location filters
    if (filters.location_city.trim()) {
      filtered = filtered.filter(listing => 
        listing.location_city.toLowerCase().includes(filters.location_city.toLowerCase())
      );
    }

    if (filters.location_zip.trim()) {
      filtered = filtered.filter(listing => 
        listing.location_zip.includes(filters.location_zip)
      );
    }

    // Apply price filters
    if (filters.min_price) {
      filtered = filtered.filter(listing => 
        parseFloat(listing.price) >= parseFloat(filters.min_price)
      );
    }

    if (filters.max_price) {
      filtered = filtered.filter(listing => 
        parseFloat(listing.price) <= parseFloat(filters.max_price)
      );
    }

    setFilteredListings(filtered);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      location_city: '',
      location_zip: '',
      min_price: '',
      max_price: ''
    });
    setFilteredListings(listings);
    setCurrentPage(1);
  };

  /**
   * Handle contact provider
   */
  const handleContactProvider = (listing) => {
    // For demo purposes, show an alert
    // In a real app, this would open a contact modal or redirect to messaging
    alert(`Contact ${listing.provider_name || 'Provider'} for "${listing.service_name}"\n\nIn a real application, this would open a contact form or messaging system.`);
  };

  /**
   * Get pagination data
   */
  const getPaginationData = () => {
    const totalItems = filteredListings.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredListings.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      currentItems,
      startIndex,
      endIndex: Math.min(endIndex, totalItems)
    };
  };

  // Apply filters when search query or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, filters, listings]);

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  const { totalItems, totalPages, currentItems, startIndex, endIndex } = getPaginationData();

  // Render loading state
  if (loading) {
    return (
      <div className="customer-search">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading available services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-search">
      {/* Navigation Bar */}
      <nav className="search-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <img src="/local-services-logo.svg" alt="Local Services" className="nav-logo" />
            <span className="nav-title">Local Services</span>
          </div>
          <div className="nav-actions">
            {user.role === 'Service Provider' && (
              <button 
                className="nav-btn secondary"
                onClick={() => navigate('/provider-dashboard')}
              >
                <BarChart3 size={16} /> My Dashboard
              </button>
            )}
            <button 
              className="nav-btn secondary"
              onClick={() => navigate('/home')}
            >
              <Home size={16} /> Home
            </button>
            {user.id && (
              <button 
                className="nav-btn logout"
                onClick={handleLogout}
              >
                � Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="search-header">
        <div className="header-content">
          <h1>Find Local Services</h1>
          <p>Discover trusted service providers in your area</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for services, providers, or locations..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            <Filter size={20} />
            Filters
            {showFilters && <span className="filter-indicator"><X size={12} /></span>}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              {/* Category Filter */}
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filters */}
              <div className="filter-group">
                <label>City</label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={filters.location_city}
                  onChange={(e) => handleFilterChange('location_city', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  placeholder="Enter ZIP code"
                  value={filters.location_zip}
                  onChange={(e) => handleFilterChange('location_zip', e.target.value)}
                />
              </div>

              {/* Price Filters */}
              <div className="filter-group">
                <label>Min Price ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Max Price ($)</label>
                <input
                  type="number"
                  placeholder="1000.00"
                  min="0"
                  step="0.01"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>

              {/* Clear Filters */}
              <div className="filter-actions">
                <button className="btn-clear" onClick={clearFilters}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')} className="error-close"><X size={16} /></button>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <div className="results-info">
          {totalItems > 0 ? (
            <p>
              Showing {startIndex + 1}-{endIndex} of {totalItems} services
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          ) : (
            <p>No services found</p>
          )}
        </div>

        {(searchQuery || Object.values(filters).some(f => f)) && (
          <button className="btn-clear-all" onClick={clearFilters}>
            Clear all filters
          </button>
        )}
      </div>

      {/* Listings Grid */}
      <div className="listings-section">
        {currentItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Search size={48} /></div>
            <h3>No services found</h3>
            <p>
              {searchQuery || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search criteria or filters.'
                : 'No services are available at the moment.'
              }
            </p>
            {(searchQuery || Object.values(filters).some(f => f)) && (
              <button className="btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="listings-grid">
            {currentItems.map((listing) => (
              <ListingCard
                key={listing.listing_id}
                listing={listing}
                onContact={() => handleContactProvider(listing)}
                isOwner={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;