import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import styles from "./userPage.module.css";
import Layout from "../components/layout";

import UserCard from "../components/UserCard";
import Post from "../components/Post";

const UserProfile = () => {
  const router = useRouter();
  const loggedUser = useSelector((state) => state.user);
  const [user, setUser] = useState(null);
  const { username } = router.query;

  const [posts, setPosts] = useState([]);
  const [noMorePosts, setNoMorePosts] = useState(false);

  async function fetchAuthorData(posts) {
    const authorIds = posts.map((post) => post.author_id);

    // Fetch author data for each post
    const authorPromises = authorIds.map((author_id) =>
      fetch(`/api/users?user_id=${author_id}`).then((res) => res.json())
    );

    const authors = await Promise.all(authorPromises);

    // Map the fetched author data to the posts
    const postsWithAuthor = posts.map((post, index) => {
      return {
        ...post,
        author: authors[index],
      };
    });

    return postsWithAuthor;
  }

  async function fetchData(user_id, loadMore = false) {
    try {
      const offset = loadMore ? posts.length : 0;
      const limit = 5;
      // Utilisez l'ID utilisateur passé en paramètre au lieu de user.user_id
      let baseApiUrl = `/api/posts?`;
      let params = `user_id=${user_id}`;
      let limitsUrl = `limit=${limit}&offset=${offset}`;
      const postApiUrl = baseApiUrl + params + limitsUrl;
      const res = await fetch(postApiUrl);
      const postData = await res.json();

      if (postData.length < limit) {
        setNoMorePosts(true);
      } else {
        setNoMorePosts(false);
      }

      // Fetch author data for each post
      const postsWithAuthor = await fetchAuthorData(postData);

      // Sort the posts by date in ascending order
      const sortedPosts = postsWithAuthor.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      if (loadMore) {
        console.log("Loading more posts...");

        setPosts([...posts, ...sortedPosts]);
      } else {
        console.log("No more posts...");

        setPosts(sortedPosts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

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
      const res = await fetch(`/api/users?username=${cleanUsername}`);
      const data = await res.json();
      setUser(data);

      // Appelez la fonction fetchData après avoir défini user, uniquement si data existe
      if (data) {
        // Passez data.user_id comme argument à fetchData
        fetchData(data.user_id);
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
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Post
                    key={post.id}
                    props={post}
                    refreshPosts={fetchData}
                    onTagClick={""}
                  />
                ))
              ) : (
                <>
                  <div className={styles.noPostContainer}>
                    {0}
                    <h3 className={styles.noPostText}>Aucun post disponible</h3>
                    <p className={styles.noPostText}>
                      Il n'y a actuellement aucun post sur le site. Revenez plus
                      tard ou créez-en un vous-même !
                    </p>
                  </div>
                </>
              )}
            </aside>
          </div>
          <div className={styles.spacer}></div>
          <div className={styles.userContentSection}>
            <h2 className={styles.userContentTitle}>Derniers status</h2>
            <aside className={styles.userContentContainer}></aside>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default UserProfile;
