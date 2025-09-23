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

  const handleSignup = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!form.role) {
      setError("Please select a role!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user info in localStorage for session management
        localStorage.setItem("user", JSON.stringify({
          id: data.userId,
          username: form.username,
          email: form.email,
          role: form.role,
        }));
        navigate("/home");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Network error. Please try again.");
    }
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