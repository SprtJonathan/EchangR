import { useState } from "react";

import styles from "./NewDM.module.css";

const NewDirectMessage = ({ sender_id }) => {
  const [recipientUsername, setRecipientUsername] = useState("");
  const [message, setMessage] = useState("");
  const [displayNewMessageForm, setDisplayNewMessageForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    // Recherche de l'ID du destinataire en fonction du nom d'utilisateur
    const recipientResponse = await fetch(
      `/api/users/username-${recipientUsername}`
    );
    if (!recipientResponse.ok) {
      alert("Erreur lors de la recherche du destinataire");
      return;
    }
    const recipient = await recipientResponse.json();
    const recipientId = recipient.user_id;
    const sent_date = new Date();

    const response = await fetch("/api/users/direct-messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_id: sender_id,
        recipient_id: recipientId,
        message,
        sent_date,
      }),
    });

    if (response.ok) {
      setRecipientUsername("");
      setMessage("");
      alert("Message envoyé avec succès");
    } else {
      alert("Erreur lors de l'envoi du message");
    }
  };

  return (
    <>
      {!displayNewMessageForm ? (
        <button
          className={styles.toggleNewMessage}
          onClick={() => setDisplayNewMessageForm(true)}
        >
          Nouveau Message
        </button>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <button onClick={() => setDisplayNewMessageForm(false)}>
            Fermer
          </button>
          <h2>Envoyer un nouveau message</h2>
          <label htmlFor="recipientUsername">Nom (@) du destinataire :</label>
          <input
            id="recipientUsername"
            type="text"
            value={recipientUsername}
            onChange={(e) => setRecipientUsername(e.target.value)}
          />
          <label htmlFor="message">Message :</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <br />
          <button type="submit">Envoyer</button>
        </form>
      )}
    </>
  );
};

export default NewDirectMessage;
