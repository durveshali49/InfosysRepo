import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, MapPin, Star, User, Bell, ChevronDown, LogOut,
  Wrench, Zap, Sparkles, Home as HomeIcon, Paintbrush, 
  Scissors, Laptop, Phone, Mail, Facebook, Twitter, Instagram,
  ArrowRight, Headphones, Clock, IndianRupee, Car, Bug, Wind, 
  Dumbbell, TreePine, Camera, Gamepad2, Stethoscope, GraduationCap,
  TrendingUp, Gift, ShieldCheck, Repeat2
} from "lucide-react";
import { io } from "socket.io-client";
import "./Home.css";
import "./Landing.css";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // State management
  const [recentServices, setRecentServices] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Mumbai");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Available locations - Indian cities
  const locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"];

  // Main Categories - Urban Company Style (Top Categories Above the Fold)
  const mainCategories = [
    { 
      name: "Home Cleaning", 
      icon: Sparkles, 
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      services: "Deep cleaning, Regular cleaning, Move-in/out",
      popular: true,
      link: "/cleaning"
    },
    { 
      name: "Appliance Repair", 
      icon: Wrench, 
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      services: "Washing machine, Refrigerator, Microwave",
      popular: true,
      link: "/appliance-repair"
    },
    { 
      name: "Pest Control", 
      icon: Bug, 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      services: "Cockroach, Termite, Bedbugs treatment",
      popular: true,
      link: "/pest-control"
    },
    { 
      name: "Plumbing & Carpentry", 
      icon: Wrench, 
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop",
      services: "Pipe repair, Furniture assembly, Installation",
      popular: true,
      link: "/plumbing-carpentry"
    },
    { 
      name: "Electrician", 
      icon: Zap, 
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      services: "Wiring, Switch/socket, Fan installation",
      popular: true,
      link: "/electrician"
    },
    { 
      name: "Men's Grooming", 
      icon: Scissors, 
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
      services: "Haircut, Beard styling, Massage",
      popular: true,
      link: "/mens-grooming"
    },
    { 
      name: "Women's Salon at Home", 
      icon: Paintbrush, 
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      services: "Hair styling, Facial, Manicure/Pedicure",
      popular: true,
      link: "/womens-salon"
    },
    { 
      name: "AC/Cooler Repair", 
      icon: Wind, 
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
      services: "AC service, Installation, Gas refill",
      popular: true,
      link: "/ac-repair"
    }
  ];

  // Popular Categories - Secondary Section Below Main Grid
  const popularCategories = [
    { name: "Tech Support", icon: Laptop, services: "Computer, Mobile, Installation" },
    { name: "Fitness Trainer", icon: Dumbbell, services: "Personal training, Yoga, Diet" },
    { name: "Gardening", icon: TreePine, services: "Landscaping, Plant care, Maintenance" },
    { name: "Photography", icon: Camera, services: "Events, Portraits, Product shoots" },
    { name: "Gaming Setup", icon: Gamepad2, services: "Console setup, PC build, Streaming" },
    { name: "Health Checkup", icon: Stethoscope, services: "Blood test, Doctor visit, Consultation" },
    { name: "Tutoring", icon: GraduationCap, services: "Academic subjects, Test prep, Languages" },
    { name: "Car Service", icon: Car, services: "Washing, Repair, Maintenance" }
  ];

  // Why Choose Us - Trust Building Section with Indian market focus
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: "Verified Professionals",
      description: "All service providers are background verified and police verified for your safety"
    },
    {
      icon: IndianRupee,
      title: "Transparent Pricing",
      description: "No hidden charges. All prices in Indian Rupees with clear breakdowns"
    },
    {
      icon: Repeat2,
      title: "Service Guarantee",
      description: "100% satisfaction guarantee or we'll redo the service at no extra cost"
    },
    {
      icon: Clock,
      title: "On-Time Service",
      description: "Punctual service delivery that respects your valuable time"
    }
  ];

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    if (!user.id) {
      navigate("/login");
      return;
    }

    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('new_service_listing', (newService) => {
      setRecentServices(prev => [newService, ...prev.slice(0, 5)]);
    });

    // Fetch initial services
    fetchRecentServices();

    return () => {
      newSocket.close();
    };
  }, [navigate, user.id]);

  // Fetch recent services from the API  
  const fetchRecentServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/listings/search?limit=6&sort=newest');
      const data = await response.json();
      
      if (data.success && data.data.listings) {
        setRecentServices(data.data.listings);
      }
    } catch (error) {
      console.error('Error fetching recent services:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSearch = () => {
    navigate("/customer-search");
  };

  const handleCategoryClick = (category) => {
    navigate("/customer-search");
  };

  // If no user is logged in, redirect to login
  if (!user.id) {
    return null;
  }

  return (
    <div className="urban-home">
      {/* Consolidated Header Navigation */}
      <header className="consolidated-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <HomeIcon size={28} />
              <span className="logo-text">LocalServices</span>
            </div>
            
            {/* Location Selector - Integrated beside logo */}
            <div className="header-location">
              <MapPin size={18} />
              <span className="location-text">{selectedLocation}</span>
              <select 
                className="location-dropdown"
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </div>
          
          <div className="header-center">
            <div className="header-search">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search for services (e.g., plumbing, cleaning)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn-header" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
          
          <div className="header-right">
            <button className="header-item">
              <Bell size={20} />
            </button>
            
            <div className="profile-dropdown" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="profile-avatar">
                <User size={18} />
              </div>
              <span className="profile-name">{user.username}</span>
              <ChevronDown size={16} />
              
              {showProfileMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">My Bookings</div>
                  <div className="dropdown-item">Profile Settings</div>
                  <div className="dropdown-item">Payment Methods</div>
                  {user.role === "Service Provider" && (
                    <div className="dropdown-item" onClick={() => navigate("/provider-dashboard")}>
                      Provider Dashboard
                    </div>
                  )}
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Categories Section - Above the Fold */}
      <section className="main-categories">
        <div className="section-container">
          <div className="section-header">
            <h2>Book top categories</h2>
            <p>Most booked services</p>
          </div>
          
          <div className="categories-grid-main">
            {mainCategories.map((category, index) => (
              <div key={index} className="category-card-main" onClick={() => handleCategoryClick(category)}>
                <div className="category-image">
                  <img src={category.image} alt={category.name} loading="lazy" />
                  <div className="category-overlay">
                    <category.icon size={32} className="category-icon" />
                  </div>
                </div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p>{category.services}</p>
                </div>
                {category.popular && (
                  <div className="popular-badge">
                    <TrendingUp size={14} />
                    Popular
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Trust Building */}
      <section className="why-choose-us">
        <div className="section-container">
          <div className="section-header">
            <h2>Why book with LocalServices?</h2>
            <p>Trusted by millions across the country</p>
          </div>
          
          <div className="trust-features">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="trust-feature">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <div className="feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Section - Horizontal Scroll */}
      <section className="popular-categories">
        <div className="section-container">
          <div className="section-header">
            <h2>New and noteworthy</h2>
            <p>Fresh out of our catalogue</p>
          </div>
          
          <div className="categories-scroll">
            <div className="scroll-container">
              {popularCategories.map((category, index) => (
                <div key={index} className="category-card-small" onClick={() => handleCategoryClick(category)}>
                  <div className="category-icon-small">
                    <category.icon size={24} />
                  </div>
                  <div className="category-info">
                    <h4>{category.name}</h4>
                    <p>{category.services}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services & Deals */}
      <section className="featured-services">
        <div className="section-container">
          <div className="section-header">
            <h2>Great deals</h2>
            <div className="live-indicator">
              <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
              <span>Live Updates</span>
            </div>
          </div>
          
          <div className="deals-grid">
            {recentServices.length > 0 ? (
              recentServices.slice(0, 4).map((service) => (
                <div key={service.listing_id} className="deal-card">
                  <div className="deal-image">
                    <img 
                      src={service.image_url || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop`}
                      alt={service.service_name}
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop`;
                      }}
                    />
                    <div className="deal-badge">
                      <Gift size={16} />
                      Deal
                    </div>
                  </div>
                  
                  <div className="deal-content">
                    <h4>{service.service_name}</h4>
                    <p className="deal-description">
                      {service.description ? service.description.substring(0, 80) + '...' : 'Professional service with great deals'}
                    </p>
                    
                    <div className="deal-meta">
                      <div className="rating">
                        <Star size={14} fill="#FFD700" color="#FFD700" />
                        <span>{service.rating_average || '4.8'}</span>
                        <span className="reviews">({Math.floor(Math.random() * 200) + 50} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="deal-pricing">
                      <div className="price-section">
                        <span className="original-price">₹{(parseFloat(service.price) * 1.2).toFixed(0)}</span>
                        <span className="deal-price">₹{service.price}</span>
                        <span className="discount">20% OFF</span>
                      </div>
                      <button className="book-deal-btn" onClick={handleSearch}>
                        Book Now
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Show promotional deals when no services - Indian market pricing
              [
                { name: "Deep Home Cleaning", category: "Cleaning", price: 1499, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop" },
                { name: "AC Service & Repair", category: "Appliance", price: 899, image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=250&fit=crop" },
                { name: "Plumbing Service", category: "Plumbing", price: 599, image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=250&fit=crop" },
                { name: "Electrical Work", category: "Electrical", price: 799, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=250&fit=crop" }
              ].map((deal, index) => (
                <div key={index} className="deal-card">
                  <div className="deal-image">
                    <img src={deal.image} alt={deal.name} />
                    <div className="deal-badge">
                      <Gift size={16} />
                      Deal
                    </div>
                  </div>
                  
                  <div className="deal-content">
                    <h4>{deal.name}</h4>
                    <p className="deal-description">Professional {deal.category.toLowerCase()} service with special discount</p>
                    
                    <div className="deal-meta">
                      <div className="rating">
                        <Star size={14} fill="#FFD700" color="#FFD700" />
                        <span>4.8</span>
                        <span className="reviews">({Math.floor(Math.random() * 200) + 50} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="deal-pricing">
                      <div className="price-section">
                        <span className="original-price">₹{(deal.price * 1.2).toFixed(0)}</span>
                        <span className="deal-price">₹{deal.price}</span>
                        <span className="discount">20% OFF</span>
                      </div>
                      <button className="book-deal-btn" onClick={handleSearch}>
                        Book Now
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>LocalServices</h3>
              <p>Your trusted platform for finding professional home services.</p>
              <div className="social-links">
                <Facebook size={20} />
                <Twitter size={20} />
                <Instagram size={20} />
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li>House Cleaning</li>
                <li>Plumbing</li>
                <li>Electrical Work</li>
                <li>Beauty Services</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>How it Works</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Safety</li>
                <li>Contact Us</li>
                <li>
                  <Headphones size={16} />
                  24/7 Support
                </li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <Phone size={16} />
                  <span>1-800-LOCAL-SVC</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <span>help@localservices.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 LocalServices. All rights reserved.</p>
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;