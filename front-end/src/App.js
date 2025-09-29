import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Signup, Login } from "./pages/Auth";
import Landing from "./pages/Landing";
import ProviderDashboard from "./pages/ProviderDashboard";
import CustomerSearch from "./pages/CustomerSearch";
import "./App.css";

const LandingIntro = () => {
  return (
    <div className="form-container">
      <div className="form-box landing-card">
        <h1 className="landing-title">Local Service Finder & Booking Platform</h1>
        <p className="landing-tagline">Find trusted services around you and book instantly</p>
        <div className="landing-buttons">
          <Link to="/signup" className="landing-link">
            <button className="landing-btn">Sign Up</button>
          </Link>
          <Link to="/login" className="landing-link">
            <button className="landing-btn">Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingIntro />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/customer-search" element={<CustomerSearch />} />
      </Routes>
    </Router>
  );
}

export default App;