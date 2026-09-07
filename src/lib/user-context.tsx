"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ClientType = "retail" | "b2b";

export interface User {
  clientType: ClientType;
  company?: string;
  email?: string;
  isLoggedIn: boolean;
}

interface UserContextType {
  user: User;
  setClientType: (type: ClientType) => void;
  login: (email: string, company: string, clientType: ClientType) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    clientType: "retail",
    isLoggedIn: false,
  });
  const [hydrated, setHydrated] = useState(false);

  // Carrega user del localStorage
  useEffect(() => {
    const stored = localStorage.getItem("mc-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
    setHydrated(true);
  }, []);

  // Persisteix a localStorage
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("mc-user", JSON.stringify(user));
    }
  }, [user, hydrated]);

  const setClientType = (type: ClientType) => {
    setUser((prev) => ({ ...prev, clientType: type }));
  };

  const login = (email: string, company: string, clientType: ClientType) => {
    setUser({
      email,
      company,
      clientType,
      isLoggedIn: true,
    });
  };

  const logout = () => {
    setUser({
      clientType: "retail",
      isLoggedIn: false,
    });
  };

  if (!hydrated) return children;

  return (
    <UserContext.Provider value={{ user, setClientType, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
