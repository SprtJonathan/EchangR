import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

import Layout from "../components/layout";
import ProfileSettings from "../components/ProfileSettings";
import AccountSettings from "../components/AccountSettings";

import styles from "./settings.module.css";
import DeleteAccount from "../components/DeleteAccount";

export default function Settings() {
  const router = useRouter();
  const loggedUser = useSelector((state) => state.user);
  const [selectedMenu, setSelectedMenu] = useState("publicProfile");

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "publicProfile":
        return <ProfileSettings />;
      case "account":
        return <AccountSettings />;
      case "delete":
        return <DeleteAccount />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!loggedUser.user_id) {
      router.push("/");
    }
  }, [loggedUser]);

  return (
    <Layout>
      <div className={styles.pageContent}>
        <div className={styles.sidebarMenu}>
          <h2>Paramètres</h2>
          <div className={styles.sidebarContent}>
            <button
              className={selectedMenu === "publicProfile" ? styles.active : ""}
              onClick={() => handleMenuClick("publicProfile")}
            >
              Profil public
            </button>
            <button
              className={selectedMenu === "account" ? styles.active : ""}
              onClick={() => handleMenuClick("account")}
            >
              Compte
            </button>
            <button
              className={selectedMenu === "delete" ? styles.active : ""}
              onClick={() => handleMenuClick("delete")}
            >
              Danger
            </button>
          </div>
        </div>
        <div className={styles.contentWrapper}>{renderContent()}</div>
      </div>
    </Layout>
  );
}
