"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar, Clock, MapPin, Heart, Share2, Ticket, User, ShieldAlert,
  ChevronRight, Users, Tag,
} from "lucide-react";
import { api, fmtMoney, fmtDate } from "@/lib/client";
import { Button, Badge, Skeleton, Spinner } from "@/components/ui";
import EventCard, { EventLite } from "@/components/EventCard";
import { useApp } from "@/context/AppContext";

type EventDetail = {
  id: number; title: string; description: string; category: string; tags: string[];
  banner: string; images: string[]; date: string; startTime: string; endTime: string;
  organizer: string; rules: string; ageRestriction: string; availableCapacity: number;
  totalCapacity: number; startingPrice: string;
  ticketTypes: { name: string; price: number; color: string; desc: string }[];
  venue: { id: number; name: string; city: string; address: string; description: string; image: string } | null;
  similar: EventLite[];
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { favorites, toggleFavorite, toast } = useApp();
  const [ev, setEv] = useState<EventDetail | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api<EventDetail>(`/events/${id}`).then(setEv).catch(() => setErr(true));
  }, [id]);

  if (err) return <div className="max-w-3xl mx-auto px-6 py-24 text-center"><h2 className="text-xl text-white">Event not found</h2><Button className="mt-4" onClick={() => router.push("/events")}>Browse Events</Button></div>;
  if (!ev) return <Spinner size={36} />;

  const isFav = favorites.includes(ev.id);
  const soldPercent = Math.round(((ev.totalCapacity - ev.availableCapacity) / ev.totalCapacity) * 100);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: ev.title, url });
      else { await navigator.clipboard.writeText(url); toast("Link copied to clipboard"); }
    } catch { /* cancelled */ }
  };

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[42vh] min-h-[320px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ev.banner} alt={ev.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
            <div className="flex gap-2 mb-3">
              <Badge color="violet">{ev.category}</Badge>
              {ev.tags?.map((t) => <Badge key={t} color="pink">{t}</Badge>)}
            </div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-5xl font-extrabold text-white max-w-3xl">
              {ev.title}
            </motion.h1>
            <div className="flex flex-wrap gap-4 mt-4 text-slate-200 text-sm">
              <span className="flex items-center gap-1.5"><Calendar size={16} className="text-violet-400" /> {fmtDate(ev.date)}</span>
              <span className="flex items-center gap-1.5"><Clock size={16} className="text-violet-400" /> {ev.startTime} – {ev.endTime}</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-violet-400" /> {ev.venue?.name}, {ev.venue?.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">About This Event</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{ev.description}</p>
          </section>

          <section className="grid sm:grid-cols-2 gap-4">
            <InfoCard icon={<User className="text-violet-400" size={18} />} label="Organizer" value={ev.organizer} />
            <InfoCard icon={<ShieldAlert className="text-violet-400" size={18} />} label="Age Restriction" value={ev.ageRestriction} />
            <InfoCard icon={<Users className="text-violet-400" size={18} />} label="Capacity" value={`${ev.totalCapacity} seats`} />
            <InfoCard icon={<Ticket className="text-violet-400" size={18} />} label="Available" value={`${ev.availableCapacity} seats left`} />
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Ticket Types</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {ev.ticketTypes?.map((t) => (
                <div key={t.name} className="bg-[#10182b] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                      <span className="text-white font-semibold">{t.name}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{t.desc}</p>
                  </div>
                  <div className="text-violet-300 font-bold">{fmtMoney(t.price)}</div>
                </div>
              ))}
            </div>
          </section>

          {ev.rules && (
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Event Rules</h2>
              <div className="bg-[#10182b] border border-white/[0.06] rounded-xl p-4 text-slate-300 text-sm flex gap-2">
                <Tag size={18} className="text-yellow-400 shrink-0 mt-0.5" /> {ev.rules}
              </div>
            </section>
          )}

          {ev.venue && (
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Venue Information</h2>
              <Link href={`/venues/${ev.venue.id}`} className="block bg-[#10182b] border border-white/[0.06] rounded-2xl overflow-hidden card-glow">
                <div className="flex flex-col sm:flex-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ev.venue.image} alt="" className="sm:w-56 h-40 sm:h-auto object-cover" />
                  <div className="p-5 flex-1">
                    <h3 className="text-white font-bold">{ev.venue.name}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><MapPin size={14} /> {ev.venue.address || ev.venue.city}</p>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-2">{ev.venue.description}</p>
                    <span className="text-violet-400 text-sm flex items-center gap-1 mt-3">View venue <ChevronRight size={14} /></span>
                  </div>
                </div>
              </Link>
            </section>
          )}
        </div>

        {/* Right sticky booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5">
              <div className="text-sm text-slate-400">Starting from</div>
              <div className="text-3xl font-extrabold gradient-text">{fmtMoney(ev.startingPrice)}</div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{soldPercent}% booked</span>
                  <span>{ev.availableCapacity} left</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full gradient-btn" style={{ width: `${soldPercent}%` }} />
                </div>
              </div>

              <Button full size="lg" className="mt-5" onClick={() => router.push(`/events/${ev.id}/seats`)}>
                <Ticket size={18} /> Book Tickets
              </Button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" onClick={() => toggleFavorite(ev.id)}>
                  <Heart size={16} fill={isFav ? "#ec4899" : "none"} className={isFav ? "text-pink-500" : ""} /> {isFav ? "Saved" : "Favorite"}
                </Button>
                <Button variant="outline" onClick={share}><Share2 size={16} /> Share</Button>
              </div>
            </div>

            <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5 space-y-2">
              {["100% Secure Payments", "Instant Booking Confirmation", "QR Code E-Tickets", "Easy Cancellation"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Similar */}
      {ev.similar?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-2xl font-extrabold text-white mb-6">Similar Events</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ev.similar.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#10182b] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-white font-semibold text-sm">{value}</div>
      </div>
    </div>
  );
}
