"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star, Users, Calendar } from "lucide-react";
import { api } from "@/lib/client";
import { Skeleton, EmptyState } from "@/components/ui";

type Venue = { id: number; name: string; city: string; image: string | null; rating: string; capacity: number; upcomingEvents: number; description: string };

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[] | null>(null);
  useEffect(() => { api<{ venues: Venue[] }>("/venues").then((d) => setVenues(d.venues)).catch(() => setVenues([])); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">Venues & Experiences</h1>
      <p className="text-slate-400 mb-6">Explore iconic venues hosting the best live events</p>
      {!venues ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
      ) : venues.length === 0 ? (
        <EmptyState title="No venues yet" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {venues.map((v) => (
            <motion.div key={v.id} whileHover={{ y: -6 }}>
              <Link href={`/venues/${v.id}`} className="block bg-[#10182b] border border-white/[0.06] rounded-2xl overflow-hidden card-glow">
                <div className="relative h-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.image || ""} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-3 right-3 bg-black/60 rounded-lg px-2 py-1 flex items-center gap-1">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" /><span className="text-white text-xs font-medium">{v.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold">{v.name}</h3>
                  <p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><MapPin size={14} /> {v.city}</p>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{v.description}</p>
                  <div className="flex gap-4 mt-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Users size={13} /> {v.capacity} capacity</span>
                    <span className="flex items-center gap-1"><Calendar size={13} /> {v.upcomingEvents} events</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
