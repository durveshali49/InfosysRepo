import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!form.role) {
      setError("Please select a role!");
      return;
    }

    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(form));
    navigate("/home");
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSignup} className="form-box">
        <h2>Create Account</h2>

        {error && <p className="error">{error}</p>}

        <label>Username</label>
        <input
          type="text"
          name="username"
          placeholder="Enter your name"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <label>Select Role</label>
        <div className="role-buttons">
          <button
            type="button"
            className={form.role === "Service Provider" ? "active" : ""}
            onClick={() => setForm({ ...form, role: "Service Provider" })}
          >
            Service Provider
          </button>
          <button
            type="button"
            className={form.role === "Customer" ? "active" : ""}
            onClick={() => setForm({ ...form, role: "Customer" })}
          >
            Customer
          </button>
        </div>

        <button type="submit" className="primary-btn">
          Sign Up
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;