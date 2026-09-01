"use client";

import { useEffect, useState } from "react";
import { api, fmtMoney } from "@/lib/client";
import { Card, Skeleton, Badge } from "@/components/ui";

type B = { id: number; bookingCode: string; customer: string; customerEmail: string; event: string; seats: { label: string }[]; amount: string; paymentStatus: string; bookingStatus: string; ticketStatus: string; createdAt: string };

export default function AdminBookings() {
  const [bookings, setBookings] = useState<B[] | null>(null);
  const [filter, setFilter] = useState("ALL");
  useEffect(() => { api<{ bookings: B[] }>("/admin/bookings").then((d) => setBookings(d.bookings)).catch(() => setBookings([])); }, []);

  const filtered = (bookings || []).filter((b) => filter === "ALL" || b.bookingStatus === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-white">Bookings</h1><p className="text-slate-400 text-sm">All bookings across events</p></div>
        <div className="flex gap-2">
          {["ALL", "CONFIRMED", "CANCELLED", "USED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === s ? "gradient-btn text-white" : "bg-[#10182b] text-slate-300 border border-white/10"}`}>{s}</button>
          ))}
        </div>
      </div>

      {!bookings ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-slate-400 text-left border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 font-medium">Booking ID</th><th className="p-4 font-medium">Customer</th><th className="p-4 font-medium">Event</th>
                <th className="p-4 font-medium">Seats</th><th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Payment</th><th className="p-4 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-violet-300 font-medium">{b.bookingCode}</td>
                    <td className="p-4"><div className="text-white">{b.customer}</div><div className="text-slate-500 text-xs">{b.customerEmail}</div></td>
                    <td className="p-4 text-slate-300">{b.event}</td>
                    <td className="p-4 text-slate-300">{b.seats?.map((s) => s.label).join(", ")}</td>
                    <td className="p-4 text-white">{fmtMoney(b.amount)}</td>
                    <td className="p-4"><Badge color={b.paymentStatus === "PAID" ? "green" : b.paymentStatus === "REFUNDED" ? "yellow" : "red"}>{b.paymentStatus}</Badge></td>
                    <td className="p-4"><Badge color={b.bookingStatus === "CANCELLED" ? "red" : b.ticketStatus === "USED" ? "yellow" : "green"}>{b.bookingStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
