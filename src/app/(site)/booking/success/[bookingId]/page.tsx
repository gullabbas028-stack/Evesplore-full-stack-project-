"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Ticket, Download, LayoutList, Calendar, MapPin, Clock } from "lucide-react";
import { api, fmtMoney, fmtDate } from "@/lib/client";
import { Button, Spinner } from "@/components/ui";

type Booking = {
  id: number; bookingCode: string; seats: { label: string; category: string }[];
  ticketType: string; totalAmount: string;
  event: { title: string; date: string; startTime: string; venueName: string; venueCity: string } | null;
};

export default function BookingSuccessPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();
  const [b, setB] = useState<Booking | null>(null);

  useEffect(() => { api<Booking>(`/bookings/${bookingId}`).then(setB).catch(() => router.push("/my-bookings")); }, [bookingId, router]);
  if (!b) return <Spinner size={36} />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center mx-auto">
        <CheckCircle2 className="text-green-400" size={56} />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-3xl font-extrabold text-white mt-6">Booking Confirmed!</motion.h1>
      <p className="text-slate-400 mt-2">Your tickets are ready. A confirmation email has been sent to you.</p>

      <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-6 mt-8 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <span className="text-slate-400 text-sm">Booking ID</span>
          <span className="text-violet-300 font-bold">{b.bookingCode}</span>
        </div>
        <div className="space-y-3 pt-4">
          <h2 className="text-white font-bold text-lg">{b.event?.title}</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Detail icon={<Calendar size={15} />} label="Date" value={b.event ? fmtDate(b.event.date) : ""} />
            <Detail icon={<Clock size={15} />} label="Time" value={b.event?.startTime || ""} />
            <Detail icon={<MapPin size={15} />} label="Venue" value={`${b.event?.venueName}, ${b.event?.venueCity}`} />
            <Detail icon={<Ticket size={15} />} label="Ticket Type" value={b.ticketType} />
          </div>
          <div>
            <span className="text-slate-500 text-xs">Seats</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {b.seats.map((s) => <span key={s.label} className="text-white text-sm bg-violet-500/15 border border-violet-500/30 rounded-lg px-2.5 py-1">{s.label}</span>)}
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-slate-400">Amount Paid</span>
            <span className="text-xl font-extrabold gradient-text">{fmtMoney(b.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        <Button full onClick={() => router.push(`/tickets/${b.id}`)}><Ticket size={16} /> View E-Ticket</Button>
        <Button variant="outline" full onClick={() => window.open(`/tickets/${b.id}?print=1`, "_blank")}><Download size={16} /> Download</Button>
        <Button variant="outline" full onClick={() => router.push("/my-bookings")}><LayoutList size={16} /> My Bookings</Button>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-violet-400">{icon}</span>
      <div><div className="text-slate-500 text-xs">{label}</div><div className="text-white">{value}</div></div>
    </div>
  );
}
