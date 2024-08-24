import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./AccountDashboard.css"; // Dodajemy osobny plik CSS

const AccountDashboard = () => {
  const {
    user,
    logout,
    deleteSnippet,
    fetchAccountInfo,
    resendConfirmationEmail,
    changeNickname,
  } = useContext(AuthContext);
  const location = useLocation();
  const [emailResent, setEmailResent] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  useEffect(() => {
    if (user !== null) fetchAccountInfo(); // refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleResendEmail = async () => {
    try {
      await resendConfirmationEmail();
      setEmailResent(true);
    } catch (error) {
      console.error("Error resending confirmation email:", error);
    }
  };

  const handleNicknameChange = (e) => {
    e.preventDefault();
    changeNickname(newNickname);
  };

  return (
    <>
      {user && (
        <div className="dashboard-container">
          <h1 className="welcome-header">
            Witaj, {user.userName || "Użytkowniku"}!
          </h1>
          <p className="email-status">
            Email: {user.email} potwierdzony:{" "}
            {user.emailConfirmed ? "tak" : "nie"}
          </p>

          {!user.emailConfirmed && (
            <div className="email-confirmation-box">
              <p>Twój adres e-mail nie został potwierdzony.</p>
              <p>
                Proszę sprawdzić swoją skrzynkę pocztową, aby potwierdzić konto.
              </p>
              {emailResent ? (
                <p className="email-resent-message">
                  Email został ponownie wysłany!
                </p>
              ) : (
                <button
                  className="resend-email-button"
                  onClick={handleResendEmail}
                >
                  Wyślij ponownie e-mail potwierdzający
                </button>
              )}
            </div>
          )}

          <button className="logout-button" onClick={logoutHandler}>
            Wyloguj się
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
          {user && (
            <ul className="code-list">
              {user.codeSnippets.length > 0 ? (
                user.codeSnippets.map((item) => (
                  <li key={item.$id} className="code-item">
                    <Link to={"/" + item.uniqueId} className="code-link">
                      {item.uniqueId}
                    </Link>
                    <p>{item.code}</p>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.uniqueId)}
                    >
                      Usuń
                    </button>
                  </li>
                ))
              ) : (
                <p>Jeszcze tu pusto</p>
              )}
            </ul>
          )}

          <form onSubmit={handleNicknameChange}>
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
      )}
    </>
  );
};

export default AccountDashboard;
