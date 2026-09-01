"use client";

import { useEffect, useMemo, useRef, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Crown, Star, Ticket, Wallet, X, ArrowRight, ShieldCheck,
  Minus, Plus, RotateCcw, Calendar, RefreshCw, Zap, Smartphone, ShieldQuestion,
} from "lucide-react";
import { api, fmtMoney, dateParts } from "@/lib/client";
import { Button, Spinner, Badge } from "@/components/ui";
import { useApp } from "@/context/AppContext";

type Seat = {
  label: string; row: string; number: number; category: string; price: number;
  status: "AVAILABLE" | "BOOKED" | "LOCKED" | "MINE"; lockExpires: string | null;
};
type TicketType = { name: string; price: number; color: string; desc: string; icon: string };
type SeatData = {
  eventId: number;
  layout: { rows: string[]; seatsPerRow: number };
  ticketTypes: TicketType[];
  seats: Seat[];
  event: { title: string; date: string; startTime: string; endTime: string; banner: string; category: string; tags: string[]; venueName: string; venueCity: string };
};

const BOOKING_FEE = 500;
const SERVICE_FEE = 350;
const ICONS: Record<string, React.ElementType> = { crown: Crown, star: Star, ticket: Ticket, wallet: Wallet };

function getSessionId() {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("evs_session");
  if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("evs_session", sid); }
  return sid;
}

export default function SeatSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, toast } = useApp();
  const [data, setData] = useState<SeatData | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeType, setActiveType] = useState<string>("VIP");
  const [zoom, setZoom] = useState(100);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [locking, setLocking] = useState(false);
  const sessionId = useRef(getSessionId());

  const load = useCallback(async () => {
    try {
      const d = await api<SeatData>(`/events/${id}/seats?sessionId=${sessionId.current}`);
      setData(d);
      // keep already-locked-by-me seats selected
      const mine = d.seats.filter((s) => s.status === "MINE").map((s) => s.label);
      if (mine.length) {
        setSelected((prev) => Array.from(new Set([...prev, ...mine])));
        const exp = d.seats.find((s) => s.status === "MINE" && s.lockExpires)?.lockExpires;
        if (exp) setExpiresAt(new Date(exp).getTime());
      }
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  // Poll for real-time seat updates every 4s
  useEffect(() => {
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  // countdown
  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => {
      const rem = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(t);
        setSelected([]);
        setExpiresAt(null);
        toast("Seat hold expired. Please select again.", "error");
        load();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt, toast, load]);

  const seatMap = useMemo(() => {
    const m = new Map<string, Seat>();
    data?.seats.forEach((s) => m.set(s.label, s));
    return m;
  }, [data]);

  const syncLocks = useCallback(async (seats: string[]) => {
    if (!user) return;
    setLocking(true);
    try {
      const res = await api<{ expiresAt: string }>("/bookings/lock-seats", {
        method: "POST",
        json: { eventId: Number(id), sessionId: sessionId.current, seats },
      });
      if (seats.length) setExpiresAt(new Date(res.expiresAt).getTime());
      else setExpiresAt(null);
    } catch (e) {
      toast((e as Error).message, "error");
      await load();
    } finally {
      setLocking(false);
    }
  }, [id, user, toast, load]);

  const toggleSeat = async (seat: Seat) => {
    if (!user) { toast("Please login to select seats", "error"); router.push("/login"); return; }
    if (seat.status === "BOOKED") { toast("This seat is already booked", "error"); return; }
    if (seat.status === "LOCKED") { toast("This seat is locked by another user", "error"); return; }

    const isSel = selected.includes(seat.label);
    let next: string[];
    if (isSel) next = selected.filter((s) => s !== seat.label);
    else {
      if (selected.length >= 10) { toast("Max 10 seats per booking", "error"); return; }
      next = [...selected, seat.label];
    }
    setSelected(next);
    await syncLocks(next);
  };

  const clearAll = async () => { setSelected([]); await syncLocks([]); };
  const removeSeat = async (label: string) => { const next = selected.filter((s) => s !== label); setSelected(next); await syncLocks(next); };

  const selectedSeats = selected.map((l) => seatMap.get(l)).filter(Boolean) as Seat[];
  const subtotal = selectedSeats.reduce((s, x) => s + x.price, 0);
  const total = selectedSeats.length ? subtotal + BOOKING_FEE + SERVICE_FEE : 0;

  const proceed = () => {
    if (!selected.length) { toast("Please select at least one seat", "error"); return; }
    const payload = {
      eventId: Number(id),
      sessionId: sessionId.current,
      seats: selectedSeats.map((s) => ({ label: s.label, category: s.category, price: s.price })),
      expiresAt,
      event: data?.event,
    };
    sessionStorage.setItem("evs_checkout", JSON.stringify(payload));
    router.push("/checkout");
  };

  if (!data) return <Spinner size={36} />;
  const dp = dateParts(data.event.date);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Event header */}
      <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.event.banner} alt="" className="w-full sm:w-40 h-32 sm:h-24 object-cover rounded-xl" />
        <div className="flex items-center gap-4 flex-1">
          <div className="text-center bg-[#0b1224] rounded-xl px-3 py-2 border border-white/10">
            <div className="text-xs text-pink-400 font-bold">{dp.month}</div>
            <div className="text-2xl font-extrabold text-white leading-none">{dp.day}</div>
            <div className="text-xs text-slate-400">{dp.weekday}</div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{data.event.title}</h1>
            <p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><MapPin size={14} /> {data.event.venueName}, {data.event.venueCity}</p>
            <p className="text-slate-400 text-sm flex items-center gap-1"><Clock size={14} /> {data.event.startTime} – {data.event.endTime}</p>
            <div className="flex gap-2 mt-2">
              {data.event.tags?.map((t) => <Badge key={t} color="violet">{t}</Badge>)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seat map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold text-white">Select Your Seats</h2>
              <div className="flex flex-wrap gap-3 text-xs">
                <Legend color="#22c55e" label="Available" />
                <Legend color="#3b82f6" label="Selected" />
                <Legend color="#ef4444" label="Booked" />
                <Legend color="#f59e0b" label={`Locked${remaining ? ` (${mm}:${ss})` : ""}`} />
              </div>
            </div>

            {/* Stage */}
            <div className="mb-6">
              <div className="mx-auto w-3/4 h-8 rounded-t-[50%] bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center">
                <span className="text-slate-300 text-xs font-bold tracking-[0.3em]">STAGE</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-max mx-auto" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
                {data.layout.rows.map((row) => (
                  <div key={row} className="flex items-center gap-1.5 mb-1.5 justify-center">
                    <span className="w-5 text-slate-500 text-xs font-medium">{row}</span>
                    {data.seats.filter((s) => s.row === row).map((seat) => {
                      const isSel = selected.includes(seat.label);
                      const status = isSel ? "SELECTED" : seat.status;
                      return (
                        <button
                          key={seat.label}
                          onClick={() => toggleSeat(seat)}
                          disabled={seat.status === "BOOKED" || seat.status === "LOCKED"}
                          title={`${seat.label} · ${seat.category} · ${fmtMoney(seat.price)}`}
                          aria-label={`Seat ${seat.label}`}
                          className={`w-7 h-7 rounded-md text-[10px] font-semibold flex items-center justify-center transition ${seatColor(status)}`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Zoom</span>
                <button onClick={() => setZoom((z) => Math.max(60, z - 10))} className="w-8 h-8 rounded-lg bg-[#0b1224] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"><Minus size={14} /></button>
                <span className="text-white text-sm w-12 text-center">{zoom}%</span>
                <button onClick={() => setZoom((z) => Math.min(140, z + 10))} className="w-8 h-8 rounded-lg bg-[#0b1224] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"><Plus size={14} /></button>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setZoom(100); load(); }}>
                <RotateCcw size={14} /> Reset View
              </Button>
            </div>
          </div>

          {/* Ticket types */}
          <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Select Ticket Type</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.ticketTypes.map((t) => {
                const Icon = ICONS[t.icon] || Ticket;
                const active = activeType === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setActiveType(t.name)}
                    className={`text-left rounded-xl p-4 border transition relative ${active ? "border-violet-500 bg-violet-500/10 neon-ring" : "border-white/10 bg-[#0b1224] hover:border-white/20"}`}
                  >
                    {active && <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs">✓</span>}
                    <Icon size={20} style={{ color: t.color }} />
                    <div className="text-white font-semibold mt-2">{t.name}</div>
                    <div className="text-violet-300 text-sm font-bold">{fmtMoney(t.price)}</div>
                    <div className="text-slate-500 text-xs mt-1">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* footer badges */}
          <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, t: "Instant Confirmation", s: "Get your tickets instantly" },
              { icon: Smartphone, t: "Mobile Tickets", s: "Show QR code on entry" },
              { icon: RefreshCw, t: "Easy Refunds", s: "Hassle-free cancellation" },
              { icon: ShieldQuestion, t: "Safe & Secure", s: "256-bit SSL protected" },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-2.5">
                <f.icon size={22} className="text-pink-400 shrink-0" />
                <div>
                  <div className="text-white text-sm font-medium">{f.t}</div>
                  <div className="text-slate-500 text-xs">{f.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Your Booking</h3>
                {remaining > 0 && (
                  <span className="text-sm font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg tabular-nums">{mm}:{ss}</span>
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm font-medium">Selected Seats ({selected.length})</span>
                {selected.length > 0 && (
                  <button onClick={clearAll} className="text-pink-400 text-xs hover:text-pink-300">Clear All</button>
                )}
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {selectedSeats.length === 0 && <p className="text-slate-500 text-sm py-4 text-center">No seats selected yet</p>}
                {selectedSeats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between bg-[#0b1224] rounded-lg px-3 py-2 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{s.label}</span>
                      <Badge color="violet">{s.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 text-sm">{fmtMoney(s.price)}</span>
                      <button onClick={() => removeSeat(s.label)} className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedSeats.length > 0 && (
                <>
                  <div className="border-t border-white/10 mt-4 pt-4 space-y-2 text-sm">
                    <div className="text-white font-semibold mb-1">Price Summary</div>
                    <Row label={`Tickets (${selectedSeats.length})`} value={fmtMoney(subtotal)} />
                    <Row label="Booking Fee" value={fmtMoney(BOOKING_FEE)} />
                    <Row label="Service Charge" value={fmtMoney(SERVICE_FEE)} />
                  </div>
                  <div className="border-t border-white/10 mt-3 pt-3 flex items-center justify-between">
                    <span className="text-white font-semibold">Total Amount</span>
                    <span className="text-xl font-extrabold gradient-text">{fmtMoney(total)}</span>
                  </div>
                </>
              )}

              <Button full size="lg" className="mt-5" loading={locking} onClick={proceed} disabled={!selected.length}>
                Proceed to Payment <ArrowRight size={18} />
              </Button>
              <p className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> You&apos;ll be able to review your order
              </p>
            </div>

            <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="text-green-400" size={22} />
                <span className="text-white font-semibold">Secure Booking</span>
              </div>
              <p className="text-slate-400 text-xs">Your payment is protected with 256-bit SSL encryption</p>
              <div className="flex gap-3 mt-3 text-slate-400 text-xs font-bold">
                <span className="text-violet-400">stripe</span><span>VISA</span><span className="text-orange-400">MC</span><span className="text-blue-400">PayPal</span>
              </div>
            </div>

            <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5">
              <div className="text-white font-semibold mb-3">Why book with EVESPLORE?</div>
              {["100% Secure Payments", "Instant Booking Confirmation", "QR Code Ticket Delivery", "24/7 Customer Support"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                  <span className="text-green-400">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function seatColor(status: string) {
  switch (status) {
    case "BOOKED": return "bg-red-500 text-white cursor-not-allowed";
    case "LOCKED": return "bg-yellow-500 text-black cursor-not-allowed";
    case "SELECTED": return "bg-blue-500 text-white ring-2 ring-blue-300";
    case "MINE": return "bg-blue-500 text-white ring-2 ring-blue-300";
    default: return "bg-green-500 hover:bg-green-400 text-white";
  }
}
function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3.5 h-3.5 rounded" style={{ background: color }} /> {label}</span>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-slate-400"><span>{label}</span><span className="text-slate-200">{value}</span></div>;
}
