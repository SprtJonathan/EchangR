import { useState } from "react";
import styles from "./newPost.module.css";
import utilStyles from "../styles/utils.module.css";

import ImagePreview from "./ImagePreview";

export default function NewPost(props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [tags, setTags] = useState([]);

  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title) {
      setTitleError("Le titre ne peut pas être vide");
      return;
    } else {
      setTitleError("");
    }

    if (!content) {
      setContentError("La description ne peut pas être vide");
      return;
    } else {
      setContentError("");
    }

    if (attachments.length > 0) {
      const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
      const extensions = attachments.map((attachment) =>
        attachment.name.split(".").pop().toLowerCase()
      );
      const invalidAttachments = extensions.filter(
        (extension) => !allowedExtensions.includes(extension)
      );
      if (invalidAttachments.length > 0) {
        setAttachmentError(
          "Les attachments doivent être au format JPG, PNG ou GIF"
        );
        return;
      } else {
        setAttachmentError("");
      }
    }

    const data = new FormData();
    data.append("title", title);
    data.append("description", content);
    data.append("tags", JSON.stringify(tags));

    attachments.forEach((attachment) => {
      data.append("attachment", attachment, attachment.name);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      if (response.status === 201) {
        const json = await response.json();

        props.closeModal();
        props.onPostCreated();

        // console.log("Post created:", json);
        // location.reload();
      } else {
        // Vous pouvez ajouter ici un traitement d'erreur personnalisé en fonction du statut de la réponse
        console.error("Error creating post, status:", response.status);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleTagInputKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(event.target.value);
      event.target.value = "";
    }
    console.log(tags);
  };

  const addTag = (inputValue) => {
    const newTag = inputValue.trim().toLowerCase();
    if (
      newTag.length > 0 &&
      !tags.some((existingTag) => existingTag.toLowerCase() === newTag)
    ) {
      setTags([...tags, newTag]);
    }
  };

  const handleTagInputBlur = (event) => {
    addTag(event.target.value);
    event.target.value = "";
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAttachmentsChange = (newAttachments) => {
    setAttachments(newAttachments);
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Titre du post</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Mon nouveau post"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <span className={utilStyles.errorMessage}>{titleError}</span>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Contenu du post</label>
          <textarea
            className={styles.input}
            type="textarea"
            placeholder="Mon nouveau post"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          ></textarea>
          <span className={styles.errorMessage}>{contentError}</span>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tags</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Ajouter des tags séparés par une virgule"
            onKeyDown={handleTagInputKeyDown}
            onBlur={handleTagInputBlur}
          />
          <div className={styles.addedTagsWrapper}>
            {tags.map((tag) => {
              return (
                <div className={styles.addedTags}>
                  <span className={styles.addedTagsElement}>{tag}</span>
                  <button
                    type="button"
                    className={styles.addedTagsRemove}
                    onClick={() => removeTag(tag)}
                  >
                    X
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="attachment">
            Envoyer une image
          </label>
          <div className={styles.attachmentContainer}>
            <ImagePreview
              attachments={attachments}
              onAttachmentsChange={handleAttachmentsChange}
              multiple={true} // Changez cette valeur pour sélectionner un seul fichier ou plusieurs fichiers
            />
          </div>
        </div>

        <div className={styles.formButtons}>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={() => props.closeModal()}
          >
            Annuler
          </button>
          <button className={styles.submitButton} type="submit">
            Publier
          </button>
        </div>
      </form>
    </>
  );
}
