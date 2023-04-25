import UserTile from "./UserTile";
import DateDisplay from "./DateDisplay";

import styles from "./comment.module.css";
import SelectMenuButton from "./SelectMenuButton";

function Comment({ comment, loggedUser, onCommentDelete }) {
  //console.log(comment);
  const date = comment.created_at;

  async function deleteComment() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("/api/posts/comments", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment_id: comment.comment_id,
            author_id: comment.author_id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          //console.log(data.message);
          onCommentDelete();
          // Vous pouvez ajouter une logique pour supprimer le commentaire de l'interface utilisateur ici
        } else {
          const error = await response.json();
          console.error(error.message);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  }

  const authorData = {
    user_id: comment.author_id,
    username: comment.username,
    display_name: comment.display_name,
    user_description: comment.user_description,
    profile_picture_url: comment.profile_picture_url,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    followers_count: comment.followers_count,
    following_count: comment.following_count,
    is_followed_by_current_user: comment.is_followed_by_current_user,
  };

  return (
    <div className={styles.commentContainer}>
      <div className={styles.commentHead}>
        {/* <div className={styles.author}>
          <div className={styles.authorTile}>
            <Image
              priority
              src={authorData.profile_picture_url}
              className={utilStyles.profilePicture}
              height={32}
              width={32}
              alt={"Logo de " + authorData.username}
            />
            <p className={utilStyles.authorNames}>
              <span className={utilStyles.authorDisplayName}>
                {authorData.display_name}
              </span>
              <span className={utilStyles.authorUsername}>
                @{authorData.username}
              </span>
            </p>
          </div>
        </div> */}
        <UserTile user={authorData} />
        <div>
          {loggedUser.user_id === comment.author_id && (
            <SelectMenuButton
              stylesFile="SelectMenuButtonAlt"
              toggleText="⋮"
              content={
                <div>
                  <button
                    className={styles.delete}
                    onClick={() => deleteComment()}
                  >
                    Supprimer
                  </button>
                </div>
              }
            />
          )}
        </div>
      </div>

      <DateDisplay date={date} />
      <div className={styles.commentContent}>{comment.comment}</div>
    </div>
  );
}

export default Comment;
