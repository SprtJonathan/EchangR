import Image from "next/image";
import { useSelector } from "react-redux";

import utilStyles from "../styles/utils.module.css";
import styles from "./LoggedUser.module.css";

export default function LoggedUser() {
  const loggedUser = useSelector((state) => state.user);
  return (
    <div className={styles.wrapper}>
      <Image
        className={utilStyles.profilePicture}
        src={loggedUser.profilePictureUrl}
        height={32}
        width={32}
        alt={"Logo de " + loggedUser.username}
      />
      <div className={styles.spacer}></div>
      <div className={styles.username}>{loggedUser.username}</div>
    </div>
  );
}
