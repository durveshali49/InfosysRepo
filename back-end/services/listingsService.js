/**
 * Listings Service
 * Contains all listings-related business logic
 */

import pool from '../config/database.js';

class ListingsService {
  /**
   * Create a new service listing
   * @param {Object} listingData - Listing data
   * @param {number} providerId - Provider ID
   * @returns {Promise<Object>} - Created listing result
   */
  async createListing(listingData, providerId) {
    const { 
      service_name, 
      description, 
      category, 
      price, 
      availability, 
      location_city, 
      location_zip, 
      image_url 
    } = listingData;

    // Parse availability JSON if provided
    let availabilityData = null;
    if (availability) {
      availabilityData = JSON.stringify(availability);
    }

    // Insert listing into database
    const [result] = await pool.execute(
      `INSERT INTO service_listings 
       (provider_id, service_name, description, category, price, availability, location_city, location_zip, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [providerId, service_name, description, category, price, availabilityData, location_city, location_zip, image_url]
    );

    return {
      listingId: result.insertId,
      ...listingData
    };
  }

  /**
   * Get listing with provider info for real-time broadcast
   * @param {number} listingId - Listing ID
   * @returns {Promise<Object|null>} - Listing with provider info
   */
  async getListingWithProvider(listingId) {
    const [listing] = await pool.execute(
      `SELECT 
        sl.listing_id, sl.service_name, sl.description, sl.category, sl.price, 
        sl.availability, sl.location_city, sl.location_zip, sl.image_url, 
        sl.created_at, u.username as provider_name
       FROM service_listings sl
       JOIN users u ON sl.provider_id = u.id
       WHERE sl.listing_id = ?`,
      [listingId]
    );

    return listing.length > 0 ? listing[0] : null;
  }

  /**
   * Get provider's listings
   * @param {number} providerId - Provider ID
   * @returns {Promise<Array>} - Array of listings
   */
  async getProviderListings(providerId) {
    const [listings] = await pool.execute(
      `SELECT listing_id, service_name, description, category, price, 
              availability, location_city, location_zip, image_url, 
              created_at, updated_at
       FROM service_listings 
       WHERE provider_id = ? 
       ORDER BY created_at DESC`,
      [providerId]
    );

    return listings;
  }

  /**
   * Check if listing exists and belongs to provider
   * @param {number} listingId - Listing ID
   * @param {number} providerId - Provider ID
   * @returns {Promise<boolean>} - True if listing belongs to provider
   */
  async verifyListingOwnership(listingId, providerId) {
    const [existingListing] = await pool.execute(
      "SELECT provider_id FROM service_listings WHERE listing_id = ?",
      [listingId]
    );

    if (existingListing.length === 0) {
      return { exists: false, isOwner: false };
    }

    return {
      exists: true,
      isOwner: existingListing[0].provider_id === providerId
    };
  }

  /**
   * Update a listing
   * @param {number} listingId - Listing ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  async updateListing(listingId, updateData) {
    const { 
      service_name, 
      description, 
      category, 
      price, 
      availability, 
      location_city, 
      location_zip, 
      image_url 
    } = updateData;

    // Parse availability JSON if provided
    let availabilityData = null;
    if (availability) {
      availabilityData = JSON.stringify(availability);
    }

    await pool.execute(
      `UPDATE service_listings 
       SET service_name = ?, description = ?, category = ?, price = ?, 
           availability = ?, location_city = ?, location_zip = ?, image_url = ?, 
           updated_at = CURRENT_TIMESTAMP
       WHERE listing_id = ?`,
      [service_name, description, category, price, availabilityData, location_city, location_zip, image_url, listingId]
    );
  }

  /**
   * Delete a listing
   * @param {number} listingId - Listing ID
   * @returns {Promise<void>}
   */
  async deleteListing(listingId) {
    await pool.execute(
      "DELETE FROM service_listings WHERE listing_id = ?",
      [listingId]
    );
  }

  /**
   * Search listings with filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} - Array of filtered listings
   */
  async searchListings(filters = {}) {
    let query = `
      SELECT 
        sl.listing_id, sl.service_name, sl.description, sl.category, sl.price, 
        sl.availability, sl.location_city, sl.location_zip, sl.image_url, 
        sl.created_at, u.username as provider_name, u.id as provider_id,
        COALESCE(AVG(r.rating), 0) as rating_average,
        COUNT(r.rating_id) as rating_count
      FROM service_listings sl
      JOIN users u ON sl.provider_id = u.id
      LEFT JOIN ratings r ON sl.listing_id = r.listing_id
    `;

    const conditions = [];
    const params = [];

    // Apply filters
    if (filters.category && filters.category !== 'All Categories') {
      conditions.push('sl.category = ?');
      params.push(filters.category);
    }

    if (filters.location_city) {
      conditions.push('sl.location_city LIKE ?');
      params.push(`%${filters.location_city}%`);
    }

    if (filters.location_zip) {
      conditions.push('sl.location_zip LIKE ?');
      params.push(`%${filters.location_zip}%`);
    }

    if (filters.min_price) {
      conditions.push('sl.price >= ?');
      params.push(parseFloat(filters.min_price));
    }

    if (filters.max_price) {
      conditions.push('sl.price <= ?');
      params.push(parseFloat(filters.max_price));
    }

    if (filters.search) {
      conditions.push('(sl.service_name LIKE ? OR sl.description LIKE ? OR u.username LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add GROUP BY and ORDER BY
    query += ' GROUP BY sl.listing_id ORDER BY sl.created_at DESC';

    const [listings] = await pool.execute(query, params);
    return listings;
  }

  /**
   * Validate availability format
   * @param {any} availability - Availability data
   * @returns {boolean} - True if valid
   */
  validateAvailability(availability) {
    if (!availability) return true;
    
    try {
      if (typeof availability === 'string') {
        JSON.parse(availability);
      } else {
        JSON.stringify(availability);
      }
      return true;
    } catch {
      return false;
    }
  }
}

export default new ListingsService();