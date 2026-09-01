"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { api, fmtMoney } from "@/lib/client";
import { Card, Skeleton } from "@/components/ui";

type Dashboard = {
  stats: { totalUsers: number; totalEvents: number; totalBookings: number; totalRevenue: number; ticketsSold: number; cancelledBookings: number };
  revByDay: { day: string; revenue: number; count: number }[];
  byCategory: { name: string; value: number }[];
};
const COLORS = ["#a855f7", "#ec4899", "#8b5cf6", "#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#14b8a6", "#eab308", "#06b6d4"];

export default function AdminAnalytics() {
  const [d, setD] = useState<Dashboard | null>(null);
  useEffect(() => { api<Dashboard>("/admin/dashboard").then(setD).catch(() => {}); }, []);
  if (!d) return <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-white">Analytics</h1><p className="text-slate-400 text-sm">Deep dive into your platform metrics</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Revenue" value={fmtMoney(d.stats.totalRevenue)} />
        <Stat label="Bookings" value={String(d.stats.totalBookings)} />
        <Stat label="Tickets Sold" value={String(d.stats.ticketsSold)} />
        <Stat label="Users" value={String(d.stats.totalUsers)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-white font-bold mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={d.revByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#10182b", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} />
              <Line type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={3} dot={{ fill: "#ec4899" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-white font-bold mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={d.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {d.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#10182b", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-white font-bold mb-4">Daily Bookings</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={d.revByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: "#10182b", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card className="p-5"><div className="text-2xl font-extrabold gradient-text">{value}</div><div className="text-slate-400 text-xs mt-1">{label}</div></Card>;
}
