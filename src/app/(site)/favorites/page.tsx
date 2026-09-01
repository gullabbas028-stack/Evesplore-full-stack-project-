"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import EventCard, { EventLite } from "@/components/EventCard";
import { Skeleton, EmptyState, Button } from "@/components/ui";
import { useApp } from "@/context/AppContext";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loadingUser, favorites } = useApp();
  const [events, setEvents] = useState<EventLite[] | null>(null);

  useEffect(() => {
    if (!loadingUser && !user) { router.push("/login"); return; }
    if (user) api<{ favorites: EventLite[] }>("/favorites").then((d) => setEvents(d.favorites)).catch(() => setEvents([]));
  }, [user, loadingUser, router, favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">Favorites</h1>
      <p className="text-slate-400 mb-6">Your saved events, all in one place</p>
      {!events ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80" />)}</div>
      ) : events.length === 0 ? (
        <EmptyState title="No favorites yet" subtitle="Tap the heart on any event to save it here." action={<Button onClick={() => router.push("/events")}>Explore Events</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>
      )}
    </div>
  );
}
