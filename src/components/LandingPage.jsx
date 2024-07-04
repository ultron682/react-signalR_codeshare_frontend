import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <h1>Welcome to Our App</h1>
      <p>Your journey to awesome experiences starts here.</p>
      <div className="button-group">
        <Link to="/login" className="landing-button">Login</Link>
        <Link to="/register" className="landing-button">Register</Link>
      </div>
    </div>
  );
};

export default LandingPage;
