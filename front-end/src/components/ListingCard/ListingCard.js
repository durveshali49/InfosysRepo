/**
 * Listing Card Component
 * Display component for individual service listings
 */

import React, { useState } from 'react';
import { MapPin, Clock, Edit, Trash2, Phone, Star } from 'lucide-react';
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
   * Format price display with Indian Rupee symbol
   */
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice ? `₹${numPrice.toFixed(0)}` : 'Price on request';
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
   * Get category color - Monochromatic theme
   */
  const getCategoryColor = (category) => {
    const colors = {
      'Plumbing': '#000000',
      'Electrical': '#333333',
      'Cleaning': '#000000',
      'Carpentry': '#333333',
      'Painting': '#000000',
      'Gardening': '#333333',
      'Moving': '#000000',
      'Tutoring': '#333333',
      'Pet Care': '#000000',
      'Beauty': '#333333',
      'Other': '#757575'
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
          <MapPin size={16} />
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
          <Clock size={16} />
          {formatAvailability(listing.availability)}
        </div>

        {/* Provider Info & Rating */}
        <div className="provider-section">
          {listing.provider_name && (
            <div className="provider-info">
              <span className="provider-label">Provider:</span>
              <span className="provider-name">{listing.provider_name}</span>
            </div>
          )}
          
          {/* Rating Display */}
          <div className="rating-display">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={16} 
                  className={star <= (listing.rating_average || 4.5) ? 'star-filled' : 'star-empty'}
                />
              ))}
            </div>
            <span className="rating-text">
              {(listing.rating_average || 4.5).toFixed(1)} ({listing.rating_count || 23} reviews)
            </span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="listing-meta">
          <span className="meta-item">
            Listed {new Date(listing.created_at).toLocaleDateString()}
          </span>
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
                <Edit size={16} />
                Edit
              </button>
              <button 
                className="btn-delete"
                onClick={handleDelete}
                title="Delete listing"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          ) : (
            // Customer actions
            <div className="customer-actions">
              <button 
                className="btn-book-now"
                onClick={() => onContact(listing)}
              >
                Book Now
              </button>
              <button 
                className="btn-contact-secondary"
                onClick={() => onContact(listing)}
              >
                <Phone size={16} />
                Contact
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingCard;