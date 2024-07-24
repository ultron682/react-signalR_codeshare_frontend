import React from "react";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

const Account = () => {
  const { user, logout } = useContext(AuthContext);

  const logoutHandler = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {user && (
        <div>
          Email: {user.email} potwierdzony: {user.isEmailConfirmed ? "tak" : "nie"}
          <button onClick={logoutHandler}>Wyloguj się</button>
          <h2>Twoje kody:</h2>
          {user && (
            <ul>
              {user.codeSnippets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};

export default Account;
