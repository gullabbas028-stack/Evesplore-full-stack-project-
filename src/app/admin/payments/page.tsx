"use client";

import { useEffect, useState } from "react";
import { CreditCard, DollarSign, RotateCcw } from "lucide-react";
import { api, fmtMoney } from "@/lib/client";
import { Card, Skeleton, Badge } from "@/components/ui";

type B = { id: number; bookingCode: string; customer: string; event: string; amount: string; paymentStatus: string; createdAt: string };

export default function AdminPayments() {
  const [bookings, setBookings] = useState<B[] | null>(null);
  useEffect(() => { api<{ bookings: B[] }>("/admin/bookings").then((d) => setBookings(d.bookings)).catch(() => setBookings([])); }, []);

  const paid = (bookings || []).filter((b) => b.paymentStatus === "PAID");
  const refunded = (bookings || []).filter((b) => b.paymentStatus === "REFUNDED");
  const totalRev = paid.reduce((s, b) => s + Number(b.amount), 0);
  const totalRef = refunded.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-extrabold text-white">Payments</h1><p className="text-slate-400 text-sm">Transactions processed via Stripe</p></div>

      {!bookings ? <div className="grid sm:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div> : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-5"><DollarSign className="text-green-400 mb-2" /><div className="text-2xl font-extrabold text-white">{fmtMoney(totalRev)}</div><div className="text-slate-400 text-xs">Total Revenue</div></Card>
            <Card className="p-5"><CreditCard className="text-violet-400 mb-2" /><div className="text-2xl font-extrabold text-white">{paid.length}</div><div className="text-slate-400 text-xs">Successful Payments</div></Card>
            <Card className="p-5"><RotateCcw className="text-yellow-400 mb-2" /><div className="text-2xl font-extrabold text-white">{fmtMoney(totalRef)}</div><div className="text-slate-400 text-xs">Refunded ({refunded.length})</div></Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-slate-400 text-left border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 font-medium">Transaction</th><th className="p-4 font-medium">Customer</th><th className="p-4 font-medium">Event</th><th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Date</th>
                </tr></thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-violet-300 font-medium">{b.bookingCode}</td>
                      <td className="p-4 text-slate-200">{b.customer}</td>
                      <td className="p-4 text-slate-300">{b.event}</td>
                      <td className="p-4 text-white">{fmtMoney(b.amount)}</td>
                      <td className="p-4"><Badge color={b.paymentStatus === "PAID" ? "green" : b.paymentStatus === "REFUNDED" ? "yellow" : "red"}>{b.paymentStatus}</Badge></td>
                      <td className="p-4 text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
