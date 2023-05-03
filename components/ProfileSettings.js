import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../redux/reducers/userSlice";

import ImagePreview from "./ImagePreview";

import styles from "./../pages/settings.module.css";
import utilStyles from "../styles/utils.module.css";

export default function ProfileSettings() {
  const loggedUser = useSelector((state) => state.user);
  const dispatch = useDispatch();

  //console.log(loggedUser);

  const [username, setUsername] = useState(loggedUser.username);
  const [display_name, setDisplayName] = useState(loggedUser.display_name);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profile_picture_url, setProfilePictureUrl] = useState(
    loggedUser.profile_picture_url
  );
  const [user_description, setDescription] = useState(
    loggedUser.user_description || ""
  );
  const [message, setMessage] = useState("");

  const handleAttachmentChange = (newAttachment) => {
    setProfilePicture(newAttachment);
  };

  const checkUsernameAvailability = async (username) => {
    if (loggedUser.username != username) {
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
    } else return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    // Vérifier si le nom d'utilisateur est disponible

    const usernamePattern = /^[a-zA-Z0-9-_]+$/;
    if (!usernamePattern.test(username) || username.includes(" ")) {
      setMessage(
        "Nom d'utilisateur invalide. Utilisez uniquement des lettres, des chiffres, '-' et '_' et ne pas utiliser des espaces."
      );
      return false;
    }

    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      return;
    }

    // Créer un objet FormData pour envoyer les données, y compris l'image
    const formData = new FormData();
    formData.append("username", username);
    formData.append("display_name", display_name);
    formData.append("description", user_description);

    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    // Envoyer une requête PUT pour mettre à jour l'utilisateur
    try {
      const response = await fetch("/api/users/update-public", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil.");
      }

      const { message, data, newToken } = await response.json();

      // Save the token in local storage
      localStorage.setItem("token", newToken);

      const { username, display_name, profile_picture_url, user_description } =
        data;
      // Mettre à jour le loggedUser dans Redux store avec les nouvelles informations
      dispatch(
        updateUser({
          username: username,
          display_name: display_name,
          profile_picture_url: profile_picture_url,
          user_description: user_description,
        })
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      // Vous pouvez définir un message d'erreur ici pour informer l'utilisateur de l'échec de la mise à jour.
    }
  };

  return (
    <>
      <h2>Modifier votre profil public</h2>
      <div className={styles.content}>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="username">
              Nom d'utilisateur unique :
            </label>
            <input
              type="text"
              id="username"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="displayName">
              Nom affiché :
            </label>
            <input
              type="text"
              id="displayName"
              className={styles.input}
              value={display_name}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="profilePicture">
              Image de profil
            </label>
            <ImagePreview
              className={utilStyles.borderCircle}
              attachments={profilePicture}
              onAttachmentsChange={handleAttachmentChange}
              type="profile-picture"
              defaultImage={profile_picture_url}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="user_description">
              Description :
            </label>
            <textarea
              id="user_description"
              className={styles.input}
              value={user_description}
              style={{ resize: "none" }}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className={styles.submitForm}>
            Mettre à jour
          </button>
        </form>
      </div>
    </>
  );
}
