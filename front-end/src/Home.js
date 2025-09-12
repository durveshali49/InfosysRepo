import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome, {user?.username || "Guest"}!</h1>
        <p>Role: {user?.role}</p>
        <p className="tagline">Find and book trusted local services instantly 🚀</p>

        <div className="service-cards">
          <div className="card">
            <h3>Plumber</h3>
            <p>Quick fixes for leaks, taps & pipelines</p>
            <button>Book Now</button>
          </div>
          <div className="card">
            <h3>Electrician</h3>
            <p>Fix electrical issues & installations safely</p>
            <button>Book Now</button>
          </div>
          <div className="card">
            <h3>Cleaning</h3>
            <p>Deep cleaning for home & office spaces</p>
            <button>Book Now</button>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;