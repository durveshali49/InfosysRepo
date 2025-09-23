/**
 * Listing Card Component
 * Display component for individual service listings
 */

import React, { useState } from 'react';
import './ListingCard.css';

const ListingCard = ({ 
  listing, 
  onEdit, 
  onDelete, 
  onContact,
  isOwner = false,
  showActions = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  /**
   * Format price display
   */
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice ? `$${numPrice.toFixed(2)}` : 'Price on request';
  };

  /**
   * Format availability display
   */
  const formatAvailability = (availability) => {
    if (!availability) return 'Contact for availability';
    
    try {
      const parsed = JSON.parse(availability);
      const { days, hours } = parsed;
      
      if (!days || days.length === 0) return 'Contact for availability';
      
      const daysText = days.length === 7 
        ? 'Daily' 
        : days.length > 3 
          ? `${days.length} days/week`
          : days.slice(0, 2).join(', ') + (days.length > 2 ? '...' : '');
      
      if (hours && hours.start && hours.end) {
        return `${daysText} • ${formatTime(hours.start)} - ${formatTime(hours.end)}`;
      }
      
      return daysText;
    } catch (e) {
      return 'Contact for availability';
    }
  };

  /**
   * Format time display
   */
  const formatTime = (time) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  /**
   * Truncate description for preview
   */
  const truncateDescription = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  /**
   * Handle image error
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * Get category color
   */
  const getCategoryColor = (category) => {
    const colors = {
      'Plumbing': '#3b82f6',
      'Electrical': '#f59e0b',
      'Cleaning': '#10b981',
      'Carpentry': '#8b5cf6',
      'Painting': '#ef4444',
      'Gardening': '#22c55e',
      'Moving': '#f97316',
      'Tutoring': '#6366f1',
      'Pet Care': '#ec4899',
      'Beauty': '#14b8a6',
      'Other': '#6b7280'
    };
    return colors[category] || colors['Other'];
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${listing.service_name}"? This action cannot be undone.`)) {
      onDelete(listing.listing_id);
    }
  };

  return (
    <div className="listing-card">
      {/* Image Section */}
      <div className="listing-image">
        {listing.image_url && !imageError ? (
          <img 
            src={listing.image_url} 
            alt={listing.service_name}
            onError={handleImageError}
          />
        ) : (
          <div className="placeholder-image">
            <span className="placeholder-text">
              {listing.service_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        <div 
          className="category-badge"
          style={{ backgroundColor: getCategoryColor(listing.category) }}
        >
          {listing.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="listing-content">
        {/* Header */}
        <div className="listing-header">
          <h3 className="listing-title">{listing.service_name}</h3>
          <div className="listing-price">{formatPrice(listing.price)}</div>
        </div>

        {/* Location */}
        <div className="listing-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {listing.location_city}, {listing.location_zip}
        </div>

        {/* Description */}
        {listing.description && (
          <div className="listing-description">
            <p>
              {showFullDescription 
                ? listing.description 
                : truncateDescription(listing.description)
              }
              {listing.description && listing.description.length > 120 && (
                <button 
                  className="toggle-description"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? ' Show less' : ' Read more'}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Availability */}
        <div className="listing-availability">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.4L16.2,16.2Z"/>
          </svg>
          {formatAvailability(listing.availability)}
        </div>

        {/* Provider Info */}
        {listing.provider_name && (
          <div className="provider-info">
            <span className="provider-label">Provider:</span>
            <span className="provider-name">{listing.provider_name}</span>
          </div>
        )}

        {/* Timestamps */}
        <div className="listing-meta">
          <span className="meta-item">
            Listed {new Date(listing.created_at).toLocaleDateString()}
          </span>
          {listing.updated_at !== listing.created_at && (
            <span className="meta-item">
              Updated {new Date(listing.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="listing-actions">
          {isOwner ? (
            // Owner actions
            <div className="owner-actions">
              <button 
                className="btn-edit"
                onClick={() => onEdit(listing)}
                title="Edit listing"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit
              </button>
              <button 
                className="btn-delete"
                onClick={handleDelete}
                title="Delete listing"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Delete
              </button>
            </div>
          ) : (
            // Customer actions
            <div className="customer-actions">
              <button 
                className="btn-contact"
                onClick={() => onContact(listing)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Contact Provider
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingCard;