import { useEffect, useState, type ReactNode } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import TripBoardPage from "./pages/TripBoardPage";
import TripListPage from "./pages/TripListPage";
import LoginPage from "./pages/LoginPage";
import { getCurrentUser, logout } from "./services/auth";
import type { AuthUser } from "./types/auth";
import TripIndexPage from "./pages/TripIndexPage";
import { AuthProvider } from "./auth/AuthContext";

interface ProtectedRouteProps {
  user: AuthUser | null;
  loading: boolean;
  children: ReactNode;
}

function ProtectedRoute({ user, loading, children }: ProtectedRouteProps) {
  if (loading) {
    return <p className="board-message">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

interface TopNavProps {
  user: AuthUser | null;
  loading: boolean;
  onLogout: () => Promise<void>;
}

function TopNav({ user, loading, onLogout }: TopNavProps) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.5rem",
        borderBottom: "1px solid #d6d6d6",
        background: "#fff",
      }}
    >
      <Link
        to={user ? "/trips" : "/"}
        style={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}
      >
        Trip Notes
      </Link>

      {loading ? (
        <span>Loading...</span>
      ) : user ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span>
            Signed in as <strong>{user.username}</strong>
          </span>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      ) : (
        <Link to="/login">Log in</Link>
      )}
    </header>
  );
}

function AppLayout({
  user,
  loading,
  onLogout,
}: {
  user: AuthUser | null;
  loading: boolean;
  onLogout: () => Promise<void>;
}) {
  return (
    <>
      <TopNav user={user} loading={loading} onLogout={onLogout} />
      <Outlet />
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  }

  return (
    <AuthProvider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <AppLayout
                user={user}
                loading={authLoading}
                onLogout={handleLogout}
              />
            }
          >
            <Route
              path="/login"
              element={
                authLoading ? (
                  <p className="board-message">Loading...</p>
                ) : user ? (
                  <Navigate to="/trips" replace />
                ) : (
                  <LoginPage onLogin={setUser} />
                )
              }
            />

            <Route path="/board/:tripId" element={<TripBoardPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute user={user} loading={authLoading}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<TripIndexPage />} />
              <Route path="trips" element={<TripListPage />} />
            </Route>

            <Route
              path="*"
              element={<Navigate to={user ? "/trips" : "/login"} replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
