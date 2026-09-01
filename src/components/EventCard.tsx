"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Heart } from "lucide-react";
import { Badge } from "./ui";
import { useApp } from "@/context/AppContext";
import { fmtMoney, dateParts } from "@/lib/client";

export type EventLite = {
  id: number;
  title: string;
  category: string;
  banner: string | null;
  date: string;
  startTime: string;
  venueName?: string | null;
  venueCity?: string | null;
  startingPrice: string | number;
};

export default function EventCard({ event }: { event: EventLite }) {
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(event.id);
  const dp = dateParts(event.date);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-[#10182b] rounded-2xl overflow-hidden border border-white/[0.06] card-glow group"
    >
      <Link href={`/events/${event.id}`} className="block relative">
        <div className="aspect-[16/10] overflow-hidden bg-[#0b1224]">
          {event.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.banner}
              alt={event.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🎫</div>
          )}
        </div>
        <div className="absolute top-3 left-3">
          <Badge color="violet">{event.category}</Badge>
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur rounded-xl px-2.5 py-1.5 text-center">
          <div className="text-[10px] font-bold text-pink-400 leading-none">{dp.month}</div>
          <div className="text-lg font-extrabold text-white leading-none">{dp.day}</div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/events/${event.id}`}>
            <h3 className="font-bold text-white line-clamp-1 hover:text-violet-300 transition">{event.title}</h3>
          </Link>
          <button
            onClick={() => toggleFavorite(event.id)}
            aria-label="Toggle favorite"
            className="shrink-0 text-slate-400 hover:text-pink-400 transition"
          >
            <Heart size={18} fill={isFav ? "#ec4899" : "none"} className={isFav ? "text-pink-500" : ""} />
          </button>
        </div>

        <div className="mt-2.5 space-y-1.5 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-violet-400" /> {dp.weekday}, {dp.month} {dp.day}
            <Clock size={14} className="text-violet-400 ml-1" /> {event.startTime}
          </div>
          <div className="flex items-center gap-2 line-clamp-1">
            <MapPin size={14} className="text-violet-400" /> {event.venueName}
            {event.venueCity ? `, ${event.venueCity}` : ""}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Starting from</span>
            <div className="text-violet-300 font-bold">{fmtMoney(event.startingPrice)}</div>
          </div>
          <Link
            href={`/events/${event.id}`}
            className="gradient-btn text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
