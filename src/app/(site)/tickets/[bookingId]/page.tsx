"use client";

import { useEffect, useState, use } from "react";
import { Calendar, Clock, MapPin, Download, Printer, User } from "lucide-react";
import { api, fmtMoney, fmtDate } from "@/lib/client";
import { Button, Spinner, Badge, LogoMark } from "@/components/ui";
import QRCode from "@/components/QRCode";

type Booking = {
  id: number; bookingCode: string; qrToken: string; seats: { label: string; category: string }[];
  ticketType: string; totalAmount: string; ticketStatus: string; customerName: string;
  event: { title: string; date: string; startTime: string; endTime: string; banner: string; venueName: string; venueCity: string; venueAddress: string } | null;
};

export default function TicketPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [b, setB] = useState<Booking | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api<Booking>(`/bookings/${bookingId}`).then(setB).catch(() => setErr(true));
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("print")) {
      setTimeout(() => window.print(), 1200);
    }
  }, [bookingId]);

  if (err) return <div className="py-24 text-center text-white">Ticket not found.</div>;
  if (!b) return <Spinner size={36} />;

  const statusColor = b.ticketStatus === "VALID" ? "green" : b.ticketStatus === "USED" ? "yellow" : "red";

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-[#10182b] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
        {/* header */}
        <div className="gradient-btn px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><LogoMark size={30} /><span className="text-white font-extrabold tracking-tight">EVESPLORE</span></div>
          <Badge color={statusColor as "green"}>{b.ticketStatus}</Badge>
        </div>

        {/* event image */}
        {b.event?.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.event.banner} alt="" className="w-full h-40 object-cover" />
        )}

        <div className="p-6">
          <h1 className="text-xl font-bold text-white">{b.event?.title}</h1>
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <Info icon={<Calendar size={15} />} label="Date" value={b.event ? fmtDate(b.event.date) : ""} />
            <Info icon={<Clock size={15} />} label="Time" value={`${b.event?.startTime} – ${b.event?.endTime}`} />
            <Info icon={<MapPin size={15} />} label="Venue" value={`${b.event?.venueName}, ${b.event?.venueCity}`} />
            <Info icon={<User size={15} />} label="Customer" value={b.customerName} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div>
              <div className="text-slate-500 text-xs">Booking ID</div>
              <div className="text-violet-300 font-bold">{b.bookingCode}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs">Ticket Type</div>
              <div className="text-white font-semibold">{b.ticketType}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-slate-500 text-xs">Seats</div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {b.seats.map((s) => <span key={s.label} className="text-white text-sm bg-violet-500/15 border border-violet-500/30 rounded-lg px-2.5 py-1">{s.label}</span>)}
            </div>
          </div>
        </div>

        {/* perforation */}
        <div className="relative">
          <div className="border-t-2 border-dashed border-white/15 mx-6" />
          <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#050816]" />
          <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#050816]" />
        </div>

        {/* QR */}
        <div className="p-6 flex flex-col items-center">
          <QRCode value={`EVESPLORE|${b.bookingCode}|${b.qrToken}`} size={190} />
          <p className="text-slate-400 text-xs mt-3 text-center">Scan this QR code at the venue entrance for entry</p>
          <div className="text-white font-extrabold gradient-text text-lg mt-2">{fmtMoney(b.totalAmount)}</div>
        </div>
      </div>

      <div className="flex gap-3 mt-5 print:hidden">
        <Button full onClick={() => window.print()}><Printer size={16} /> Print Ticket</Button>
        <Button variant="outline" full onClick={() => window.print()}><Download size={16} /> Download PDF</Button>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-violet-400 mt-0.5">{icon}</span>
      <div><div className="text-slate-500 text-xs">{label}</div><div className="text-white">{value}</div></div>
    </div>
  );
}
