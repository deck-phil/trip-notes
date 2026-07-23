import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import type { AuthUser } from "../types/auth";

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const user = await login(username, password);
      onLogin(user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="board-page">
      <div
        className="board-surface"
        style={{ maxWidth: 420, margin: "4rem auto" }}
      >
        <section className="board-panel">
          <h1>Sign in</h1>
          <p>Log in to view your Trip Notes dashboard.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginTop: "1rem" }}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "0.25rem",
                }}
              />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "0.25rem",
                }}
              />
            </div>

            {error ? (
              <p className="board-message error" style={{ marginTop: "1rem" }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              style={{ marginTop: "1rem" }}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
