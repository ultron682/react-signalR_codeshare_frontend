import React, { useState, useContext } from "react";
import axios from "axios";
import "../Form.css";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5555/login", {
        email,
        password,
      });
      // Obsługa pomyślnego logowania
      login(response.data.accessToken);
      console.log("Login successful:", response.data.accessToken);
      navigate("/account");
    } catch (error) {
      // Obsługa błędu logowania
      console.error("Error logging in:", error);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" className="submit-btn">
          Login
        </button>
      </form>
      {/* <p className="toggle-text">Don't have an account? <span>Register here</span></p> */}
    </div>
  );
};

export default LoginForm;
