import Image from "next/image";
import Link from "next/link";

import { useRef, useState, useEffect } from "react";

import { useSelector } from "react-redux";

import utilStyles from "../styles/utils.module.css";
import styles from "./Header.module.css";

import SelectMenuButton from "./SelectMenuButton";
import Auth from "../components/Auth";
import LoggedUser from "../components/LoggedUser";
import LogOut from "../components/LogOut";
import DirectMessagesCenter from "./DirectMessagesCenter";

const name = "E-ChangR";

export default function Header({ home, setSearchQuery }) {
  const loggedUser = useSelector((state) => state.user);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(e.target[0].value);
  };

  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      const direction = lastScrollY.current > currentScrollY ? "up" : "down";
      setIsHidden(direction === "down");
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`${styles.header} ${isHidden ? styles.hidden : ""}`}>
      <div className={styles.headerLogo}>
        <>
          <Link href="/">
            <Image
              priority
              src="/images/EchangR_Logo.png"
              height={64}
              width={64}
              alt="website-logo"
            />
          </Link>
          <h1 className={utilStyles.heading2Xl}>
            <Link href="/">{name}</Link>
          </h1>
        </>
      </div>
      {setSearchQuery && (
        <div className={styles.search}>
          <form onSubmit={handleSearchSubmit}>
            <input
              className={styles.searchBar}
              type="text"
              placeholder="Rechercher"
            />
            <button className={styles.searchButton} type="submit">
              <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                width="32px"
                height="32px"
                viewBox="0 0 1244.000000 1280.000000"
                preserveAspectRatio="xMidYMid meet"
              >
                <g
                  transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
                  fill="#ffffff"
                  stroke="none"
                >
                  <path
                    d="M4025 12789 c-1029 -79 -1969 -501 -2704 -1214 -985 -955 -1456
-2292 -1285 -3650 156 -1244 849 -2360 1899 -3059 193 -129 272 -175 470 -274
452 -227 906 -362 1445 -429 207 -25 763 -25 970 0 404 50 752 138 1115 281
251 98 600 283 819 433 l80 54 1075 -1073 c3835 -3827 3770 -3762 3828 -3795
189 -105 411 -75 563 77 148 148 180 359 84 553 -21 43 -462 488 -2432 2459
-2212 2213 -2404 2408 -2392 2425 8 10 40 47 70 83 714 836 1088 1927 1031
3011 -32 610 -165 1136 -420 1664 -169 349 -340 615 -592 920 -106 128 -395
417 -524 524 -687 569 -1463 900 -2336 996 -174 19 -598 27 -764 14z m780
-949 c777 -118 1453 -463 1982 -1014 516 -536 829 -1194 930 -1951 24 -186 24
-618 0 -810 -54 -416 -158 -758 -342 -1125 -297 -593 -779 -1101 -1360 -1432
-964 -549 -2153 -590 -3152 -108 -975 470 -1667 1364 -1873 2420 -37 192 -51
323 -57 555 -6 258 4 423 42 651 161 971 742 1831 1588 2348 453 278 935 434
1512 490 22 2 164 3 315 1 217 -3 304 -8 415 -25z"
                  />
                </g>
              </svg>
            </button>
          </form>
        </div>
      )}
      {loggedUser.userId ? (
        <>
          <section className={styles.userButtons}>
            <div className={styles.DMCenter}>
              <DirectMessagesCenter />
            </div>
            <button>
              <Link
                href={`/@${loggedUser.username}`}
                className={styles.loginButton}
              >
                <LoggedUser />
              </Link>
            </button>
            <div className={utilStyles.divider}></div>
            <LogOut />
          </section>
        </>
      ) : (
        <SelectMenuButton
          stylesFile="SelectMenuButtonAuth"
          toggleText="S'authentifier"
          content={
            <>
              <Auth />
            </>
          }
        />
      )}
    </header>
  );
}
