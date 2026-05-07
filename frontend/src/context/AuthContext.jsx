import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("teamtask_token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("teamtask_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(payload) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: payload,
    });
    localStorage.setItem("teamtask_token", data.token);
    setUser(data.user);
  }

  async function signup(payload) {
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: payload,
    });
    localStorage.setItem("teamtask_token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("teamtask_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

