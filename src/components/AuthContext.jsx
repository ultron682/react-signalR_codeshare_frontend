import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("token") !== null) {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const fetchAccountInfo = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5555/account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Błąd podczas pobierania informacji o koncie:", error);

      if (error.response.status === 401) {
        logout();
      }
    }
  }, [token]);

  const deleteSnippet = async (id) => {
    try {
      await axios.delete(`http://localhost:5555/account/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAccountInfo();
    } catch (error) {
      console.error("Błąd podczas usuwania kodu:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAccountInfo();
    }
  }, [token, fetchAccountInfo]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  const isLoggedIn = () => { // to remove
    return token !== "";
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isLoggedIn,
        deleteSnippet,
        fetchAccountInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
