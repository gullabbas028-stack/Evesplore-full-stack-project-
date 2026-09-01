"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Ticket, Eye, XCircle, Download } from "lucide-react";
import { api, fmtMoney, fmtDate } from "@/lib/client";
import { Button, Badge, Skeleton, EmptyState } from "@/components/ui";
import { useApp } from "@/context/AppContext";

type Booking = {
  id: number; bookingCode: string; seats: { label: string }[]; ticketType: string;
  totalAmount: string; bookingStatus: string; ticketStatus: string; createdAt: string;
  event: { id: number; title: string; date: string; startTime: string; banner: string; venueName: string; venueCity: string } | null;
};

const TABS = ["Upcoming", "Completed", "Cancelled"];

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loadingUser, toast } = useApp();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [tab, setTab] = useState("Upcoming");

  const load = () => api<{ bookings: Booking[] }>("/bookings/my").then((d) => setBookings(d.bookings)).catch(() => setBookings([]));

  useEffect(() => {
    if (!loadingUser && !user) { router.push("/login"); return; }
    if (user) load();
  }, [user, loadingUser, router]);

  const cancel = async (id: number) => {
    if (!confirm("Cancel this booking? Your seats will be released and refunded.")) return;
    try { await api(`/bookings/${id}/cancel`, { method: "POST" }); toast("Booking cancelled & refunded"); load(); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  const now = new Date().toISOString().slice(0, 10);
  const filtered = (bookings || []).filter((b) => {
    if (tab === "Cancelled") return b.bookingStatus === "CANCELLED";
    if (tab === "Completed") return b.bookingStatus !== "CANCELLED" && (b.ticketStatus === "USED" || (b.event && b.event.date < now));
    return b.bookingStatus !== "CANCELLED" && b.ticketStatus !== "USED" && (!b.event || b.event.date >= now);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">My Bookings</h1>
      <p className="text-slate-400 mb-6">Manage all your tickets and bookings in one place</p>

      <div className="flex gap-2 mb-6 border-b border-white/10">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t ? "border-violet-500 text-white" : "border-transparent text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {!bookings ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title={`No ${tab.toLowerCase()} bookings`} subtitle="Book your first event to see it here." action={<Button onClick={() => router.push("/events")}>Browse Events</Button>} />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-[#10182b] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col sm:flex-row card-glow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.event?.banner} alt="" className="sm:w-48 h-40 sm:h-auto object-cover" />
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-white font-bold">{b.event?.title}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><Calendar size={14} /> {b.event ? fmtDate(b.event.date) : ""} · {b.event?.startTime}</p>
                    <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={14} /> {b.event?.venueName}, {b.event?.venueCity}</p>
                  </div>
                  <StatusBadge status={b.bookingStatus} ticket={b.ticketStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                  <span className="text-slate-500">ID: <span className="text-violet-300 font-medium">{b.bookingCode}</span></span>
                  <span className="text-slate-500">Seats: <span className="text-white">{b.seats.map((s) => s.label).join(", ")}</span></span>
                  <span className="text-slate-500">Total: <span className="text-white font-semibold">{fmtMoney(b.totalAmount)}</span></span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm" onClick={() => router.push(`/tickets/${b.id}`)}><Ticket size={14} /> View Ticket</Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`/tickets/${b.id}?print=1`, "_blank")}><Download size={14} /> Download</Button>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/events/${b.event?.id}`)}><Eye size={14} /> Event</Button>
                  {b.bookingStatus !== "CANCELLED" && b.ticketStatus !== "USED" && (
                    <Button size="sm" variant="danger" onClick={() => cancel(b.id)}><XCircle size={14} /> Cancel</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, ticket }: { status: string; ticket: string }) {
  if (status === "CANCELLED") return <Badge color="red">Cancelled</Badge>;
  if (ticket === "USED") return <Badge color="yellow">Used</Badge>;
  return <Badge color="green">Confirmed</Badge>;
}
