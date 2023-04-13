import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Layout, { siteTitle } from "../components/layout";
import Post from "../components/Post";

import styles from "./post.module.css";

export default function post() {
  const [post, setPost] = useState([]);

  const router = useRouter();
  const postId = router.query.id;

  useEffect(() => {
    async function fetchData() {
      // Si postId est undefined, ne pas chercher les données
      if (!postId) return;

      try {
        const res = await fetch(`/api/posts?id=${postId}`);
        const data = await res.json();
        // sort the posts by date in ascending order
        setPost(data[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [postId]);
  console.log(post);

  return (
    <Layout>
      {post.id ? (
        <div className={styles.pageContent}>
          <Post props={post} />{" "}
        </div>
      ) : (
        <div className={styles.pageContent}>Post introuvable</div>
      )}
    </Layout>
  );
}
