import Image from "next/image";
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
      <Image
        src={conversation.profile_picture_url}
        height={32}
        width={32}
        className={styles.conversationPic}
        alt={`${conversation.display_name}'s profile picture`}
      />
      <div className={styles.conversationDetails}>
        <h3 className={styles.displayName}>
          {conversation.display_name} ({conversation.username})
        </h3>
        <p className={styles.lastMessage}>{truncatedMessage}...</p>
      </div>
    </div>
  );
};

export default ConversationsList;
