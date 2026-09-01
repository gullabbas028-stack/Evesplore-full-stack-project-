"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck, Zap, QrCode, Headphones, ArrowRight, Search, MapPin,
  Star, TrendingUp, Sparkles, Quote,
} from "lucide-react";
import { api, fmtMoney } from "@/lib/client";
import EventCard, { EventLite } from "@/components/EventCard";
import { Button, Skeleton, Badge } from "@/components/ui";

type Venue = { id: number; name: string; city: string; image: string | null; rating: string; capacity: number; upcomingEvents: number };
type Cat = { id: number; name: string; icon: string; eventCount: number };

const CAT_EMOJI: Record<string, string> = {
  Music: "🎵", Concerts: "🎤", Sports: "🏆", Theater: "🎭", Comedy: "😂",
  Festivals: "🎉", Workshops: "🎓", Conferences: "💼", Family: "👨‍👩‍👧", Arts: "🎨",
};

export default function HomePage() {
  const router = useRouter();
  const [popular, setPopular] = useState<EventLite[] | null>(null);
  const [upcoming, setUpcoming] = useState<EventLite[] | null>(null);
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api<{ events: EventLite[] }>("/events?popular=true&limit=4").then((d) => setPopular(d.events)).catch(() => setPopular([]));
    api<{ events: EventLite[] }>("/events?sort=newest&limit=8").then((d) => setUpcoming(d.events)).catch(() => setUpcoming([]));
    api<{ venues: Venue[] }>("/venues").then((d) => setVenues(d.venues.slice(0, 3))).catch(() => setVenues([]));
    api<{ categories: Cat[] }>("/categories").then((d) => setCats(d.categories)).catch(() => setCats([]));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050816]/70 via-[#050816]/85 to-[#050816]" />
          <div className="absolute inset-0 hero-grid opacity-40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge color="violet">
              <Sparkles size={13} className="mr-1" /> #1 Live Events Platform
            </Badge>
            <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Discover, Book &<br />
              <span className="gradient-text">Experience Live Events</span>
            </h1>
            <p className="mt-5 text-slate-300 text-lg max-w-2xl mx-auto">
              Concerts, festivals, sports, theater and more. Find events near you and book your seats easily.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); router.push(`/events?q=${encodeURIComponent(q)}`); }}
              className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search events, artists, venues..."
                  className="w-full bg-[#10182b] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
              <Button type="submit" size="lg">Explore Events <ArrowRight size={18} /></Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="md" onClick={() => router.push("/events")}>
                <MapPin size={16} /> Find Events Near Me
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, title: "100% Secure Payments", sub: "256-bit SSL encryption" },
            { icon: Zap, title: "Instant Confirmation", sub: "Get tickets instantly" },
            { icon: QrCode, title: "QR Code E-Tickets", sub: "Show at the door" },
            { icon: Headphones, title: "24/7 Support", sub: "We're always here" },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl gradient-btn flex items-center justify-center shrink-0">
                <f.icon size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{f.title}</div>
                <div className="text-slate-400 text-xs">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <Section title="Popular Events" subtitle="The hottest events everyone's booking" icon={<TrendingUp className="text-violet-400" />} href="/events">
        <Grid loading={!popular} count={4}>
          {popular?.map((e) => <EventCard key={e.id} event={e} />)}
        </Grid>
      </Section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHead title="Browse by Category" subtitle="Find exactly what you're looking for" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {(cats || Array.from({ length: 10 })).map((c, i) =>
            c ? (
              <Link
                key={(c as Cat).id}
                href={`/events?category=${encodeURIComponent((c as Cat).name)}`}
                className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5 text-center card-glow hover:border-violet-500/40 transition"
              >
                <div className="text-3xl mb-2">{CAT_EMOJI[(c as Cat).name] || "🎫"}</div>
                <div className="text-white font-semibold text-sm">{(c as Cat).name}</div>
                <div className="text-slate-500 text-xs mt-0.5">{(c as Cat).eventCount} events</div>
              </Link>
            ) : (
              <Skeleton key={i} className="h-28" />
            )
          )}
        </div>
      </section>

      {/* UPCOMING */}
      <Section title="Upcoming Events" subtitle="Don't miss out — book early" href="/events">
        <Grid loading={!upcoming} count={8}>
          {upcoming?.map((e) => <EventCard key={e.id} event={e} />)}
        </Grid>
      </Section>

      {/* FEATURED VENUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHead title="Featured Venues" subtitle="Iconic locations for unforgettable events" href="/venues" />
        <div className="grid md:grid-cols-3 gap-5">
          {(venues || Array.from({ length: 3 })).map((v, i) =>
            v ? (
              <Link key={(v as Venue).id} href={`/venues/${(v as Venue).id}`} className="relative rounded-2xl overflow-hidden group card-glow border border-white/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={(v as Venue).image || ""} alt="" className="w-full h-56 object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-medium">{(v as Venue).rating}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{(v as Venue).name}</h3>
                  <p className="text-slate-300 text-sm flex items-center gap-1"><MapPin size={13} /> {(v as Venue).city} · {(v as Venue).upcomingEvents} events</p>
                </div>
              </Link>
            ) : (
              <Skeleton key={i} className="h-56" />
            )
          )}
        </div>
      </section>

      {/* WHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <SectionHead title="Why Choose EVESPLORE" subtitle="The smartest way to experience live events" center />
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: "🎟️", t: "Real-Time Seat Selection", d: "Pick your exact seats with live availability and instant seat locking." },
            { icon: "🔒", t: "Bank-Grade Security", d: "Your payments and data are protected with enterprise-level encryption." },
            { icon: "⚡", t: "Instant E-Tickets", d: "Receive QR e-tickets immediately — no printing, no queues." },
          ].map((f) => (
            <div key={f.t} className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold">{f.t}</h3>
              <p className="text-slate-400 text-sm mt-2">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SectionHead title="What Our Users Say" subtitle="Loved by thousands of event-goers" center />
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { n: "Hamza Tariq", r: "Regular Concert-goer", t: "EVESPLORE made booking so easy! Real-time seat selection is a game changer.", a: "https://i.pravatar.cc/100?img=12" },
            { n: "Fatima Noor", r: "Festival Fan", t: "Got my QR ticket instantly and entry was smooth. Highly recommend!", a: "https://i.pravatar.cc/100?img=47" },
            { n: "Usman Sheikh", r: "Sports Enthusiast", t: "Best platform for booking match tickets. The interface is stunning.", a: "https://i.pravatar.cc/100?img=15" },
          ].map((tst) => (
            <div key={tst.n} className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-6">
              <Quote className="text-violet-500/40" size={28} />
              <p className="text-slate-300 text-sm mt-2">{tst.t}</p>
              <div className="flex items-center gap-3 mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tst.a} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <div className="text-white text-sm font-semibold">{tst.n}</div>
                  <div className="text-slate-500 text-xs">{tst.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="relative rounded-3xl overflow-hidden gradient-btn p-10 sm:p-14 text-center">
          <div className="absolute inset-0 hero-grid opacity-20" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to experience live events?</h2>
            <p className="text-white/90 mt-3 max-w-xl mx-auto">Join thousands of event-goers booking their next unforgettable experience on EVESPLORE.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link href="/events" className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition">Explore Events</Link>
              <Link href="/register" className="bg-black/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-black/40 transition border border-white/20">Sign Up Free</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, subtitle, href, center }: { title: string; subtitle?: string; href?: string; center?: boolean }) {
  return (
    <div className={`flex items-end justify-between mb-6 ${center ? "flex-col text-center items-center gap-1" : ""}`}>
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {href && !center && (
        <Link href={href} className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1 shrink-0">
          View All <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function Section({ title, subtitle, icon, href, children }: { title: string; subtitle?: string; icon?: React.ReactNode; href?: string; children: React.ReactNode }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">{icon}{title}</h2>
          {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1 shrink-0">
            View All <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid({ children, loading, count }: { children: React.ReactNode; loading: boolean; count: number }) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-80" />)}
      </div>
    );
  }
  return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{children}</div>;
}
