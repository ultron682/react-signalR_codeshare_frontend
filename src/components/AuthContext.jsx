import React, {
  createContext,
  useState,
  useEffect,
  useStateCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("token") != null) {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchAccountInfo();
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
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
      const response = await axios.get("http://localhost:5555/account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ownerId: "d6ccb40e-d9e7-4b9d-8d9c-a68d32b00586",
        },
      });
      console.log(response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Błąd podczas pobierania informacji o koncie:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, isLoggedIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
