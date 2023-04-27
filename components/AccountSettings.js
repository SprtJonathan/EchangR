import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../redux/reducers/userSlice";

import styles from "./../pages/settings.module.css";

export default function AccountSettings() {
  const loggedUser = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [fname, setFname] = useState(loggedUser ? loggedUser.fname : "");
  const [lname, setLname] = useState(loggedUser ? loggedUser.lname : "");
  const [email, setEmail] = useState(loggedUser ? loggedUser.email : "");
  const [birthDate, setBirthDate] = useState(
    loggedUser ? loggedUser.birth_date : ""
  );
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loggedUser) {
      setFname(loggedUser.fname);
      setLname(loggedUser.lname);
      setEmail(loggedUser.email);
      setBirthDate(loggedUser.birth_date);
      // Et toutes les autres propriétés de loggedUser que vous voulez utiliser
    }
  }, [loggedUser]);

  const validateFields = () => {
    const namePattern = /^[a-zA-Z]+(-[a-zA-Z]+)?$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordPattern = /^.{8,}$/;

    if (!namePattern.test(fname) || !namePattern.test(lname)) {
      setMessage(
        "Les noms et prénoms ne doivent contenir que des lettres et '-' pour les noms composés."
      );
      return false;
    }

    if (!emailPattern.test(email)) {
      setMessage("Format d'adresse e-mail invalide.");
      return false;
    }

    const ageLimit = 13;
    const birthDateObject = new Date(birthDate);
    const limitDate = new Date();
    limitDate.setFullYear(limitDate.getFullYear() - ageLimit);

    if (birthDateObject > limitDate) {
      setMessage(
        `Vous devez avoir au moins ${ageLimit} ans pour vous inscrire.`
      );
      return false;
    }

    if (password !== "" && !passwordPattern.test(password)) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }

    if (password !== passwordConfirm) {
      setMessage("Les mots de passe ne correspondent pas.");
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

    // Vérifier si le mot de passe et la confirmation du mot de passe correspondent
    if (password !== passwordConfirm) {
      setMessage("Les mots de passe ne correspondent pas.");
      return false;
    }

    // Envoyer une requête PUT pour mettre à jour l'utilisateur
    try {
      const response = await fetch("/api/users/update-private", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: JSON.stringify({
          fname: fname,
          lname: lname,
          email: email,
          birth_date: birthDate,
          password: password,
          current_password: currentPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du compte.");
      }

      const { message, data, newToken } = await response.json();

      // Save the token in local storage
      localStorage.setItem("token", newToken);

      //location.reload();

      //   const { fname, lname, email } = data;
      //   // Mettre à jour le loggedUser dans Redux store avec les nouvelles informations
      //   dispatch(
      //     updateUser({
      //       fname: fname,
      //       lname: lname,
      //       email: email,
      //       birth_date: birth_date,
      //     })
      //   );

      // Réinitialiser le mot de passe et la confirmation du mot de passe
      setPassword("");
      setPasswordConfirm("");
      setCurrentPassword("");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du compte:", error);
      // Vous pouvez définir un message d'erreur ici pour informer l'utilisateur de l'échec de la mise à jour.
    }
  };

  const handleDateChange = (e) => {
    setBirthDate(e.target.value);
  };

  return (
    <>
      <h2>Modifier votre compte</h2>
      <div className={styles.content}>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="fname">
              Prénom :
            </label>
            <input
              type="text"
              id="fname"
              className={styles.input}
              value={fname}
              onChange={(e) => setFname(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="lname">
              Nom de famille :
            </label>
            <input
              type="text"
              id="lname"
              className={styles.input}
              value={lname}
              onChange={(e) => setLname(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Adresse Email :
            </label>
            <input
              type="text"
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="birthDate" className={styles.label}>
              Date de naissance :
            </label>
            <input
              type="date"
              id="birthDate"
              className={styles.input}
              name="birthDate"
              value={birthDate}
              onChange={handleDateChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Nouveau mot de passe :
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="passwordConfirm">
              Confirmation du nouveau mot de passe :
            </label>
            <input
              type="password"
              id="passwordConfirm"
              className={styles.input}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="currentPassword">
              Votre mot de passe actuel :
            </label>
            <input
              type="password"
              id="currentPassword"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.submitForm}>
            Mettre à jour
          </button>
        </form>
      </div>
    </>
  );
}
