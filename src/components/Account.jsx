import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

const Account = () => {
  const [user, setUser] = useState({email: "", isEmailConfirmed: true});

  const fetchAccountInfo = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.get("http://localhost:5555/manage/info", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response.data);
      setUser(response.data);
      // Tutaj możesz przetworzyć dane, np. aktualizując stan komponentu
    } catch (error) {
      console.error("Błąd podczas pobierania informacji o koncie:", error);
      // Obsługa błędów, np. informowanie użytkownika
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  return <div>Account {user.email}  {user.isEmailConfirmed}</div>;
};

export default Account;