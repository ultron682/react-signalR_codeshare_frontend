import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTrash, FaSignOutAlt } from "react-icons/fa";
import "./AccountDashboard.css";
import "react-toastify/dist/ReactToastify.css";

const AccountDashboard = () => {
  const { user, logout, deleteSnippet, fetchAccountInfo, changeNickname } =
    useContext(AuthContext);
  const location = useLocation();
  const [newNickname, setNewNickname] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user !== null) {
      setLoading(true);
      fetchAccountInfo().finally(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, [location]);

  const logoutHandler = () => {
    logout();
    window.location.href = "/";
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this snippet?"
    );
    if (!confirmDelete) return;

    try {
      await deleteSnippet(id);
      toast.success("Snippet deleted successfully!");
    } catch (error) {
      toast.error("Error deleting code");
      console.error("Error deleting code:", error);
    }
  };

  const handleNicknameChange = (e) => {
    e.preventDefault();
    changeNickname(newNickname);
    setNewNickname("");
    toast.success("Nickname changed successfully!");
  };

  return (
    <>
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        user && (
          <div className="dashboard-container">
            <h1 className="welcome-header">
              Witaj, {user.userName || "Użytkowniku"}!
            </h1>
            <button className="logout-button" onClick={logoutHandler}>
              <FaSignOutAlt /> Wyloguj się
            </button>
            <h2>Twoje kody:</h2>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(user.codeSnippets.length / 10) * 100}%` }}
              ></div>
            </div>
            <h3>
              W darmowej wersji konta możesz posiadać maksymalnie 10 dokumentów
            </h3>
            {user.codeSnippets.length > 0 ? (
              <ul className="code-list">
                {user.codeSnippets.map((item) => (
                  <li key={item.$id} className="code-item">
                    <Link to={"/" + item.uniqueId} className="code-link">
                      {item.uniqueId}
                    </Link>
                    <p>{item.code}</p>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.uniqueId)}
                    >
                      <FaTrash /> Usuń
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Jeszcze tu pusto</p>
            )}

            <form className="nickname-form" onSubmit={handleNicknameChange}>
              <label htmlFor="nickname">Nowy pseudonim:</label>
              <input
                type="text"
                id="nickname"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
              />
              <button type="submit">Zmień pseudonim</button>
            </form>
          </div>
        )
      )}
    </>
  );
};

export default AccountDashboard;
