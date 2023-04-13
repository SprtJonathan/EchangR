import { useState } from "react";
import Image from "next/image";
import styles from "./EmojiPicker.module.css";

export default function EmojiPicker({ onEmojiSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  const emojiArray = [
    "/../public/images/reactions/MoiJeReste.png",
    "/../public/images/reactions/sparta34Kappa.png",
    "/../public/images/reactions/sparta34Caf.png",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.blur}></div>

      <div className={styles.emojiBox}>
        {emojiArray.map((emoji) => {
          return (
            <button
              className={styles.emojiButton}
              onClick={() => handleEmojiSelect(emoji)}
            >
              <Image
                priority
                className={styles.attachment}
                src={emoji}
                height={32}
                width={32}
                alt={"Réaction : " + emoji}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
