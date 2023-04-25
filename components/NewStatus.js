import { useState } from "react";
import { useSelector } from "react-redux";

import styles from "./Status.module.css";

const NewStatus = ({ addStatusFunction }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const loggedUser = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      console.log(status);
      const response = await fetch("/api/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du status");
      }

      setSuccess(true);
      setStatus("");
      addStatusFunction(loggedUser.user_id);
    } catch (err) {
      setError(err.message || "Erreur lors de la création du status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.newWrapper}>
      <h2 className={styles.newStatusTitle}>Publier un nouveau status</h2>
      <form onSubmit={handleSubmit} className={styles.newStatusForm}>
        <div className={styles.statusTextContainer}>
          <input
            type="textarea"
            id="status"
            name="status"
            value={status}
            maxLength="256"
            onChange={(e) => setStatus(e.target.value)}
            className={styles.statusText}
            draggable={false}
            required
          />
          <div className={styles.characterCounter}>{status.length}/256</div>{" "}
          {/* Compteur de caractères */}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Envoi en cours..." : "Publier"}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {/* {success && <div className="success">Status créé avec succès !</div>} */}
    </div>
  );
};

export default NewStatus;
