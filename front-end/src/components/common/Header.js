/**
 * Header Navigation Component
 * Consolidated header with logo, search, location, and user menu
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, User, Bell, ChevronDown, LogOut, Home as HomeIcon 
} from 'lucide-react';
import { INDIAN_CITIES } from '../../config/constants.js';
import { clearCurrentUser } from '../../utils/helpers.js';
import './Header.css';

const Header = ({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  selectedLocation, 
  setSelectedLocation,
  onSearch 
}) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/");
  };

  const handleProfileMenuToggle = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <header className="consolidated-header">
      <div className="header-container">
        {/* Logo and Location */}
        <div className="header-left">
          <div className="logo">
            <HomeIcon size={28} />
            <span className="logo-text">LocalServices</span>
          </div>
          
          <div className="header-location">
            <MapPin size={18} />
            <span className="location-text">{selectedLocation}</span>
            <select 
              className="location-dropdown"
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {INDIAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="header-center">
          <div className="header-search">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search for services (e.g., plumbing, cleaning)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn-header" onClick={onSearch}>
              Search
            </button>
          </div>
        </div>
        
        {/* User Menu */}
        <div className="header-right">
          <button className="header-item">
            <Bell size={20} />
          </button>
          
          <div className="profile-dropdown" onClick={handleProfileMenuToggle}>
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
  );
};

export default Header;