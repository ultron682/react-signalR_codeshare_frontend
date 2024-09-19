import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTrash, FaSignOutAlt } from "react-icons/fa";
import "./AccountDashboard.css";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const AccountDashboard = () => {
  const { user, logout, deleteSnippet, fetchAccountInfo, changeNickname } =
    useContext(AuthContext);
  const location = useLocation();
  const [newNickname, setNewNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
    const confirmDelete = window.confirm(t("confirmDeleteSnippet"));
    if (!confirmDelete) return;

    try {
      await deleteSnippet(id);
      toast.success(t("snippetDeletedSuccess"));
    } catch (error) {
      toast.error(t("snippetDeletedError"));
      console.error(t("snippetDeletedErrorLog"), error);
    }
  };

  const handleNicknameChange = (e) => {
    setNewNickname(e.target.value);
  };

  const handleNicknameSubmit = async (e) => {
    e.preventDefault();
    try {
      await changeNickname(newNickname);
      toast.success(t("nicknameChangedSuccess"));
    } catch (error) {
      toast.error(t("nicknameChangedError"));
      console.error(t("nicknameChangedErrorLog"), error);
    }
  };

  return (
    <>
      {loading ? (
        <div className="loading-spinner">{t("loading")}</div>
      ) : (
        user && (
          <div className="dashboard-container">
            <h1 className="welcome-header">
              {t("welcomeUser", { userName: user.userName })}
            </h1>
            <button className="logout-button" onClick={logoutHandler}>
              <FaSignOutAlt /> {t("logout")}
            </button>
            <h2>Twoje kody:</h2>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(user.codeSnippets.length / 10) * 100}%` }}
              ></div>
            </div>
            <h3>{t("noPremium")}</h3>
            {user.codeSnippets.length > 0 ? (
              <ul className="code-list">
                {user.codeSnippets.map((item) => (
                  <Link to={"/" + item.uniqueId} className="code-link">
                    <li key={item.$id} className="code-item">
                      {item.uniqueId}

                      <p>{item.code}</p>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(item.uniqueId)}
                      >
                        <FaTrash /> {t("delete")}
                      </button>
                    </li>
                  </Link>
                ))}
              </ul>
            ) : (
              <p>{t("noSnippets")}</p>
            )}

            <form className="nickname-form" onSubmit={handleNicknameChange}>
              <label htmlFor="nickname">{t("newNickname")}</label>
              <input
                type="text"
                id="nickname"
                value={newNickname}
                onChange={handleNicknameChange}
              />
              <button type="submit">{t("changeNickname")}</button>
            </form>
          </div>
        )
      )}
    </>
  );
};

export default AccountDashboard;
