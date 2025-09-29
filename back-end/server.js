import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration imports
import SERVER_CONFIG from "./config/server.js";
import pool, { testConnection } from "./config/database.js";

// Controller imports
import authController from "./controllers/authController.js";
import listingsController from "./controllers/listingsController.js";

// Middleware imports
import { verifyAuth, verifyProvider } from "./middleware/auth.js";
import { validateListingInput, validateUserRegistration, validateLoginInput } from "./middleware/validation.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: SERVER_CONFIG.CORS
});

// Middleware
app.use(cors(SERVER_CONFIG.CORS));
app.use(express.json({ limit: SERVER_CONFIG.BODY_LIMITS.json }));
app.use(express.urlencoded({ extended: true, limit: SERVER_CONFIG.BODY_LIMITS.urlencoded }));

// Add socket.io instance to request object for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Test database connection
testConnection();

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

// Authentication routes
app.post("/signup", validateUserRegistration, authController.signup);
app.post("/login", validateLoginInput, authController.login);

// ================================
// API ROUTES
// ================================

// Listings routes - RESTful API
app.post("/api/listings", verifyAuth, verifyProvider, validateListingInput, listingsController.createListing);
app.get("/api/listings/provider/:provider_id", verifyAuth, listingsController.getProviderListings);
app.put("/api/listings/:id", verifyAuth, verifyProvider, validateListingInput, listingsController.updateListing);
app.delete("/api/listings/:id", verifyAuth, verifyProvider, listingsController.deleteListing);
app.get("/api/listings/search", listingsController.searchListings);

// Socket.IO middleware for real-time features
export const broadcastNewListing = (io, listing) => {
  io.emit('new_service_listing', {
    ...listing,
    rating_average: 4.5, // Placeholder
    rating_count: 0      // New service
  });
  console.log(`[SOCKET] New listing broadcasted: ${listing.service_name}`);
};

// Development seed data endpoint
app.post("/api/seed-services", async (req, res) => {
  if (SERVER_CONFIG.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: "Seed endpoint disabled in production"
    });
  }

  try {
    // Sample services data for development
    const sampleServices = [
      {
        provider_id: 1,
        service_name: "Professional House Cleaning",
        description: "Deep cleaning service for your home. We clean every corner with eco-friendly products.",
        category: "Cleaning",
        price: 1500.00, // Indian pricing
        availability: JSON.stringify({
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          hours: { start: "08:00", end: "17:00" }
        }),
        location_city: "Mumbai",
        location_zip: "400001",
        image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400"
      },
      {
        provider_id: 1,
        service_name: "Emergency Plumbing Services", 
        description: "24/7 emergency plumbing repairs including leak fixes and pipe installation.",
        category: "Plumbing",
        price: 800.00, // Indian pricing
        availability: JSON.stringify({
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          hours: { start: "00:00", end: "23:59" }
        }),
        location_city: "Mumbai",
        location_zip: "400002", 
        image_url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400"
      }
    ];

    let insertedCount = 0;
    for (const service of sampleServices) {
      const [result] = await pool.execute(
        `INSERT INTO service_listings 
         (provider_id, service_name, description, category, price, availability, location_city, location_zip, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [service.provider_id, service.service_name, service.description, service.category,
         service.price, service.availability, service.location_city, service.location_zip, service.image_url]
      );
      insertedCount++;
    }

    res.json({
      success: true,
      message: `${insertedCount} sample services added successfully`
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
httpServer.listen(SERVER_CONFIG.PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${SERVER_CONFIG.PORT}`);
  console.log(`[HEALTH] Check: http://localhost:${SERVER_CONFIG.PORT}/health`);
  console.log(`[API] Endpoint: http://localhost:${SERVER_CONFIG.PORT}/`);
  console.log(`[SOCKET] WebSocket server ready`);
  console.log(`[ENV] Environment: ${SERVER_CONFIG.NODE_ENV}`);
});
