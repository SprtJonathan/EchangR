import { useEffect, useState } from "react";
import ConversationsList from "./ConversationsList";
import Conversation from "./Conversation";
import NewDM from "./NewDM";

import styles from "./Inbox.module.css";

import Pusher from "pusher-js";

const pusher = new Pusher("c5177ffd69682f39d63b", {
  cluster: "eu",
  forceTLS: true,
});

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

  useEffect(() => {
    // Subscribe to the private channel for the user
    const channel = pusher.subscribe(`private-user-${user_id}`);

    // Listen for new messages
    channel.bind("newMessage", (newMessage) => {
      // Update the list of conversations
      fetch(`/api/users/direct-messages/conversations?user_id=${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setConversations(data);
        });
    });

    // Clean up the event listener when the component is unmounted
    return () => {
      channel.unbind("newMessage");
      pusher.unsubscribe(`private-user-${user_id}`);
    };
  }, [user_id]);

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
