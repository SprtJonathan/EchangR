import React from "react";
import styles from "./Status.module.css";

import SelectMenuButton from "./SelectMenuButton";
import DateDisplay from "./DateDisplay";

function Status({ updateStatus, ...props }) {
  const { status_id, author_id, status, date } = props.status;
  const loggedUser = props.loggedUser;

  async function deleteStatus() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/status`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status_id: status_id,
          author_id: author_id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateStatus();
        // Gérer le succès de la suppression du statut, par exemple, rafraîchir la liste des statuts
      } else {
        const error = await response.json();
        console.error("Error deleting status:", error);
        // Gérer les erreurs de suppression du statut, par exemple, afficher un message d'erreur
      }
    } catch (error) {
      console.error("Error deleting status:", error);
      // Gérer les erreurs de réseau, par exemple, afficher un message d'erreur
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <DateDisplay dateColor={"black"} date={date} />
          {loggedUser.user_id === author_id && (
            <SelectMenuButton
              stylesFile="SelectMenuButtonAlt"
              toggleText="⋮"
              content={
                <div>
                  <button
                    className={styles.delete}
                    onClick={() => deleteStatus()}
                  >
                    Supprimer
                  </button>
                </div>
              }
            />
          )}
        </div>
        <div className={styles.content}>{status}</div>
      </div>
    </div>
  );
}

export default Status;
