import React, { useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Account = () => {
  const { user, logout, deleteSnippet, fetchAccountInfo } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if(user !== null)
    fetchAccountInfo(); // refresh
  }, [location]);

  const logoutHandler = () => {
    logout();
    window.location.href = "/";
  };

  const handleDelete = async (id) => {
    console.log("Deleting code with id:", id);
    try {
      await deleteSnippet(id);
    } catch (error) {
      console.error("Error deleting code:", error);
    }
  };

  return (
    <>
      {user && (
        <div>
          Email: {user.email} potwierdzony:{" "}
          {user.isEmailConfirmed ? "tak" : "nie"}
          <button onClick={logoutHandler}>Wyloguj się</button>
          <h2>Twoje kody:</h2>
          {user && (
            <ul>
              {user.codeSnippets.map((item) => (
                <li key={item.$id}>
                  <Link to={"/" + item.uniqueId}>{item.uniqueId}</Link>
                  <p>{item.code}</p>
                  <button onClick={() => handleDelete(item.uniqueId)}>Usuń</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};

export default Account;
