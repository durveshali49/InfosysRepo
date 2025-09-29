/**
 * Provider Dashboard Component
 * Allows service providers to create, edit, and manage their listings
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, X, Plus, Clipboard } from 'lucide-react';
import ListingForm from '../../components/ListingForm';
import ListingCard from '../../components/ListingCard';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  // State management
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  /**
   * Handle logout
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  /**
   * Fetch provider's listings from the API
   */
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:5000/api/listings/provider/${user.id}`, {
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setListings(data.listings);
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
   * Handle creating a new listing
   */
  const handleCreateListing = async (listingData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        fetchListings(); // Refresh the listings
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Create listing error:', err);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle updating an existing listing
   */
  const handleUpdateListing = async (listingData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch(`http://localhost:5000/api/listings/${editingListing.listing_id}`, {
        method: 'PUT',
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
      });

      const data = await response.json();

      if (data.success) {
        setEditingListing(null);
        setShowForm(false);
        fetchListings(); // Refresh the listings
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Update listing error:', err);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle deleting a listing
   */
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      setError('');

      const response = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchListings(); // Refresh the listings
      } else {
        setError(data.message || 'Failed to delete listing');
      }
    } catch (err) {
      console.error('Delete listing error:', err);
      setError('Network error. Please try again.');
    }
  };

  /**
   * Handle edit button click
   */
  const handleEditClick = (listing) => {
    setEditingListing(listing);
    setShowForm(true);
  };

  /**
   * Handle form cancel
   */
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingListing(null);
  };

  // Fetch listings on component mount
  useEffect(() => {
    if (user.id && user.role === 'Service Provider') {
      fetchListings();
    } else {
      setError('Access denied. Provider access required.');
      setLoading(false);
    }
  }, [user.id, user.role]);

  // Render loading state
  if (loading) {
    return (
      <div className="provider-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <img src="/local-services-logo.svg" alt="Local Services" className="nav-logo" />
            <span className="nav-title">Local Services</span>
          </div>
          <div className="nav-actions">
            <button 
              className="nav-btn secondary"
              onClick={() => navigate('/customer-search')}
            >
              <Search size={16} /> Browse Services
            </button>
            <button 
              className="nav-btn secondary"
              onClick={() => navigate('/home')}
            >
              <Home size={16} /> Home
            </button>
            <button 
              className="nav-btn logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Provider Dashboard</h1>
            <p>Welcome back, {user.username}! Manage your service listings below.</p>
          </div>
          <button 
            className="btn-primary create-btn"
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            {showForm ? 'Form Open' : <><Plus size={16} /> Create New Listing</>}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError('')} className="error-close"><X size={16} /></button>
          </div>
        )}

        {/* Listing Form */}
        {showForm && (
          <div className="form-section">
            <div className="form-header">
              <h2>{editingListing ? 'Edit Listing' : 'Create New Listing'}</h2>
              <button 
                className="btn-secondary"
                onClick={handleFormCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
            <ListingForm
              listing={editingListing}
              onSubmit={editingListing ? handleUpdateListing : handleCreateListing}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Listings Grid */}
        <div className="listings-section">
          <div className="section-header">
            <h2>Your Listings ({listings.length})</h2>
          </div>

          {listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Clipboard size={48} /></div>
              <h3>No listings yet</h3>
              <p>Create your first service listing to start attracting customers!</p>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.listing_id}
                  listing={listing}
                  onEdit={() => handleEditClick(listing)}
                  onDelete={() => handleDeleteListing(listing.listing_id)}
                  isOwner={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;