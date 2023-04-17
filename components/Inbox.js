import { useEffect, useState } from "react";
import ConversationsList from "./ConversationsList";
import Conversation from "./Conversation";
import NewDM from "./NewDM";

import socket from "./socket";

import styles from "./Inbox.module.css";

const Inbox = ({ userId, closeInbox }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    fetch(`/api/users/direct-messages/conversations?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("La conv : ");
        console.log(data);
        setConversations(data);
      });
  }, [userId]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  useEffect(() => {
    // Écouter les nouveaux messages
    socket.on("newMessage", (newMessage) => {
      // Mettre à jour la liste des conversations
      fetch(`/api/users/direct-messages/conversations?userId=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          setConversations(data);
        });
    });

    // Supprimer l'écouteur d'événements lorsque le composant est démonté
    return () => {
      socket.off("newMessage");
    };
  }, [userId, socket]);

  return (
    <div className={styles.inbox}>
      <div className={styles.inboxHeader}>
        <h2>Boîte de réception</h2>{" "}
        <button onClick={() => closeInbox(false)}>X</button>
      </div>
      {selectedConversation ? (
        <Conversation
          conversation={selectedConversation}
          userId={userId}
          closeConversation={() => setSelectedConversation(null)}
        />
      ) : (
        <>
          <NewDM senderId={userId} />
          <div className={styles.conversationsList}>
            {conversations.map((conversation) => (
              <ConversationsList
                key={conversation.message_id}
                conversation={conversation}
                onSelectConversation={handleSelectConversation}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Inbox;
