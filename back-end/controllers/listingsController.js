/**
 * Listings Controller
 * Handles all service listing operations (CRUD)
 */

import pool from '../config/database.js';

/**
 * Create new service listing
 * POST /api/listings
 */
export const createListing = async (req, res) => {
  try {
    const { 
      service_name, 
      description, 
      category, 
      price, 
      availability, 
      location_city, 
      location_zip, 
      image_url 
    } = req.body;

    const provider_id = req.user.id;

    // Parse availability JSON if provided
    let availabilityData = null;
    if (availability) {
      try {
        availabilityData = JSON.stringify(availability);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid availability format"
        });
      }
    }

    // Insert listing into database
    const [result] = await pool.execute(
      `INSERT INTO service_listings 
       (provider_id, service_name, description, category, price, availability, location_city, location_zip, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [provider_id, service_name, description, category, price, availabilityData, location_city, location_zip, image_url]
    );

    // Get the complete listing with provider info for real-time broadcast
    const [newListing] = await pool.execute(
      `SELECT 
        sl.listing_id, sl.service_name, sl.description, sl.category, sl.price, 
        sl.availability, sl.location_city, sl.location_zip, sl.image_url, 
        sl.created_at, u.username as provider_name
       FROM service_listings sl
       JOIN users u ON sl.provider_id = u.id
       WHERE sl.listing_id = ?`,
      [result.insertId]
    );

    // Broadcast new listing to all connected clients via socket.io
    if (newListing.length > 0 && req.io) {
      req.io.emit('new_service_listing', {
        ...newListing[0],
        rating_average: 4.5, // Placeholder
        rating_count: 0      // New service
      });
      console.log(`[SOCKET] New listing broadcasted: ${newListing[0].service_name}`);
    }

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing_id: result.insertId
    });

  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create listing" 
    });
  }
};

/**
 * Get provider's listings
 * GET /api/listings/provider/:provider_id
 */
export const getProviderListings = async (req, res) => {
  try {
    const provider_id = parseInt(req.params.provider_id);
    
    // Verify the authenticated user can access these listings
    if (req.user.id !== provider_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const [listings] = await pool.execute(
      `SELECT listing_id, service_name, description, category, price, 
              availability, location_city, location_zip, image_url, 
              created_at, updated_at
       FROM service_listings 
       WHERE provider_id = ? 
       ORDER BY created_at DESC`,
      [provider_id]
    );

    res.json({
      success: true,
      listings: listings,
      count: listings.length
    });

  } catch (error) {
    console.error("Get provider listings error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch listings" 
    });
  }
};

/**
 * Update listing
 * PUT /api/listings/:id
 */
export const updateListing = async (req, res) => {
  try {
    const listing_id = parseInt(req.params.id);
    const provider_id = req.user.id;

    // Check if listing exists and belongs to the provider
    const [existingListing] = await pool.execute(
      "SELECT provider_id FROM service_listings WHERE listing_id = ?",
      [listing_id]
    );

    if (existingListing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    if (existingListing[0].provider_id !== provider_id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own listings"
      });
    }

    const { 
      service_name, 
      description, 
      category, 
      price, 
      availability, 
      location_city, 
      location_zip, 
      image_url 
    } = req.body;

    // Parse availability JSON if provided
    let availabilityData = null;
    if (availability) {
      try {
        availabilityData = JSON.stringify(availability);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid availability format"
        });
      }
    }

    // Update listing
    await pool.execute(
      `UPDATE service_listings 
       SET service_name = ?, description = ?, category = ?, price = ?, 
           availability = ?, location_city = ?, location_zip = ?, image_url = ? 
       WHERE listing_id = ?`,
      [service_name, description, category, price, availabilityData, location_city, location_zip, image_url, listing_id]
    );

    res.json({
      success: true,
      message: "Listing updated successfully"
    });

  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update listing" 
    });
  }
};

/**
 * Delete listing
 * DELETE /api/listings/:id
 */
export const deleteListing = async (req, res) => {
  try {
    const listing_id = parseInt(req.params.id);
    const provider_id = req.user.id;

    // Check if listing exists and belongs to the provider
    const [existingListing] = await pool.execute(
      "SELECT provider_id FROM service_listings WHERE listing_id = ?",
      [listing_id]
    );

    if (existingListing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    if (existingListing[0].provider_id !== provider_id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own listings"
      });
    }

    // Delete listing
    await pool.execute(
      "DELETE FROM service_listings WHERE listing_id = ?",
      [listing_id]
    );

    res.json({
      success: true,
      message: "Listing deleted successfully"
    });

  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete listing" 
    });
  }
};

/**
 * Search listings with filters and pagination
 * GET /api/listings/search
 */
export const searchListings = async (req, res) => {
  try {
    const {
      q = '',           // search query
      category = '',    // category filter
      city = '',        // city filter
      zip = '',         // ZIP filter
      page = 1,         // pagination
      limit = 12,       // items per page
      sort = 'relevance' // sorting
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit))); // Max 50 items per page
    const offset = (pageNum - 1) * limitNum;

    // Build search conditions
    let whereConditions = [];
    let params = [];

    // Search in service name and description
    if (q && q.trim()) {
      whereConditions.push("(service_name LIKE ? OR description LIKE ?)");
      const searchTerm = `%${q.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    // Category filter
    if (category && category.trim()) {
      whereConditions.push("category = ?");
      params.push(category.trim());
    }

    // Location filters
    if (city && city.trim()) {
      whereConditions.push("location_city LIKE ?");
      params.push(`%${city.trim()}%`);
    }

    if (zip && zip.trim()) {
      whereConditions.push("location_zip = ?");
      params.push(zip.trim());
    }

    // Build ORDER BY clause
    let orderBy = "created_at DESC"; // default newest first
    switch (sort) {
      case 'price_asc':
        orderBy = "price ASC";
        break;
      case 'price_desc':
        orderBy = "price DESC";
        break;
      case 'newest':
        orderBy = "created_at DESC";
        break;
      case 'relevance':
      default:
        // For relevance, prioritize exact matches in service_name
        if (q && q.trim()) {
          orderBy = `
            CASE 
              WHEN service_name = ? THEN 1
              WHEN service_name LIKE ? THEN 2
              WHEN description LIKE ? THEN 3
              ELSE 4
            END, created_at DESC
          `;
          const searchTerm = q.trim();
          params.unshift(searchTerm, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        break;
    }

    // Build the main query
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const searchQuery = `
      SELECT 
        sl.listing_id, 
        sl.service_name, 
        sl.description, 
        sl.category, 
        sl.price, 
        sl.location_city, 
        sl.location_zip, 
        sl.image_url, 
        sl.created_at,
        u.username as provider_name
      FROM service_listings sl
      JOIN users u ON sl.provider_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    params.push(limitNum, offset);

    // Execute search query
    const [listings] = await pool.execute(searchQuery, params);

    // Get total count for pagination (without LIMIT/OFFSET)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM service_listings sl
      JOIN users u ON sl.provider_id = u.id
      ${whereClause}
    `;
    
    // Remove the pagination parameters for count query
    const countParams = params.slice(0, -2);
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        listings: listings.map(listing => ({
          ...listing,
          rating_average: 4.5, // Placeholder for future rating system
          rating_count: 23     // Placeholder for future rating system
        })),
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limitNum,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters: {
          query: q,
          category,
          city,
          zip,
          sort
        }
      }
    });

  } catch (error) {
    console.error("Search listings error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to search listings" 
    });
  }
};

export default {
  createListing,
  getProviderListings,
  updateListing,
  deleteListing,
  searchListings,
};