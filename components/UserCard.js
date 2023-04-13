import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import moment from "moment";
import "moment/locale/fr";

import styles from "./UserCard.module.css";

export default function UserCard({
  displayUserInfo = true,
  displayStats = true,
  displayDescription = true,
  ...props
}) {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const {
    userId,
    username,
    displayName,
    profilePictureUrl,
    userDescription,
    created_at,
    updated_at,
  } = props.user;

  const creationDate = moment(created_at).format("DD/MM/YYYY");
  const updateDate = moment(updated_at).format("DD/MM/YYYY");

  const loggedUser = useSelector((state) => state.user);

  function checkIsFollowing() {
    const userIsFollowing = followers.some((follower) => {
      return follower === loggedUser.userId;
    });

    setIsFollowing(userIsFollowing);
  }

  const fetchUserFollowData = async () => {
    try {
      const response = await fetch(`/api/users/followers?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }
      const data = await response.json();
      setFollowers(data.followers.map((follower) => follower.follower_id));
      setFollowing(data.following.map((following) => following.following_id));
    } catch (error) {
      console.error(error.message);
    }
  };

  async function toggleFollowUser() {
    const followerId = loggedUser.userId;
    const followingId = userId;
    const url = "/api/users/followers";
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ followerId, followingId }),
    };

    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Mettre à jour l'état isFollowing
      fetchUserFollowData();

      // Gérer d'autres mises à jour de l'interface utilisateur, par exemple mettre à jour la liste des followers
    } catch (error) {
      console.error("Erreur lors de la modification du suivi :", error.message);
      // Gérer l'erreur, par exemple afficher un message d'erreur à l'utilisateur
    }
  }

  if (displayStats) {
    useEffect(() => {
      fetchUserFollowData();
    }, []);

    useEffect(() => {
      checkIsFollowing();
    }, [followers, loggedUser]);
  }

  return (
    <div className={styles.userCard}>
      {displayUserInfo && (
        <div className={styles.userInfos}>
          <div className={styles.userCardHeader}>
            <div className={styles.userProfile}>
              <Link href={`/@${username}`} className={styles.userProfile}>
                <img
                  className={styles.profilePicture}
                  src={profilePictureUrl}
                  alt={`${displayName}'s profile`}
                />
              </Link>
              <div className={styles.userInfo}>
                <Link href={`/@${username}`}>
                  <h3 className={styles.displayName}>{displayName}</h3>
                  <p className={styles.username}>@{username}</p>
                </Link>
                {displayDescription && <div>{userDescription}</div>}
              </div>
            </div>

            {loggedUser.userId &&
              loggedUser.userId !== userId &&
              displayStats && (
                <button
                  className={styles.followButton}
                  onClick={() => toggleFollowUser()}
                >
                  {isFollowing ? "Suivi ✓" : "Suivre +"}
                </button>
              )}
          </div>
          <span>Compte créé le {creationDate}</span>
          {creationDate !== updateDate && (
            <span>Dernière modification le {creationDate}</span>
          )}
        </div>
      )}

      {displayDescription && !displayUserInfo && (
        <div className={styles.standaloneDescription}>
          <h3 className={styles.descriptionTitle}>À propos :</h3>
          <p className={styles.descriptionContent}>{userDescription}</p>
        </div>
      )}

      {displayStats && (
        <>
          {loggedUser.userId &&
            loggedUser.userId !== userId &&
            !displayUserInfo && (
              <button
                className={styles.followButton}
                onClick={() => toggleFollowUser()}
              >
                {isFollowing ? "Suivi ✓" : "Suivre +"}
              </button>
            )}
          <div className={styles.userStats}>
            <p className={styles.username}>Followers : {followers.length}</p>
            <p className={styles.username}>
              Utilisateurs suivis : {following.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
