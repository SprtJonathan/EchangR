import Head from "next/head";
import Link from "next/link";

import Header from "./Header";

import styles from "./layout.module.css";

export const siteTitle = "E-ChangR | On échange?";

export default function Layout({ children, home, setSearchQuery }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/images/EchangR_Logo.png" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header home={home} setSearchQuery={setSearchQuery} />
      <main>{children}</main>

      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">← Back to home</Link>
        </div>
      )}
    </div>
  );
}
