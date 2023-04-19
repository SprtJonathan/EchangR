import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import moment from "moment";
import "moment/locale/fr";
import Linkify from "react-linkify";
import ReactPlayer from "react-player";

import EmojiPicker from "./EmojiPicker";
import CommentsContainer from "./CommentsContainer";
import SelectMenuButton from "./SelectMenuButton";
import UserCard from "./UserCard";
import Modal from "./Modal";

import styles from "./post.module.css";
import utilStyles from "../styles/utils.module.css";

function getTimeSincePost(date, boolean) {
  let newDate = new Date(date);

  if (boolean) {
    newDate = moment(date).locale("fr").fromNow();
  } else {
    newDate = moment(date).format("DD/MM/YYYY - HH:mm");
  }
  return newDate;
}

export default function Post({ props, refreshPosts, onTagClick }) {
  const id = props.id;
  const title = props.title;
  const date = props.date;
  const description = props.description;
  const attachment = props.attachment;
  const tags = JSON.parse(props.tags);
  const author_id = props.author_id;

  const [dateToShow, setDateToShow] = useState(getTimeSincePost(date, true)); // Initialiser la valeur de dateToShow avec la date formatée en "x temps depuis"
  const [dateCountdownFormat, setDateCountdownFormat] = useState(true);
  const [authorData, setAuthorData] = useState();
  const [displayUserCard, setDisplayUserCard] = useState(false);

  const [postReactions, setPostReactions] = useState([]);

  const [commentsSectionOpen, setCommentsSectionOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [showPicker, setShowPicker] = useState(false);

  const router = useRouter();

  const loggedUser = useSelector((state) => state.user);

  const post = { id: id, author_id: author_id };
  const attachments = JSON.parse(attachment);
  // console.log(attachments);

  //console.log(post);

  /**
   * It fetches the reactions for a post and sets the state of the postReactions to the data returned
   * from the fetch request.
   */
  async function fetchReactions() {
    try {
      const response = await fetch(`/api/posts/reactions?postId=${id}`);
      const data = await response.json();
      setPostReactions(data);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  }

  /**
   * It fetches data from the server and sets the data to the state.
   */
  async function fetchAuthorData() {
    const res = await fetch(`/api/users/id-${author_id}`, {});
    const data = await res.json();
    setAuthorData(data);
  }

  /**
   * It takes an emoji as an argument, gets the token from local storage, and then sends a POST request
   * to the server with the token, the postId, and the emoji.
   *
   * If the response is successful, it calls the fetchReactions function.
   *
   * If the response is unsuccessful, it logs an error to the console.
   * @param emoji - the emoji that the user clicked on
   */
  const addReaction = async (emoji) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("/api/posts/reactions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: id, emoji }),
        });

        fetchReactions();
        if (response.status === 201) {
          console.error("Reaction added:", response.status);
        } else if (response.status === 200) {
          console.error("Reaction removed:", response.status);
        } else {
          console.error("Error adding reaction:", response.status);
        }
      } catch (error) {
        console.error("Error adding reaction:", error);
      }
    }
  };

  /**
   * This function deletes a post from the server using an API call and refreshes the posts on the
   * page.
   * @param event - The `event` parameter is likely an event object that is passed to the `deletePost`
   * function when it is called. However, it is not used in the function and can be removed if it is
   * not needed.
   */
  const deletePost = async (event) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(
          `/api/posts?id=${post.id}&author_id=${post.author_id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await response.json();

        // console.log("Post deleted", json);

        refreshPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  /**
   * The function switches the format of a date between "DD/MM/YYYY - HH:MM:SS" and "time since post"
   * and updates the value of dateToShow.
   */
  function switchDateFormat() {
    setDateToShow(getTimeSincePost(date, !dateCountdownFormat)); // Mettre à jour dateToShow avec la nouvelle valeur formatée en JJ/MM/AAAA - HH:MM:SS ou "x temps depuis"
    setDateCountdownFormat(!dateCountdownFormat); // Inverser la valeur de dateCountdownFormat
  }

  /**
   * The function checks if a given URL is a supported video player link and returns a video player
   * component if it is, otherwise it returns a hyperlink component with a confirmation prompt before
   * redirecting to the URL.
   * @param href - The URL of the link to be decorated.
   * @param text - The text to be displayed as the link.
   * @param key - The key parameter is a unique identifier that helps React keep track of the elements
   * in a list or array. It is used to optimize rendering performance by allowing React to quickly
   * identify which elements have changed and need to be updated. In this function, the key parameter is
   * used to assign a unique identifier to each
   * @returns The function `linkifyDecorator` returns either a `ReactPlayer` component wrapped in a
   * `div` element or an `a` element depending on whether the `href` parameter is a playable video link
   * or not. If it is a playable video link, the function returns the `ReactPlayer` component wrapped in
   * a `div` element with some props passed to it. If it is not a
   */
  function linkifyDecorator(href, text, key) {
    if (
      ReactPlayer.canPlay(href) &&
      (href.includes("youtube.com") ||
        href.includes("vimeo.com") ||
        href.includes("dailymotion.com") ||
        href.includes("twitch.tv"))
    ) {
      return (
        <div key={key} className={styles.videoPlayerContainer}>
          <ReactPlayer
            width="100%"
            height="100%"
            url={href}
            controls={true}
            className={styles.videoPlayer}
          />
        </div>
      );
    } else {
      return (
        <a
          href={href}
          key={key}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (
              !confirm(
                "Vous êtes sur le point de quitter cette page pour accéder à un lien externe. Voulez-vous continuer ?"
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          {text}
        </a>
      );
    }
  }

  /**
   * The function opens a modal and sets the source of an image to be displayed in the modal.
   * @param src - The `src` parameter is a string that represents the source URL of an image that needs
   * to be displayed in a modal. The function `openImageModal` takes this parameter and sets it as the
   * source of the image to be displayed in the modal.
   */
  const openImageModal = (src, index) => {
    setModalImageSrc(src);
    setCurrentImageIndex(index);
    setShowModal(true);
  };

  /**
   * The above function updates the current image index to display the previous image in a list of
   * attachments.
   */
  const previousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : attachments.length - 1
    );
  };

  /**
   * The function `nextImage` updates the current image index to the next index in an array of
   * attachments, or resets to 0 if at the end of the array.
   */
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < attachments.length - 1 ? prevIndex + 1 : 0
    );
  };

  /**
   * The function toggles the visibility of an emoji picker.
   */
  const toggleEmojiPicker = () => {
    setShowPicker(!showPicker);
  };

  function copyToClipboard() {
    const postUrl = `${window.location.origin}${router.asPath}post?id=${post.id}`;
    navigator.clipboard.writeText(postUrl).then(
      () => {
        setCopySuccess("Lien du post copié !");
      },
      () => {
        setCopySuccess("Erreur lors de la copie");
      }
    );
  }

  function toggleCommentsSection() {
    setCommentsSectionOpen(!commentsSectionOpen);
  }

  useEffect(() => {
    fetchReactions();
    fetchAuthorData();
  }, []);

  useEffect(() => {
    if (copySuccess) {
      const timeoutId = setTimeout(() => {
        setCopySuccess("");
      }, 2300);
      return () => clearTimeout(timeoutId);
    }
  }, [copySuccess]);

  if (authorData) {
    return (
      <article id={"post-id-" + id} className={styles.wrapper}>
        <aside className={styles.headerTitle}>
          <div className={styles.titleContext}>
            <h2 className={styles.title}>{title}</h2>
            <SelectMenuButton
              stylesFile="SelectMenuButtonAlt"
              toggleText="⋮"
              content={
                <>
                  <button
                    onClick={copyToClipboard}
                    className={styles.shareButton}
                  >
                    Partager
                  </button>
                  {loggedUser.user_id == author_id && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className={styles.delete}
                    >
                      Supprimer le post
                    </button>
                  )}
                </>
              }
            />
            {loggedUser.user_id == author_id && confirmDelete && (
              <div
                className={styles.confirmModalWrapper}
                onClick={() => setConfirmDelete(false)}
              >
                <div
                  className={styles.confirmModal}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className={styles.confirmText}>
                    Êtes-vous sûr de vouloir supprimer le post {post.postTitle}?
                    Cette action est irréversible.
                  </p>
                  <div className={styles.confirmButtonsContainer}>
                    <button
                      className={styles.confirmCancelButton}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Annuler
                    </button>
                    <button
                      className={styles.confirmButton}
                      onClick={deletePost}
                    >
                      Oui, supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.authordate}>
              <div className={styles.author}>
                <p>Par</p>
                <div
                  onMouseEnter={() => setDisplayUserCard(true)}
                  onMouseLeave={() => setDisplayUserCard(false)}
                  className={styles.authorTile}
                >
                  <Image
                    priority
                    className={utilStyles.profilePicture}
                    src={authorData.profile_picture_url}
                    height={32}
                    width={32}
                    alt={"Logo de " + authorData.username}
                  />
                  <p className={utilStyles.authorNames}>
                    <span className={utilStyles.authorDisplayName}>
                      {authorData.displayName}
                    </span>
                    <span className={utilStyles.authorUsername}>
                      @{authorData.username}
                    </span>
                  </p>
                  {displayUserCard && (
                    <div className={styles.floatingUserCard}>
                      <UserCard user={authorData} />
                    </div>
                  )}
                </div>
              </div>
              <div
                className={styles.date}
                onClick={() => {
                  switchDateFormat();
                }}
              >
                {dateToShow}
              </div>
            </div>
          </div>
          <div className={styles.postContent}>
            <Linkify
              className={styles.descriptionContainer}
              componentDecorator={linkifyDecorator}
            >
              <div className={styles.description}>{description}</div>
            </Linkify>
            {attachments || attachments !== "" ? (
              <div
                className={styles.imageGrid}
                style={{
                  gridTemplateColumns:
                    Array.isArray(attachments) && attachments.length === 1
                      ? "1fr"
                      : attachments.length === 3
                      ? "1fr 1fr"
                      : "repeat(2, 1fr)",
                }}
              >
                {Array.isArray(attachments) ? (
                  attachments.map((attachment, index) => (
                    <figure
                      key={index}
                      className={styles.imageContainer}
                      style={{
                        gridColumn:
                          attachments.length === 3 && index === 1
                            ? "1 / span 2"
                            : "",
                        gridRow:
                          attachments.length === 3 && index === 1
                            ? "1 / span 2"
                            : "",
                      }}
                    >
                      <Image
                        className={styles.imageThumbnail}
                        src={attachment}
                        alt={"Image postée par " + authorData.username}
                        height={900}
                        width={900}
                        onClick={() => openImageModal(attachment, index)}
                      />
                    </figure>
                  ))
                ) : (
                  <figure className={styles.imageContainer}>
                    <Image
                      className={styles.imageThumbnail}
                      src={attachments}
                      alt={"Image postée par " + authorData.username}
                      height={900}
                      width={900}
                      onClick={() => openImageModal(attachments, 0)}
                    />
                  </figure>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className={styles.tagsContainer}>
            {tags &&
              tags !== "" &&
              (Array.isArray(tags) ? (
                tags.map((tag, index) => (
                  <span
                    key={index}
                    className={styles.tags}
                    onClick={() => onTagClick(tag)}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className={styles.tags}>{tags}</span>
              ))}
          </div>
          <div className={styles.reactionsContainer}>
            {postReactions && Array.isArray(postReactions) ? (
              <>
                {postReactions.map((reaction, index) => (
                  <button
                    key={index}
                    className={styles.reactionButton}
                    onClick={() => addReaction(reaction.emoji)}
                  >
                    <span className={styles.emojiContainer}>
                      <Image
                        priority
                        className={styles.eomji}
                        src={reaction.emoji}
                        height={25}
                        width={25}
                        alt={"Réaction : " + reaction.emoji}
                      />{" "}
                    </span>
                    <span className={styles.emojiCounter}>
                      {reaction.count}
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <></>
            )}

            {(!postReactions || postReactions.length < 10) &&
            loggedUser.user_id ? (
              <>
                <button
                  className={styles.reactionButton}
                  onClick={() => {
                    toggleEmojiPicker();
                  }}
                >
                  +{showPicker && <EmojiPicker onEmojiSelect={addReaction} />}
                </button>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <section id="post-actions" className={styles.postActions}>
          <div className={styles.menuBar}>
            <button onClick={copyToClipboard} className={styles.shareButton}>
              Partager
            </button>
            {copySuccess && (
              <span
                className={`${styles.copiedMessage} ${
                  copySuccess ? styles.visible : ""
                }`}
              >
                {copySuccess}
              </span>
            )}
            <div className={utilStyles.divider}></div>

            <button
              onClick={toggleCommentsSection}
              className={styles.commentsButton}
            >
              <span role="img" aria-label="Bulle textuelle">
                💬
              </span>
            </button>
          </div>
        </section>
        {commentsSectionOpen && (
          <div id="comments-section">
            <CommentsContainer postId={post.id} />
          </div>
        )}
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          {Array.isArray(attachments) && attachments.length > 1 && (
            <div className={styles.galleryControls}>
              <button className={styles.galleryButtons} onClick={previousImage}>
                {"〈"}
              </button>
              <button className={styles.galleryButtons} onClick={nextImage}>
                {"〉"}
              </button>
            </div>
          )}
          <Image
            className={styles.modalImage}
            src={attachments[currentImageIndex]}
            alt={"Image postée par " + authorData.username}
            width={800}
            height={800}
          />
        </Modal>
      </article>
    );
  } else {
    return (
      <article className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <h2>Chargement</h2>
          </div>
        </div>
      </article>
    );
  }
}
