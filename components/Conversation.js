import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import styles from "./Conversation.module.css";

const Conversation = ({ conversation, user_id, closeConversation }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const lastMessageRef = useRef(null);

  const fetchMessages = async () => {
    const response = await fetch(
      `/api/users/direct-messages?sender_id=${conversation.sender_id}&recipient_id=${conversation.recipient_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    //console.log(data);
    setMessages(data);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return `Aujourd'hui à ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isYesterday) {
      return `Hier à ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return `— ${date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Récupérer les messages précédents de l'API
    fetchMessages();
  }, []);

  useEffect(() => {
    const channel = pusher.subscribe(`private-user-${user_id}`);

    channel.bind("newMessage", (newMessage) => {
      // Vérifier si le message appartient à la conversation actuelle
      if (
        (newMessage.sender_id === user_id &&
          newMessage.recipient_id === conversation.user_id) ||
        (newMessage.sender_id === conversation.user_id &&
          newMessage.recipient_id === user_id)
      ) {
        // Ajouter le nouveau message à la liste des messages
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      channel.unbind("newMessage");
      pusher.unsubscribe(`private-user-${user_id}`);
    };
  }, [user_id, conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/users/direct-messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_id: user_id,
        recipient_id: conversation.user_id,
        message,
        sent_date: new Date(),
      }),
    });

    if (response.ok) {
      setMessage("");
    } else {
      alert("Erreur lors de l'envoi du message");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.conversationHeader}>
        <button onClick={closeConversation} className={styles.backButton}>
          ←
        </button>
        <div className={styles.conversationProfile}>
          <Image
            src={conversation.profile_picture_url}
            height={32}
            width={32}
            className={styles.conversationPic}
            alt={`${conversation.display_name}'s profile picture`}
          />
          <div className={styles.conversationNames}>
            <h2>Conversation avec {conversation.display_name}</h2>
            <span>(@{conversation.username})</span>
          </div>
        </div>

        <div></div>
      </div>
      <div className={styles.conversationMessages}>
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg, index) => {
            const msgDate = formatDate(msg.sent_date);
            const isLastMessage = index === messages.length - 1;
            return (
              <div
                key={msg.message_id}
                className={`${styles.message} ${
                  msg.sender_id === user_id ? styles.loggedUser : ""
                }`}
                ref={isLastMessage ? lastMessageRef : null}
              >
                <div className={styles.messageHeader}>
                  <strong>
                    {msg.sender_id === user_id
                      ? "Vous"
                      : conversation.display_name}
                    :
                  </strong>
                  <span>{msgDate}</span>
                </div>
                <p className={styles.messageContent}>{msg.message}</p>
              </div>
            );
          })
        ) : (
          <div>Aucun message</div>
        )}
      </div>
      <form onSubmit={sendMessage} className={styles.form}>
        <input
          type="text"
          autoComplete="disabled"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tapez votre message"
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
};

export default Conversation;
