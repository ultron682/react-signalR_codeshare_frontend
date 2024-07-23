import React from "react";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";


const Account = () => {
  const { logout, getAccountInfo } = useContext(AuthContext);
  let user = null;
  const [snippets, setSnippets] = useState([""]);

  const fetchSnippets = async () => {
    const response = await axios.get("http://localhost:5555/manage/info", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    setSnippets(data);
  };

  const loadAccountInfo = () => {
    user = getAccountInfo();
    console.log(user);
  };

  useEffect(() => {
    loadAccountInfo();
    fetchSnippets();
  }, []);

  const logoutHandler = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      <div>
        {/* Account {user?.email} {user?.isEmailConfirmed} */}
        <button onClick={logoutHandler}>Wyloguj się</button>

        <ul>
          {snippets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Account;
