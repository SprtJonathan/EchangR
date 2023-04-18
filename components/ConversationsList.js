import styles from "./ConversationsList.module.css"; // Ajoutez cette ligne

const ConversationsList = ({ conversation, onSelectConversation }) => {
  const truncatedMessage = conversation.message
    .split(" ")
    .slice(0, 5)
    .join(" ");

  return (
    <div
      onClick={() => onSelectConversation(conversation)}
      className={styles.conversationItem}
    >
      <img
        src={conversation.profile_picture_url}
        alt={`${conversation.displayName} profile`}
        className={styles.profileImage}
      />
      <div className={styles.conversationDetails}>
        <h3 className={styles.displayName}>
          {conversation.displayName} ({conversation.username})
        </h3>
        <p className={styles.lastMessage}>{truncatedMessage}...</p>
      </div>
    </div>
  );
};

export default ConversationsList;
