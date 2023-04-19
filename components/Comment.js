import { useEffect, useState } from "react";
import Image from "next/image";

import moment from "moment";
import "moment/locale/fr";

import styles from "./comment.module.css";
import utilStyles from "../styles/utils.module.css";
import SelectMenuButton from "./SelectMenuButton";

function getTimeSincePost(date, boolean) {
  let newDate = new Date(date);

  if (boolean) {
    newDate = moment(date).locale("fr").fromNow();
  } else {
    newDate = moment(date).format("DD/MM/YYYY - HH:mm");
  }
  return newDate;
}

function Comment({ comment, loggedUser, onCommentDelete }) {
  //console.log(comment);
  const date = comment.created_at;

  const [authorData, setAuthorData] = useState({});
  const [dateToShow, setDateToShow] = useState(getTimeSincePost(date, true));
  const [dateCountdownFormat, setDateCountdownFormat] = useState(true);

  useEffect(() => {
    fetchAuthorData();
  }, []);

  async function fetchAuthorData() {
    const res = await fetch(`/api/users/id-${comment.author_id}`, {});
    const data = await res.json();
    setAuthorData(data);
  }

  function switchDateFormat() {
    setDateToShow(getTimeSincePost(date, !dateCountdownFormat)); // Mettre à jour dateToShow avec la nouvelle valeur formatée en JJ/MM/AAAA - HH:MM:SS ou "x temps depuis"
    setDateCountdownFormat(!dateCountdownFormat); // Inverser la valeur de dateCountdownFormat
  }

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
          body: JSON.stringify({ commentId: comment.commentId }),
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

  return (
    <div className={styles.commentContainer}>
      <div className={styles.commentHead}>
        <div className={styles.author}>
          <div className={styles.authorTile}>
            <Image
              priority
              className={utilStyles.profilePicture}
              src={authorData.profile_picture_url}
              height={32}
              width={32}
              alt={"Logo de " + authorData.username}
            />
            <p className={utilStyles.authorNames}>
              <span className={utilStyles.authorDisplayName}>
                {authorData.displayName}
              </span>
              <span className={utilStyles.authorUsername}>
                @{authorData.username}
              </span>
            </p>
          </div>
        </div>
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

      <div
        className={styles.date}
        onClick={() => {
          switchDateFormat();
        }}
      >
        {dateToShow}
      </div>
      <div className={styles.commentContent}>{comment.comment}</div>
    </div>
  );
}

export default Comment;
