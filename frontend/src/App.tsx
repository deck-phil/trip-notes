import {useEffect, useState, type ReactNode} from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import TripBoardPage from "./pages/TripBoardPage";
import TripListPage from "./pages/TripListPage";
import LoginPage from "./pages/LoginPage";
import {getCurrentUser, logout} from "./services/auth";
import type {AuthUser} from "./types/auth";
import TripIndexPage from "./pages/TripIndexPage";
import {AuthProvider} from "./auth/AuthContext";

interface ProtectedRouteProps {
  user: AuthUser | null;
  loading: boolean;
  children: ReactNode;
}

function ProtectedRoute({user, loading, children}: ProtectedRouteProps) {
  if (loading) {
    return <p className="board-message">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace/>;
  }

  return children;
}

interface AppShellProps {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

function AppShell({user, onLogout}: AppShellProps) {
  return (
      <>
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
          <div>
            Signed in as <strong>{user.username}</strong>
          </div>

          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </header>

        <Outlet/>
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
    }
  }

  return (
      <AuthProvider value={{user, setUser}}>
        <BrowserRouter>
          <Routes>
            <Route
                path="/login"
                element={
                  authLoading ? (
                      <p className="board-message">Loading...</p>
                  ) : user ? (
                      <Navigate to="/trips" replace/>
                  ) : (
                      <LoginPage onLogin={setUser}/>
                  )
                }
            />

            <Route
                path="/"
                element={
                  <ProtectedRoute user={user} loading={authLoading}>
                    <AppShell user={user as AuthUser} onLogout={handleLogout}/>
                  </ProtectedRoute>
                }
            >
              <Route index element={<TripIndexPage/>}/>
              <Route path="trips" element={<TripListPage/>}/>
              <Route path="board/:tripId" element={<TripBoardPage/>}/>
            </Route>

            <Route path="*" element={<Navigate to="/trips" replace/>}/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}