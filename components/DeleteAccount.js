import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteUser } from "../redux/reducers/userSlice";
import Modal from "./Modal";
import styles from "./../pages/settings.module.css";

export default function DeleteAccount() {
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const validateFields = () => {
    const passwordPattern = /^.{8,}$/;

    if (password === "") {
      setMessage("Veuillez entrer votre mot de passe actuel.");
      return false;
    }

    if (!passwordPattern.test(password)) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/users/delete-account", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
        body: JSON.stringify({
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du compte.");
      }

      // Supprimer le loggedUser dans Redux store et le token local
      dispatch(deleteUser());
      localStorage.removeItem("token");

      // Afficher la modale de confirmation
      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
    }
  };

  return (
    <>
      <h2>Supprimer votre compte</h2>
      <div className={styles.content}>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Votre mot de passe actuel :
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.deleteButton}>
            Supprimer le compte
          </button>
        </form>
        <Modal show={showModal}>
          <h3>Votre compte a été supprimé avec succès.</h3>
          <button onClick={() => setShowModal(false)}>Fermer</button>
        </Modal>
      </div>
    </>
  );
}
