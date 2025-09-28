import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { createServer } from "http";
import { Server } from "socket.io";
import pool from "./Service.js";

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Test database connection (optional - won't crash if DB is down)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("[SUCCESS] Database connected successfully!");
    connection.release();
  } catch (err) {
    console.log("[WARNING] Database connection failed:", err.message);
    console.log("[INFO] Server will run without database connection");
  }
})();

// Basic routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Local Services Finder API is running!",
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    server: "running",
    timestamp: new Date().toISOString() 
  });
});

// User signup endpoint
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required!" 
      });
    }

    // Check if user already exists
    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists!" 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// User login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username/Email and password are required!" 
      });
    }

    // Find user in database by email OR username
    const [users] = await pool.execute(
      "SELECT id, username, email, password, role FROM users WHERE email = ? OR username = ?",
      [email, email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Your email and password is wrong please try it again" 
      });
    }

    const user = users[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Your email and password is wrong please try it again" 
      });
    }

    // Login successful - don't send password back
    const { password: userPassword, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: "Login successful!",
      user: userWithoutPassword
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// ================================
// LISTINGS MANAGEMENT ENDPOINTS
// ================================

/**
 * Middleware to verify user authentication
 */
const verifyAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    // Verify user exists in database
    const [users] = await pool.execute(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid user" 
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Authentication failed" 
    });
  }
};

/**
 * Middleware to verify provider role
 */
const verifyProvider = (req, res, next) => {
  if (req.user.role !== 'Service Provider') {
    return res.status(403).json({ 
      success: false, 
      message: "Only service providers can manage listings" 
    });
  }
  next();
};

/**
 * Input validation for listings
 */
const validateListingInput = (req, res, next) => {
  const { service_name, description, category, price, location_city, location_zip } = req.body;
  
  // Required fields validation
  if (!service_name || !category || !price || !location_city || !location_zip) {
    return res.status(400).json({
      success: false,
      message: "Service name, category, price, city, and ZIP code are required"
    });
  }

  // Price validation
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid positive number"
    });
  }

  // Service name length validation
  if (service_name.length > 255) {
    return res.status(400).json({
      success: false,
      message: "Service name cannot exceed 255 characters"
    });
  }

  // Category validation (predefined categories)
  const validCategories = [
    'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 
    'Gardening', 'Moving', 'Tutoring', 'Pet Care', 'Beauty', 'Other'
  ];
  
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category. Please select a valid category."
    });
  }

  next();
};

/**
 * CREATE - Post a new service listing
 * POST /api/listings
 */
app.post("/api/listings", verifyAuth, verifyProvider, validateListingInput, async (req, res) => {
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

    // Broadcast new listing to all connected clients
    if (newListing.length > 0) {
      io.emit('new_service_listing', {
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
});

/**
 * READ - Get provider's listings
 * GET /api/listings/provider/:provider_id
 */
app.get("/api/listings/provider/:provider_id", verifyAuth, async (req, res) => {
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
});

/**
 * UPDATE - Edit a listing
 * PUT /api/listings/:id
 */
app.put("/api/listings/:id", verifyAuth, verifyProvider, validateListingInput, async (req, res) => {
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
});

/**
 * DELETE - Remove a listing
 * DELETE /api/listings/:id
 */
app.delete("/api/listings/:id", verifyAuth, verifyProvider, async (req, res) => {
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
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete listing" 
    });
  }
});

/**
 * SEARCH - Search and filter listings with pagination
 * GET /api/listings/search
 * Query parameters: 
 *   - q: search keywords
 *   - category: filter by category
 *   - city: filter by city
 *   - zip: filter by ZIP code
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 12)
 *   - sort: sorting option (price_asc, price_desc, relevance, newest)
 */
app.get("/api/listings/search", async (req, res) => {
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
});

/**
 * SEED DATA ENDPOINT - Add sample services for demonstration
 * POST /api/seed-services
 */
app.post("/api/seed-services", async (req, res) => {
  try {
    // Sample services data
    const sampleServices = [
      {
        provider_id: 1, // Assumes a provider exists with ID 1
        service_name: "Professional House Cleaning",
        description: "Deep cleaning service for your home. We clean every corner with eco-friendly products and attention to detail.",
        category: "Cleaning",
        price: 85.00,
        availability: JSON.stringify({
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          hours: { start: "08:00", end: "17:00" }
        }),
        location_city: "New York",
        location_zip: "10001",
        image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400"
      },
      {
        provider_id: 1, // Assumes a provider exists with ID 1  
        service_name: "Emergency Plumbing Services",
        description: "24/7 emergency plumbing repairs including leak fixes, pipe installation, and drain cleaning by licensed professionals.",
        category: "Plumbing",
        price: 120.00,
        availability: JSON.stringify({
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          hours: { start: "00:00", end: "23:59" }
        }),
        location_city: "New York", 
        location_zip: "10002",
        image_url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400"
      }
    ];

    // Insert sample services
    for (const service of sampleServices) {
      const [result] = await pool.execute(
        `INSERT INTO service_listings 
         (provider_id, service_name, description, category, price, availability, location_city, location_zip, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [service.provider_id, service.service_name, service.description, service.category, 
         service.price, service.availability, service.location_city, service.location_zip, service.image_url]
      );

      // Get the complete listing with provider info for broadcasting
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

      // Broadcast each new listing
      if (newListing.length > 0) {
        io.emit('new_service_listing', {
          ...newListing[0],
          rating_average: 4.5,
          rating_count: Math.floor(Math.random() * 50) + 10
        });
      }
    }

    res.json({
      success: true,
      message: `${sampleServices.length} sample services added successfully`
    });

  } catch (error) {
    console.error("Seed services error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to seed services" 
    });
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
  console.log(`[HEALTH] Check: http://localhost:${PORT}/health`);
  console.log(`[API] Endpoint: http://localhost:${PORT}/`);
  console.log(`[SOCKET] WebSocket server ready`);
});
