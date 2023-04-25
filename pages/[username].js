import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

import styles from "./userPage.module.css";
import Layout from "../components/layout";

import UserCard from "../components/UserCard";
import Post from "../components/Post";
import NewStatus from "../components/NewStatus";
import Status from "../components/Status";

const UserProfile = () => {
  const router = useRouter();
  const loggedUser = useSelector((state) => state.user);
  const [user, setUser] = useState(null);
  const { username } = router.query;

  const [posts, setPosts] = useState([]);
  const [noMorePosts, setNoMorePosts] = useState(false);

  const [status, setStatus] = useState([]);
  const [noMoreStatus, setNoMoreStatus] = useState(false);

  const loadingPostsRef = useRef();
  const loadingStatusRef = useRef();

  function mergePostAndUser(post, user) {
    return {
      ...post,
      username: user.username,
      display_name: user.display_name,
      profile_picture_url: user.profile_picture_url,
      user_description: user.user_description,
      created_at: user.created_at,
      updated_at: user.updated_at,
      followers_count: user.followers_count,
      following_count: user.following_count,
      is_followed_by_current_user: user.is_followed_by_current_user,
    };
  }

  // console.log(user);

  async function fetchData(user_id, loadMore = false) {
    try {
      const offset = loadMore ? posts.length : 0;
      const limit = 10;
      let baseApiUrl = `/api/posts?`;
      let params = `user_id=${user_id}`;
      let limitsUrl = `&limit=${limit}&offset=${offset}`;
      let checkLoggedUserFollow =
        user && user.user_id ? `&loggedUser_id=${user.user_id}` : "";
      const postApiUrl =
        baseApiUrl + params + limitsUrl + checkLoggedUserFollow;

      const res = await fetch(postApiUrl);
      const data = await res.json();

      if (data.length < limit) {
        setNoMorePosts(true);
      } else {
        setNoMorePosts(false);
      }

      // Les données de l'auteur sont déjà incluses dans la réponse de l'API
      const postsWithAuthor = data;

      console.log(data);

      // Sort the posts by date in ascending order
      const sortedPosts = postsWithAuthor.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      if (loadMore) {
        setPosts([...posts, ...sortedPosts]);
      } else {
        setPosts(sortedPosts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          fetchData(user.user_id, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadingPostsRef = loadingPostsRef.current;
    if (currentLoadingPostsRef) {
      observer.observe(currentLoadingPostsRef);
    }

    return () => {
      if (currentLoadingPostsRef) {
        observer.unobserve(currentLoadingPostsRef);
      }
    };
  }, [loadingPostsRef, fetchData]);

  async function fetchStatusData(user_id, loadMore = false) {
    try {
      const offset = loadMore ? status.length : 0;
      const limit = 5;
      const statusApiUrl = `/api/status?user_id=${user_id}&limit=${limit}&offset=${offset}`;

      const res = await fetch(statusApiUrl);
      const data = await res.json();

      if (data.length < limit) {
        setNoMoreStatus(true);
      } else {
        setNoMoreStatus(false);
      }

      if (loadMore) {
        setStatus([...status, ...data]);
      } else {
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching status data:", error);
    }
  }

  function onStatusDelete() {
    fetchStatusData(user.user_id);
  }
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          fetchStatusData(user.user_id, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadingStatusRef = loadingStatusRef.current;
    if (currentLoadingStatusRef) {
      observer.observe(currentLoadingStatusRef);
    }

    return () => {
      if (currentLoadingStatusRef) {
        observer.unobserve(currentLoadingStatusRef);
      }
    };
  }, [loadingStatusRef, fetchStatusData]);

  function handleScroll() {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight &&
      !noMorePosts
    ) {
      fetchData(user.user_id, true); // Passez l'ID utilisateur de user en premier paramètre
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!username) return;

    const cleanUsername = username.substring(1); // Enlever le @ de l'URL
    async function fetchUserData() {
      let baseApiUrl = `/api/users/username-${cleanUsername}?`;
      let checkLoggedUserFollow =
        loggedUser && loggedUser.user_id
          ? `&loggedUser_id=${loggedUser.user_id}`
          : "";
      const userInfoApiUrl = baseApiUrl + checkLoggedUserFollow;
      const res = await fetch(userInfoApiUrl);
      const data = await res.json();
      setUser(data);

      // Appelez la fonction fetchData après avoir défini user, uniquement si data existe
      if (data) {
        fetchData(data.user_id);
        fetchStatusData(data.user_id);
      }
    }

    fetchUserData();
  }, [username]);

  if (!user || router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className={styles.pageContent}>
        <div className={styles.userHeader}>
          <UserCard
            user={user}
            displayStats={false}
            displayDescription={false}
          />
          {/* {user.user_id == loggedUser.user_id && <div>CKILEPATRON</div>} */}
          <UserCard user={user} displayUserInfo={false} displayStats={false} />
          <UserCard
            user={user}
            displayUserInfo={false}
            displayDescription={false}
          />
        </div>
        <section className={styles.userPostsStatus}>
          <div className={styles.userContentSection}>
            <h2 className={styles.userContentTitle}>Derniers posts</h2>
            <div className={styles.spacerBar}></div>
            <aside className={styles.userContentContainer}>
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <Post
                    key={post.id} // Ajout de la prop "key" unique
                    props={mergePostAndUser(post, user)}
                    refreshPosts={fetchData}
                    onTagClick={""}
                  />
                ))
              ) : (
                <>
                  <div className={styles.noPostContainer}>
                    <h3 className={styles.noPostText}>Aucun post disponible</h3>
                    <p className={styles.noPostText}>
                      Cet utilisateur n'a encore rien posté
                    </p>
                  </div>
                </>
              )}
              {!noMorePosts && (
                <div
                  ref={loadingPostsRef}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  Chargement...
                </div>
              )}
            </aside>
          </div>
          <div className={styles.spacer}></div>
          <div className={styles.userContentSection}>
            <h2 className={styles.userContentTitle}>Derniers statut</h2>
            <div className={styles.spacerBar}></div>
            <aside className={styles.userContentContainer}>
              {loggedUser.user_id === user.user_id && (
                <>
                  <NewStatus addStatusFunction={fetchStatusData} />
                </>
              )}
              {Array.isArray(status) && status.length > 0 ? (
                status.map((status) => (
                  <Status
                    key={status.status_id} // Ajout de la prop "key" unique
                    status={status}
                    loggedUser={loggedUser}
                    updateStatus={onStatusDelete}
                  />
                ))
              ) : (
                <>
                  <div className={styles.noPostContainer}>
                    <h3 className={styles.noPostText}>
                      Aucun statut disponible
                    </h3>
                    <p className={styles.noPostText}>
                      Cet utilisateur n'a encore publié aucun statut
                    </p>
                  </div>
                </>
              )}
              {!noMoreStatus && (
                <div
                  ref={loadingStatusRef}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  Chargement...
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default UserProfile;
