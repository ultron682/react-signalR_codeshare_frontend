import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const [uniqueId, setUniqueId] = useState("");

  const generateUniqueId = () => {
    return "xxxxx".replace(/x/g, () => {
      return Math.floor(Math.random() * 16).toString(16);
    });
  };

  useEffect(() => {
    setUniqueId(generateUniqueId());
  }, []);

  return (
    <div className="landing-container">
      <h1>Welcome to Code Base</h1>
      <p>Your journey with Awesome Code experiences starts here.</p>
      <Link to={uniqueId} className="landing-button">
        Generate New Code Space
      </Link>

      <div className="button-group">
        <Link to="/login" className="landing-button">
          Login
        </Link>
        <Link to="/register" className="landing-button">
          Register
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
