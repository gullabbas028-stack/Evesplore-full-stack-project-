"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/client";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
} | null;

type Toast = { id: number; type: "success" | "error" | "info"; message: string };

type Ctx = {
  user: SessionUser;
  loadingUser: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: SessionUser) => void;
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: number) => void;
  favorites: number[];
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (eventId: number) => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);

let toastId = 0;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => removeToast(id), 3800);
    },
    [removeToast]
  );

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api<{ user: SessionUser }>("/auth/me");
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      const { ids } = await api<{ ids: number[] }>("/favorites");
      setFavorites(ids);
    } catch {
      setFavorites([]);
    }
  }, []);

  const toggleFavorite = useCallback(
    async (eventId: number) => {
      if (!user) {
        toast("Please login to save favorites", "error");
        return;
      }
      const isFav = favorites.includes(eventId);
      try {
        if (isFav) {
          await api(`/favorites/${eventId}`, { method: "DELETE" });
          setFavorites((f) => f.filter((id) => id !== eventId));
          toast("Removed from favorites", "info");
        } else {
          await api(`/favorites/${eventId}`, { method: "POST" });
          setFavorites((f) => [...f, eventId]);
          toast("Event added to favorites");
        }
      } catch (e) {
        toast((e as Error).message, "error");
      }
    },
    [favorites, user, toast]
  );

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    setFavorites([]);
    toast("Logged out successfully", "info");
  }, [toast]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) refreshFavorites();
  }, [user, refreshFavorites]);

  return (
    <AppCtx.Provider
      value={{
        user,
        loadingUser,
        refreshUser,
        logout,
        setUser,
        toasts,
        toast,
        removeToast,
        favorites,
        refreshFavorites,
        toggleFavorite,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
