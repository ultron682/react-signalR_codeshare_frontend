import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";


const LandingPage = () => {
    let navigate = useNavigate(); 

    const generateUniqueId = () => {
        return "xxxxx".replace(/x/g, () => {
          return Math.floor(Math.random() * 16).toString(16);
        });
      };

  const GenerateNewCodeHub = () => {
    const generatedId = generateUniqueId();
    navigate(`${generatedId}`);
  };

  return (
    <div className="landing-container">
      <h1>Welcome to Code Base</h1>
      <p>Your journey to awesome experiences starts here.</p>
      <button onClick={GenerateNewCodeHub} >Generate New CodeHub</button>

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
