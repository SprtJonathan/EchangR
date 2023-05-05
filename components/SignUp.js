import { useState } from "react";

import styles from "./Auth.module.css";
import utilStyles from "../styles/utils.module.css";
import ImagePreview from "./ImagePreview";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState("");

  const handleAttachmentChange = (newAttachment) => {
    setProfilePicture(newAttachment);
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await fetch(
        `/api/users/check-username?username=${username.toLocaleLowerCase()}`
      );
      const data = await response.json();
      console.log(data);

      if (data.available === false) {
        setMessage("Ce nom d'utilisateur est déjà pris.");
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la disponibilité du nom d'utilisateur:",
        error
      );
      setMessage(
        "Erreur lors de la vérification de la disponibilité du nom d'utilisateur."
      );
      return false;
    }
  };

  const handleDateChange = (e) => {
    setBirthDate(e.target.value);
  };

  const validateFields = async () => {
    const usernamePattern = /^[a-zA-Z0-9-_]+$/;
    const namePattern = /^[a-zA-Z]+(-[a-zA-Z]+)?$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordPattern = /^.{8,}$/;

    if (!usernamePattern.test(username) || username.includes(" ")) {
      setMessage(
        "Nom d'utilisateur invalide. Utilisez uniquement des lettres, des chiffres, '-' et '_' et ne pas utiliser des espaces."
      );
      return false;
    }

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

    if (!passwordPattern.test(password)) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }

    if (!(await checkUsernameAvailability(username))) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(await validateFields())) {
      return;
    }

    const formData = new FormData();
    formData.append("username", username.toLocaleLowerCase());
    formData.append("displayName", displayName);
    formData.append("description", description);
    formData.append("fname", fname);
    formData.append("lname", lname);
    formData.append("email", email);
    formData.append("birthDate", birthDate);
    formData.append("password", password);
    formData.append("action", "signup");

    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    try {
      const response = await fetch("/api/users/signup", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Une erreur s'est produite.");
      }

      const data = await response.json();
      window.location.reload();
      // console.log("Nouvel utilisateur créé:", data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  return (
    <div className={styles.formWrapper}>
      <form onSubmit={handleSubmit}>
        {/* Ajout de la zone d'affichage des messages d'erreur */}
        {message && <div className={utilStyles.errorMessage}>{message}</div>}
        <h4>Informations publiques</h4>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="profilePicture">
            Image de profil
          </label>
          <ImagePreview
            className={utilStyles.borderCircle}
            attachments={profilePicture}
            onAttachmentsChange={handleAttachmentChange}
            type="profile-picture"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="username">
            Nom unique d'utilisateur
          </label>
          <div className={styles.uniqueUsername}>
            <span className={styles.inputDouble}>@</span>
            <input
              type="text"
              id="username"
              className={styles.inputDouble}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="displayName">
            Nom d'utilisateur affiché
          </label>
          <input
            type="text"
            id="displayName"
            className={styles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="description">
            Description du profil
          </label>
          <input
            type="textarea"
            id="description"
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <hr></hr>
        <h4>Informations privées</h4>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="fname">
            Prénom
          </label>
          <input
            type="text"
            id="fname"
            className={styles.input}
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="lname">
            Nom de famille
          </label>
          <input
            type="text"
            id="lname"
            className={styles.input}
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Adresse e-mail
          </label>
          <input
            type="email"
            id="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            value={birthDate}
            onChange={handleDateChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className={styles.submitForm} type="submit">
          Créer un compte
        </button>
      </form>
    </div>
  );
}
