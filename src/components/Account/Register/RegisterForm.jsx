import React, { useState } from "react";
import axios from "axios";
import "../Form.css";
import { Link } from "react-router-dom";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5555/account/register",
        {
          username,
          email,
          password,
        }
      );
      // Obsługa pomyślnej rejestracji
      console.log("Registration successful:", response.data);
      setSuccess("Registration successful. You can now log in.");
      setError("");
    } catch (error) {
      // Obsługa błędu rejestracji
      console.error("Error registering:", error);
      setError("Registration failed. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <button type="submit" className="submit-btn">
          Register
        </button>
      </form>
      <Link to="/account/login" className="account-link">
        Already have an account? <span>Login here</span>
      </Link>
    </div>
  );
};

export default RegisterForm;
