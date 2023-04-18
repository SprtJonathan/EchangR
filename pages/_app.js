import { useState, useEffect } from "react";

import { Provider } from "react-redux";
import store from "../redux/store";
import { setUser } from "../redux/reducers/userSlice";

import "../styles/globals.css";

function getLoggedUser() {
  const [userData, setUserData] = useState(null);

  async function fetchUserData(token) {
    const res = await fetch("/api/auth", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    // console.log(data);
    setUserData(data);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      const {
        user_id,
        username,
        displayName,
        email,
        role_id,
        profile_picture_url,
        following,
        followers,
      } = userData;
      store.dispatch(
        setUser({
          user_id,
          username,
          displayName,
          email,
          role_id,
          profile_picture_url,
          following,
          followers,
        })
      );
    }
  }, [userData]);

  return userData;
}

export default function App({ Component, pageProps }) {
  getLoggedUser();
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
