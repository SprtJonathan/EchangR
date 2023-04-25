import styles from "./newComment.module.css";

import { useState } from "react";
import { useSelector } from "react-redux";

function NewComment({ post_id, onCommentSubmit }) {
  const [comment_text, setCommentText] = useState("");

  const addComment = async (post_id, comment_text) => {
    if (comment_text) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/posts/comments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ post_id, comment: comment_text }),
        });
        console.log(response);
        if (response.status === 201) {
          console.log("Comment added:", response.status);
          onCommentSubmit();
        } else {
          console.error("Error adding comment:", response.status);
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    addComment(post_id, comment_text);
    setCommentText("");
  };

  const loggedUser = useSelector((state) => state.user);

  return loggedUser.user_id ? (
    <form className={styles.addCommentContainer} onSubmit={handleSubmit}>
      <textarea
        className={styles.addCommentText}
        value={comment_text}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Ajoutez un commentaire"
      />
      <button className={styles.addCommentButton} type="submit">
        Envoyer
      </button>
    </form>
  ) : (
    <div>Vous devez être connecté pour ajouter un commentaire.</div>
  );
}

export default NewComment;
