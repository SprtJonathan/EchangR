import styles from "./newComment.module.css";

import { useState } from "react";
import { useSelector } from "react-redux";

function NewComment({ postId, onCommentSubmit }) {
  const [commentText, setCommentText] = useState("");

  const addComment = async (postId, commentText) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("/api/comments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId, comment: commentText }),
        });

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
    addComment(postId, commentText);
    setCommentText("");
  };

  const loggedUser = useSelector((state) => state.user);

  return loggedUser.userId ? (
    <form className={styles.addCommentContainer} onSubmit={handleSubmit}>
      <textarea
        className={styles.addCommentText}
        value={commentText}
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
