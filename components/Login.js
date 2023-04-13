import { useState } from "react";

import styles from "./Auth.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("action", "login");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const { user, token } = await response.json();

      // Save the token in local storage
      localStorage.setItem("token", token);

      window.location.reload();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            type="text"
            id="email"
            className={styles.input}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className={styles.input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button className={styles.submitForm} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
