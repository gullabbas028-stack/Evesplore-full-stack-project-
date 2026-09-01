"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { api, fmtMoney, fmtDate } from "@/lib/client";
import { Button, Card, Skeleton, Badge, EmptyState } from "@/components/ui";
import { useApp } from "@/context/AppContext";

type Ev = { id: number; title: string; category: string; date: string; startTime: string; startingPrice: string; status: string; banner: string; venueName?: string; totalCapacity: number; availableCapacity: number };

export default function AdminEvents() {
  const router = useRouter();
  const { toast } = useApp();
  const [events, setEvents] = useState<Ev[] | null>(null);

  const load = () => api<{ events: Ev[] }>("/events?limit=50&sort=newest").then((d) => setEvents(d.events)).catch(() => setEvents([]));
  useEffect(() => { load(); }, []);

  const del = async (id: number) => {
    if (!confirm("Delete this event permanently?")) return;
    try { await api(`/events/${id}`, { method: "DELETE" }); toast("Event deleted"); load(); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  const toggleStatus = async (ev: Ev) => {
    try { await api(`/events/${ev.id}`, { method: "PUT", json: { status: ev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } }); toast("Status updated"); load(); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-white">Events</h1><p className="text-slate-400 text-sm">Manage all events</p></div>
        <Button onClick={() => router.push("/admin/events/create")}><Plus size={16} /> Create Event</Button>
      </div>

      {!events ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : events.length === 0 ? (
        <EmptyState title="No events yet" action={<Button onClick={() => router.push("/admin/events/create")}>Create Event</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-slate-400 text-left border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 font-medium">Event</th><th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Seats</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.banner} alt="" className="w-12 h-10 rounded-lg object-cover" />
                        <div><div className="text-white font-medium line-clamp-1">{e.title}</div><div className="text-slate-500 text-xs">{e.venueName}</div></div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{e.category}</td>
                    <td className="p-4 text-slate-300">{fmtDate(e.date)}</td>
                    <td className="p-4 text-white">{fmtMoney(e.startingPrice)}</td>
                    <td className="p-4 text-slate-300">{e.totalCapacity - e.availableCapacity}/{e.totalCapacity}</td>
                    <td className="p-4"><Badge color={e.status === "PUBLISHED" ? "green" : "yellow"}>{e.status}</Badge></td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => toggleStatus(e)} title="Toggle publish" className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">{e.status === "PUBLISHED" ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        <Link href={`/admin/events/${e.id}/edit`} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-violet-300"><Edit size={16} /></Link>
                        <button onClick={() => del(e.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                    </td>
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
