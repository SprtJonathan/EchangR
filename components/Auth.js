import { useState, useEffect } from "react";

import Login from "../components/Login";
import SignUp from "../components/SignUp";

import styles from "./Auth.module.css";
import utilStyles from "../styles/utils.module.css";

export default function Auth() {
  const [authLogin, setAuthLogin] = useState(true);

  return (
    <div className={styles.wrapper}>
      <div className={styles.authHeader}>
        <button
          className={styles.authButton}
          onClick={() => setAuthLogin(true)}
        >
          Connexion
        </button>
        <div className={utilStyles.divider}></div>
        <button
          className={styles.authButton}
          onClick={() => setAuthLogin(false)}
        >
          Inscription
        </button>
      </div>
      <div className={styles.authFormWrapper}>
        {authLogin ? <Login /> : <SignUp />}
      </div>
    </div>
  );
}
