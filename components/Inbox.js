import { useEffect, useState } from "react";
import ConversationsList from "./ConversationsList";
import Conversation from "./Conversation";
import NewDM from "./NewDM";

import styles from "./Inbox.module.css";

const Inbox = ({ user_id, closeInbox }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`/api/users/direct-messages/conversations?user_id=${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("La conv : ");
        // console.log(data);
        setConversations(data);
        // console.log("Les convs");
        // console.log(conversations);
      });
  }, [user_id]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  console.log(selectedConversation);

  return (
    <div className={styles.inbox}>
      <div className={styles.inboxHeader}>
        <h2>Boîte de réception</h2>{" "}
        <button onClick={() => closeInbox(false)}>X</button>
      </div>
      {Array.isArray(conversations) && conversations.length > 0 ? (
        selectedConversation ? (
          <Conversation
            conversation={selectedConversation}
            user_id={user_id}
            closeConversation={() => setSelectedConversation(null)}
          />
        ) : (
          <>
            <NewDM sender_id={user_id} />
            <div className={styles.conversationsList}>
              {conversations.map((conversation) => {
                console.log(conversation);
                return (
                  <ConversationsList
                    key={conversation.message_id}
                    conversation={conversation}
                    onSelectConversation={handleSelectConversation}
                  />
                );
              })}
            </div>
          </>
        )
      ) : (
        <>
          <NewDM sender_id={user_id} />
          <div>Aucune conversation</div>
        </>
      )}
    </div>
  );
};
export default Inbox;
