"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, Ticket, DollarSign, TrendingUp, XCircle } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { api, fmtMoney } from "@/lib/client";
import { Card, Skeleton, Badge } from "@/components/ui";

type Dashboard = {
  stats: { totalUsers: number; totalEvents: number; totalBookings: number; totalRevenue: number; ticketsSold: number; cancelledBookings: number };
  revByDay: { day: string; revenue: number; count: number }[];
  byCategory: { name: string; value: number }[];
  recentBookings: { id: number; bookingCode: string; customer: string; event: string; amount: string; status: string; paymentStatus: string }[];
};

const COLORS = ["#a855f7", "#ec4899", "#8b5cf6", "#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#14b8a6", "#eab308", "#06b6d4"];

export default function AdminDashboard() {
  const [d, setD] = useState<Dashboard | null>(null);
  useEffect(() => { api<Dashboard>("/admin/dashboard").then(setD).catch(() => {}); }, []);

  if (!d) return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;

  const cards = [
    { label: "Total Users", value: d.stats.totalUsers, icon: Users, cls: "bg-violet-500/15 text-violet-400" },
    { label: "Total Events", value: d.stats.totalEvents, icon: Calendar, cls: "bg-pink-500/15 text-pink-400" },
    { label: "Total Bookings", value: d.stats.totalBookings, icon: Ticket, cls: "bg-blue-500/15 text-blue-400" },
    { label: "Total Revenue", value: fmtMoney(d.stats.totalRevenue), icon: DollarSign, cls: "bg-green-500/15 text-green-400" },
    { label: "Tickets Sold", value: d.stats.ticketsSold, icon: TrendingUp, cls: "bg-yellow-500/15 text-yellow-400" },
    { label: "Cancelled", value: d.stats.cancelledBookings, icon: XCircle, cls: "bg-red-500/15 text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm">Welcome back — here&apos;s what&apos;s happening on EVESPLORE</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.cls}`}>
              <c.icon size={20} />
            </div>
            <div className="text-2xl font-extrabold text-white">{c.value}</div>
            <div className="text-slate-400 text-xs mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-white font-bold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={d.revByDay}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#10182b", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-white font-bold mb-4">Events by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={d.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                {d.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#10182b", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-white font-bold mb-4">Bookings per Day</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={d.revByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: "#10182b", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} />
            <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="text-white font-bold mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-white/10">
                <th className="py-2 pr-4 font-medium">Booking ID</th>
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Event</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {d.recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-violet-300 font-medium">{b.bookingCode}</td>
                  <td className="py-3 pr-4 text-slate-200">{b.customer}</td>
                  <td className="py-3 pr-4 text-slate-300">{b.event}</td>
                  <td className="py-3 pr-4 text-white">{fmtMoney(b.amount)}</td>
                  <td className="py-3 pr-4"><Badge color={b.status === "CANCELLED" ? "red" : "green"}>{b.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
