import { createContext, useContext } from "react";
import type { AuthUser } from "../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
