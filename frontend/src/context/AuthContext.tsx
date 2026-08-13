import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser, UserRole } from "../types";
import * as apiClient from "../api/client";

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  demoLogin: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeRole(role: string): UserRole {
  if (role === "admin") return "admin";
  return "user";
}

function normalizeUser(raw: AuthUser): AuthUser {
  return { ...raw, role: normalizeRole(raw.role as string) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("resqx_user");
    if (!raw) return null;
    try {
      return normalizeUser(JSON.parse(raw));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("resqx_user", JSON.stringify(user));
  }, [user]);

  async function login(email: string, password: string) {
    const { access_token, user: u } = await apiClient.login(email, password);
    localStorage.setItem("resqx_token", access_token);
    setUser(normalizeUser(u));
  }

  async function signup(name: string, email: string, password: string, role: UserRole) {
    const { access_token, user: u } = await apiClient.signup(name, email, password, role);
    localStorage.setItem("resqx_token", access_token);
    setUser(normalizeUser(u));
  }

  function demoLogin(role: UserRole) {
    const fakeToken = "demo-token";
    const fakeUser: AuthUser = {
      id: role === "admin" ? "demo-admin" : "demo-user",
      name: role === "admin" ? "Admin Operator" : "User",
      email: role === "admin" ? "admin@resqx.demo" : "user@resqx.demo",
      role,
    };
    localStorage.setItem("resqx_token", fakeToken);
    setUser(fakeUser);
  }

  function logout() {
    localStorage.removeItem("resqx_token");
    localStorage.removeItem("resqx_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
