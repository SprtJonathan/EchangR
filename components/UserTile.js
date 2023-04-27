import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";

import UserCard from "./UserCard";

import styles from "./UserTile.module.css";
import utilStyles from "../styles/utils.module.css";

export default function UserTile({ user }) {
  const { user_id, username, display_name, profile_picture_url } = user;
  const [displayUserCard, setDisplayUserCard] = useState(false);

  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setDisplayUserCard(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setDisplayUserCard(false);
  };

  return (
    <div className={styles.author}>
      <div
        className={styles.authorTile}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/user/@${username}`} className={utilStyles.authorDisplayName}>
          <Image
            priority
            src={profile_picture_url}
            className={utilStyles.profilePicture}
            height={32}
            width={32}
            alt={"Logo de " + username}
          />
        </Link>
        <p className={utilStyles.authorNames}>
          <Link href={`/user/@${username}`} className={utilStyles.authorDisplayName}>
            {display_name}
          </Link>
          <Link href={`/user/@${username}`} className={utilStyles.authorUsername}>
            @{username}
          </Link>
        </p>
        {displayUserCard && (
          <div className={styles.floatingUserCard}>
            <UserCard user={user} />
          </div>
        )}
      </div>
    </div>
  );
}
