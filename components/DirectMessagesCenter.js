import { useState } from "react";
import { useSelector } from "react-redux";

import Inbox from "./Inbox";

import styles from "./DirectMessagesCenter.module.css";

export default function DirectMessagesCenter() {
  const [displayInbox, setDisplayInbox] = useState(false);
  const loggedUser = useSelector((state) => state.user);

  return (
    <div>
      {!displayInbox ? (
        <div className={styles.displayMessagesButton} onClick={() => setDisplayInbox(true)}>Messages</div>
      ) : (
        <Inbox userId={loggedUser.userId} closeInbox={setDisplayInbox} />
      )}
    </div>
  );
}
