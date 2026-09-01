"use client";

import { useEffect, useState, use } from "react";
import { MapPin, Users, Star } from "lucide-react";
import { api } from "@/lib/client";
import { Spinner, Badge } from "@/components/ui";
import EventCard, { EventLite } from "@/components/EventCard";

type Venue = { id: number; name: string; city: string; address: string; image: string | null; rating: string; capacity: number; description: string; events: EventLite[] };

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [v, setV] = useState<Venue | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { api<Venue>(`/venues/${id}`).then(setV).catch(() => setErr(true)); }, [id]);

  if (err) return <div className="py-24 text-center text-white">Venue not found.</div>;
  if (!v) return <Spinner size={36} />;

  return (
    <div>
      <div className="relative h-[38vh] min-h-[280px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={v.image || ""} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/50 to-transparent" />
        <div className="absolute bottom-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
            <Badge color="violet"><Star size={12} className="mr-1 fill-yellow-400 text-yellow-400" /> {v.rating}</Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-3">{v.name}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-slate-200 text-sm">
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-violet-400" /> {v.address || v.city}</span>
              <span className="flex items-center gap-1.5"><Users size={16} className="text-violet-400" /> {v.capacity} capacity</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-white mb-2">About This Venue</h2>
        <p className="text-slate-300 leading-relaxed max-w-3xl">{v.description}</p>

        <h2 className="text-2xl font-extrabold text-white mt-10 mb-6">Upcoming Events at {v.name}</h2>
        {v.events.length === 0 ? (
          <p className="text-slate-400">No upcoming events at this venue.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {v.events.map((e) => <EventCard key={e.id} event={{ ...e, venueName: v.name, venueCity: v.city }} />)}
          </div>
        )}
      </div>
    </div>
  );
}
