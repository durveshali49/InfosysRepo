/**
 * Listing Form Component
 * Form for creating and editing service listings
 */

import React, { useState, useEffect } from 'react';
import './ListingForm.css';

const ListingForm = ({ listing, onSubmit, isSubmitting }) => {
  // Form state
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    category: '',
    price: '',
    location_city: '',
    location_zip: '',
    image_url: '',
    availability: {
      days: [],
      hours: { start: '09:00', end: '17:00' },
      notes: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');

  // Available categories
  const categories = [
    'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting',
    'Gardening', 'Moving', 'Tutoring', 'Pet Care', 'Beauty', 'Other'
  ];

  // Available days
  const availableDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  /**
   * Initialize form data when editing
   */
  useEffect(() => {
    if (listing) {
      let availability = {
        days: [],
        hours: { start: '09:00', end: '17:00' },
        notes: ''
      };

      // Parse availability JSON if it exists
      if (listing.availability) {
        try {
          availability = JSON.parse(listing.availability);
        } catch (e) {
          console.warn('Failed to parse availability JSON');
        }
      }

      setFormData({
        service_name: listing.service_name || '',
        description: listing.description || '',
        category: listing.category || '',
        price: listing.price || '',
        location_city: listing.location_city || '',
        location_zip: listing.location_zip || '',
        image_url: listing.image_url || '',
        availability
      });

      if (listing.image_url) {
        setImagePreview(listing.image_url);
      }
    }
  }, [listing]);

  /**
   * Handle input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Handle image preview
    if (name === 'image_url' && value) {
      setImagePreview(value);
    }
  };

  /**
   * Handle availability changes
   */
  const handleAvailabilityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  /**
   * Handle day selection
   */
  const handleDayToggle = (day) => {
    setFormData(prev => {
      const currentDays = prev.availability.days;
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];

      return {
        ...prev,
        availability: {
          ...prev.availability,
          days: newDays
        }
      };
    });
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Service name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.location_city.trim()) {
      newErrors.location_city = 'City is required';
    }

    if (!formData.location_zip.trim()) {
      newErrors.location_zip = 'ZIP code is required';
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate URL format
   */
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await onSubmit(formData);
    
    if (!result.success) {
      setErrors({ submit: result.message });
    }
  };

  return (
    <div className="listing-form">
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="service_name">Service Name *</label>
            <input
              type="text"
              id="service_name"
              name="service_name"
              value={formData.service_name}
              onChange={handleInputChange}
              placeholder="e.g., Professional House Cleaning"
              className={errors.service_name ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.service_name && <span className="error-text">{errors.service_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your service in detail..."
              rows="4"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? 'error' : ''}
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.price ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h3>Location</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location_city">City *</label>
              <input
                type="text"
                id="location_city"
                name="location_city"
                value={formData.location_city}
                onChange={handleInputChange}
                placeholder="e.g., New York"
                className={errors.location_city ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.location_city && <span className="error-text">{errors.location_city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location_zip">ZIP Code *</label>
              <input
                type="text"
                id="location_zip"
                name="location_zip"
                value={formData.location_zip}
                onChange={handleInputChange}
                placeholder="e.g., 10001"
                className={errors.location_zip ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.location_zip && <span className="error-text">{errors.location_zip}</span>}
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="form-section">
          <h3>Availability</h3>
          
          <div className="form-group">
            <label>Available Days</label>
            <div className="days-grid">
              {availableDays.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${formData.availability.days.includes(day) ? 'active' : ''}`}
                  onClick={() => handleDayToggle(day)}
                  disabled={isSubmitting}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">Start Time</label>
              <input
                type="time"
                id="start_time"
                value={formData.availability.hours.start}
                onChange={(e) => handleAvailabilityChange('hours', {
                  ...formData.availability.hours,
                  start: e.target.value
                })}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time</label>
              <input
                type="time"
                id="end_time"
                value={formData.availability.hours.end}
                onChange={(e) => handleAvailabilityChange('hours', {
                  ...formData.availability.hours,
                  end: e.target.value
                })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="availability_notes">Availability Notes</label>
            <textarea
              id="availability_notes"
              value={formData.availability.notes}
              onChange={(e) => handleAvailabilityChange('notes', e.target.value)}
              placeholder="Additional availability information..."
              rows="2"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Image */}
        <div className="form-section">
          <h3>Image (Optional)</h3>
          
          <div className="form-group">
            <label htmlFor="image_url">Image URL</label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className={errors.image_url ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.image_url && <span className="error-text">{errors.image_url}</span>}
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img 
                src={imagePreview} 
                alt="Preview" 
                onError={() => setImagePreview('')}
              />
            </div>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="form-error">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (listing ? 'Updating...' : 'Creating...') 
              : (listing ? 'Update Listing' : 'Create Listing')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;