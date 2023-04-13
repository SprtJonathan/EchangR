import React from "react";
import styles from "./Modal.module.css";

const Modal = ({ children, show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
