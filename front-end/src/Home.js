import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Redirect based on user role
  useEffect(() => {
    if (!user.id) {
      navigate("/login");
      return;
    }

    // Auto-redirect based on role for better UX
    if (user.role === "Service Provider") {
      navigate("/provider-dashboard");
    } else if (user.role === "Customer") {
      navigate("/customer-search");
    }
  }, [navigate, user.id, user.role]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // If no user is logged in, redirect to login
  if (!user.id) {
    return null;
  }

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <h1>Welcome, {user.username}!</h1>
          <p className="user-role">Role: {user.role}</p>
          <p className="tagline">Find and book trusted local services instantly 🚀</p>
        </div>

        {/* Role-based navigation */}
        <div className="navigation-section">
          {user.role === "Service Provider" ? (
            <div className="provider-actions">
              <h3>Provider Actions</h3>
              <div className="action-buttons">
                <button 
                  className="nav-btn primary"
                  onClick={() => handleNavigation("/provider-dashboard")}
                >
                  📊 Manage Listings
                </button>
                <button 
                  className="nav-btn secondary"
                  onClick={() => handleNavigation("/customer-search")}
                >
                  🔍 Browse Services
                </button>
              </div>
            </div>
          ) : (
            <div className="customer-actions">
              <h3>Customer Actions</h3>
              <div className="action-buttons">
                <button 
                  className="nav-btn primary"
                  onClick={() => handleNavigation("/customer-search")}
                >
                  🔍 Find Services
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick service overview */}
        <div className="service-preview">
          <h3>Popular Services</h3>
          <div className="service-cards">
            <div className="card">
              <h4>🔧 Plumber</h4>
              <p>Quick fixes for leaks, taps & pipelines</p>
              <button onClick={() => handleNavigation("/customer-search")}>
                Browse
              </button>
            </div>
            <div className="card">
              <h4>⚡ Electrician</h4>
              <p>Fix electrical issues & installations safely</p>
              <button onClick={() => handleNavigation("/customer-search")}>
                Browse
              </button>
            </div>
            <div className="card">
              <h4>🧹 Cleaning</h4>
              <p>Deep cleaning for home & office spaces</p>
              <button onClick={() => handleNavigation("/customer-search")}>
                Browse
              </button>
            </div>
          </div>
        </div>

        <div className="home-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;