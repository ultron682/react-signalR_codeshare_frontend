import React, { createContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState({email: '', isEmailConfirmed: true});


  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);

    fetchAccountInfo();
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const isLoggedIn = () => {
    return token !== null;
  };

  const fetchAccountInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5555/manage/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setUser(response.data);
      return response.data;

    } catch (error) {
      console.error("Błąd podczas pobierania informacji o koncie:", error);
    }
  };

  const getAccountInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5555/snippet", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setUser(response.data);
      return response.data;

    } catch (error) {
      console.error("Błąd podczas pobierania informacji o koncie:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn, getAccountInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
