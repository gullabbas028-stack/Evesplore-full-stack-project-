"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { Button, Input, Textarea, Select, Card } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { DEFAULT_TICKET_TYPES } from "@/lib/seats";

const CATEGORIES = ["Music", "Concerts", "Sports", "Theater", "Comedy", "Festivals", "Workshops", "Conferences", "Family", "Arts"];

type Venue = { id: number; name: string; city: string };
export type EventFormData = {
  title: string; description: string; category: string; date: string; startTime: string; endTime: string;
  venueId: string; organizer: string; banner: string; rules: string; ageRestriction: string;
  totalCapacity: string; status: string; featured: boolean; popular: boolean;
  tags: string; ticketTypes: { name: string; price: number; color: string; desc: string; icon: string }[];
};

const empty: EventFormData = {
  title: "", description: "", category: "Music", date: "", startTime: "7:00 PM", endTime: "11:00 PM",
  venueId: "", organizer: "EVESPLORE", banner: "", rules: "", ageRestriction: "All Ages",
  totalCapacity: "150", status: "PUBLISHED", featured: false, popular: false, tags: "", ticketTypes: DEFAULT_TICKET_TYPES,
};

export default function EventForm({ eventId }: { eventId?: number }) {
  const router = useRouter();
  const { toast } = useApp();
  const [f, setF] = useState<EventFormData>(empty);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api<{ venues: Venue[] }>("/venues").then((d) => setVenues(d.venues)).catch(() => {}); }, []);

  useEffect(() => {
    if (!eventId) return;
    api<{ title: string; description: string; category: string; date: string; startTime: string; endTime: string; venueId: number; organizer: string; banner: string; rules: string; ageRestriction: string; totalCapacity: number; status: string; featured: boolean; popular: boolean; tags: string[]; ticketTypes: EventFormData["ticketTypes"] }>(`/events/${eventId}`)
      .then((d) => setF({
        title: d.title, description: d.description || "", category: d.category, date: d.date,
        startTime: d.startTime, endTime: d.endTime, venueId: String(d.venueId || ""), organizer: d.organizer || "",
        banner: d.banner || "", rules: d.rules || "", ageRestriction: d.ageRestriction || "All Ages",
        totalCapacity: String(d.totalCapacity), status: d.status, featured: !!d.featured, popular: !!d.popular,
        tags: (d.tags || []).join(", "), ticketTypes: d.ticketTypes || DEFAULT_TICKET_TYPES,
      }))
      .catch(() => toast("Failed to load event", "error"));
  }, [eventId, toast]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...f, venueId: f.venueId ? Number(f.venueId) : null, totalCapacity: Number(f.totalCapacity),
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (eventId) { await api(`/events/${eventId}`, { method: "PUT", json: payload }); toast("Event updated"); }
      else { await api("/events", { method: "POST", json: payload }); toast("Event created"); }
      router.push("/admin/events");
    } catch (err) { toast((err as Error).message, "error"); setSaving(false); }
  };

  const setTT = (i: number, price: number) => {
    const tt = [...f.ticketTypes]; tt[i] = { ...tt[i], price }; setF({ ...f, ticketTypes: tt });
  };

  return (
    <form onSubmit={submit} className="space-y-5 max-w-4xl">
      <h1 className="text-2xl font-extrabold text-white">{eventId ? "Edit Event" : "Create Event"}</h1>

      <Card className="p-6 space-y-4">
        <Input label="Event Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
        <Textarea label="Description" rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Venue" value={f.venueId} onChange={(e) => setF({ ...f, venueId: e.target.value })}>
            <option value="">Select venue</option>
            {venues.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
          </Select>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} required />
          <Input label="Start Time" value={f.startTime} onChange={(e) => setF({ ...f, startTime: e.target.value })} placeholder="7:00 PM" />
          <Input label="End Time" value={f.endTime} onChange={(e) => setF({ ...f, endTime: e.target.value })} placeholder="11:00 PM" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Organizer" value={f.organizer} onChange={(e) => setF({ ...f, organizer: e.target.value })} />
          <Input label="Age Restriction" value={f.ageRestriction} onChange={(e) => setF({ ...f, ageRestriction: e.target.value })} />
        </div>
        <Input label="Banner Image URL (Cloudinary)" value={f.banner} onChange={(e) => setF({ ...f, banner: e.target.value })} placeholder="https://..." />
        <Input label="Tags (comma separated)" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="Music, Live Concert" />
        <Textarea label="Event Rules" rows={2} value={f.rules} onChange={(e) => setF({ ...f, rules: e.target.value })} />
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-white font-bold">Ticket Types & Pricing (PKR)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {f.ticketTypes.map((t, i) => (
            <div key={t.name} className="flex items-center gap-3 bg-[#0b1224] rounded-xl p-3 border border-white/5">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
              <span className="text-white text-sm font-medium w-24">{t.name}</span>
              <input type="number" value={t.price} onChange={(e) => setTT(i, Number(e.target.value))} className="flex-1 bg-[#050816] border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
          ))}
        </div>
        <Input label="Total Capacity" type="number" value={f.totalCapacity} onChange={(e) => setF({ ...f, totalCapacity: e.target.value })} />
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-white font-bold">Publishing</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Select label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </Select>
          <label className="flex items-center gap-2 mt-6 text-slate-200 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="w-5 h-5 accent-violet-500" /> Featured</label>
          <label className="flex items-center gap-2 mt-6 text-slate-200 text-sm"><input type="checkbox" checked={f.popular} onChange={(e) => setF({ ...f, popular: e.target.checked })} className="w-5 h-5 accent-violet-500" /> Popular</label>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>{eventId ? "Update Event" : "Create Event"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/events")}>Cancel</Button>
      </div>
    </form>
  );
}
