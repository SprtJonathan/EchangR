import { useEffect, useState } from "react";
import NewComment from "./NewComment";
import { useSelector } from "react-redux";
import Comment from "./Comment";
import SelectMenuButton from "./SelectMenuButton";

import styles from "./commentsContainer.module.css";

function CommentsContainer({ post_id }) {
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sort, setSort] = useState("created_at");
  const [menuOpen, setMenuOpen] = useState(false);

  const loggedUser = useSelector((state) => state.user);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments(sortOption = sort) {
    try {
      let baseApiUrl = `/api/posts/comments?`;
      let postIdUrl = `post_id=${post_id}`;
      let sortUrl = `&sort=${sortOption}`;
      let checkLoggedUserFollow =
      loggedUser && loggedUser.user_id ? `&loggedUser_id=${loggedUser.user_id}` : "";
      const commentsApiUrl =
        baseApiUrl + postIdUrl + sortUrl + checkLoggedUserFollow;
      const response = await fetch(commentsApiUrl);
      const data = await response.json();
      setComments(data);
      setCommentsCount(data.length);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  function handleSortChange(sortOption) {
    setSort(sortOption);
    fetchComments(sortOption);
  }

  const menuContent = (
    <>
      <button>Option 1</button>
      <button>Option 2</button>
      <button>Option 3</button>
    </>
  );

  return (
    <div className={styles.commentsContainer}>
      <div className={styles.commentsHeader}>
        <strong className={styles.commentsCount}>
          {commentsCount} commentaire(s)
        </strong>
        {Array.isArray(comments) && comments.length > 1 && (
          <SelectMenuButton
            toggleText={`Trier par : ${sort}`}
            content={menuContent}
          />
        )}
      </div>
      <ul className={styles.commentsList}>
        {loggedUser ? (
          <li>
            <NewComment post_id={post_id} onCommentSubmit={fetchComments} />
          </li>
        ) : null}
        {Array.isArray(comments) &&
          comments.map((comment) => (
            <Comment
              key={comment.comment_id}
              comment={comment}
              loggedUser={loggedUser}
              onCommentDelete={fetchComments}
            />
          ))}
      </ul>
    </div>
  );
}

export default CommentsContainer;
