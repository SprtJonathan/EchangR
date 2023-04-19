import Head from "next/head";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import Layout, { siteTitle } from "../components/layout";
import SelectMenuButton from "../components/SelectMenuButton";

import styles from "./index.module.css";
import utilStyles from "../styles/utils.module.css";

import Post from "../components/Post";
import NewPost from "../components/newPost";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [noMorePosts, setNoMorePosts] = useState(false);

  const [loadingMore, setLoadingMore] = useState(true);
  const loadingRef = useRef();

  const [displayNewPostModal, setDisplayNewPostModal] = useState(false);

  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  const loggedUser = useSelector((state) => state.user);

  async function fetchAuthorData(posts) {
    const authorIds = posts.map((post) => post.author_id);

    // Fetch author data for each post
    const authorPromises = authorIds.map((author_id) =>
      fetch(`/api/users/id-${author_id}`).then((res) => res.json())
    );

    const authors = await Promise.all(authorPromises);

    // Map the fetched author data to the posts
    const postsWithAuthor = posts.map((post, index) => {
      return {
        ...post,
        author: authors[index],
      };
    });

    console.log(postsWithAuthor);

    return postsWithAuthor;
  }

  const noPostIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      width="100px"
      height="100px"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
      <line x1="6" y1="12" x2="18" y2="12"></line>
    </svg>
  );

  const handleTagClick = (tag, reset = false) => {
    if (reset) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  async function fetchData(loadMore = false) {
    try {
      const offset = loadMore ? posts.length : 0;
      const limit = 3;
      let baseApiUrl = `/api/posts?`;
      let limitsUrl = `limit=${limit}&offset=${offset}`;
      let searchQueryUrl = `&searchQuery=${searchQuery}`;
      let tagFilterUrl = selectedTag ? `&tagFilter=${selectedTag}` : "";
      const postApiUrl = baseApiUrl + limitsUrl + searchQueryUrl + tagFilterUrl;
      const res = await fetch(postApiUrl);
      const data = await res.json();

      if (data.length < limit) {
        setNoMorePosts(true);
      } else {
        setNoMorePosts(false);
      }

      // Fetch author data for each post
      const postsWithAuthor = await fetchAuthorData(data);

      // Sort the posts by date in ascending order
      const sortedPosts = postsWithAuthor.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      console.log(loadMore);
      if (loadMore) {
        // console.log("Loading more posts...");

        setPosts([...posts, ...sortedPosts]);
      } else {
        // console.log("No more posts...");

        setPosts(sortedPosts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedTag]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          fetchData(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef) {
        observer.unobserve(currentLoadingRef);
      }
    };
  }, [loadingRef, fetchData]);

  const filteredPosts = posts;

  console.log(posts);

  function sortPosts(postsToSort, option) {
    switch (option) {
      case "recent":
        return postsToSort.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "oldest":
        return postsToSort.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "alphabetical":
        return postsToSort.sort((a, b) => a.title.localeCompare(b.title));
      case "reactions":
        return postsToSort.sort((a, b) => b.reactions - a.reactions);
      default:
        return postsToSort;
    }
  }

  const sortByOptions = (
    <>
      <div className={utilStyles.radioContainer}>
        <label className={utilStyles.radioLabel}>
          <input
            className={utilStyles.radioInput}
            type="radio"
            name="sortOption"
            value="recent"
            checked={sortOption === "recent"}
            onChange={(e) => setSortOption(e.target.value)}
          />
          <span className={utilStyles.radioCheckmark}></span>
          Plus récents
        </label>
        <label className={utilStyles.radioLabel}>
          <input
            className={utilStyles.radioInput}
            type="radio"
            name="sortOption"
            value="oldest"
            checked={sortOption === "oldest"}
            onChange={(e) => setSortOption(e.target.value)}
          />
          <span className={utilStyles.radioCheckmark}></span>
          Plus anciens
        </label>
        <label className={utilStyles.radioLabel}>
          <input
            className={utilStyles.radioInput}
            type="radio"
            name="sortOption"
            value="alphabetical"
            checked={sortOption === "alphabetical"}
            onChange={(e) => setSortOption(e.target.value)}
          />
          <span className={utilStyles.radioCheckmark}></span>
          Ordre alphabétique
        </label>
        <label className={utilStyles.radioLabel}>
          <input
            className={utilStyles.radioInput}
            type="radio"
            name="sortOption"
            value="reactions"
            checked={sortOption === "reactions"}
            onChange={(e) => setSortOption(e.target.value)}
          />
          <span className={utilStyles.radioCheckmark}></span>
          Nombre de réactions
        </label>
      </div>
    </>
  );

  const sortedFilteredPosts = sortPosts(filteredPosts, sortOption);

  return (
    <Layout home searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <section className={styles.postsSection}>
        <aside className={styles.filtersContainer}>
          <div className={styles.resultsNumber}>
            Nombre de posts: {filteredPosts.length}
          </div>
          <div className={styles.selectedTagContainer}>
            {selectedTag && (
              <div className={styles.selectedTagButton}>
                <span className={styles.selectedTagName}>{selectedTag}</span>
                <button
                  className={styles.removeTag}
                  onClick={() => handleTagClick(null, true)}
                >
                  &times;
                </button>
              </div>
            )}
          </div>
          <SelectMenuButton toggleText={`Trier par`} content={sortByOptions} />
        </aside>

        {Array.isArray(sortedFilteredPosts) &&
        sortedFilteredPosts.length > 0 ? (
          sortedFilteredPosts.map((post) => (
            <Post
              key={post.id}
              props={post}
              refreshPosts={fetchData}
              onTagClick={handleTagClick}
            />
          ))
        ) : (
          <>
            <div className={styles.noPostContainer}>
              {noPostIcon}
              <h3 className={styles.noPostText}>Aucun post disponible</h3>
              <p className={styles.noPostText}>
                Il n'y a actuellement aucun post sur le site. Revenez plus tard
                ou créez-en un vous-même !
              </p>
            </div>
          </>
        )}

        {loggedUser.user_id && (
          <div className={styles.newPost}>
            <button
              onClick={() => setDisplayNewPostModal(true)}
              className={styles.newPostButton}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                <path
                  fillRule="evenodd"
                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                />
              </svg>
            </button>
          </div>
        )}
        {displayNewPostModal && (
          <>
            <div className={styles.newPostWrapperOccluder}></div>
            <div className={styles.newPostWrapper}>
              <div className={styles.newPostContainerContent}>
                <NewPost
                  author={loggedUser}
                  onPostCreated={fetchData}
                  closeModal={() =>
                    setDisplayNewPostModal(!displayNewPostModal)
                  }
                />
              </div>
            </div>
          </>
        )}
      </section>
      {!noMorePosts &&
        loadingMore &&
        !Array.isArray(sortedFilteredPosts) &&
        sortedFilteredPosts.length < 1 && (
          <div
            ref={loadingRef}
            style={{ textAlign: "center", padding: "1rem" }}
          >
            Chargement...
          </div>
        )}
    </Layout>
  );
}
