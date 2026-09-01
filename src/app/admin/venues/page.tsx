"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, MapPin, X } from "lucide-react";
import { api } from "@/lib/client";
import { Button, Card, Skeleton, Input, Textarea, EmptyState } from "@/components/ui";
import { useApp } from "@/context/AppContext";

type Venue = { id: number; name: string; city: string; address: string; description: string; image: string | null; capacity: number; upcomingEvents: number };

export default function AdminVenues() {
  const { toast } = useApp();
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Venue | null>(null);
  const [f, setF] = useState({ name: "", city: "", address: "", description: "", image: "", capacity: "150" });
  const [saving, setSaving] = useState(false);

  const load = () => api<{ venues: Venue[] }>("/venues").then((d) => setVenues(d.venues)).catch(() => setVenues([]));
  useEffect(() => { load(); }, []);

  const open = (v?: Venue) => {
    if (v) { setEdit(v); setF({ name: v.name, city: v.city, address: v.address || "", description: v.description || "", image: v.image || "", capacity: String(v.capacity) }); }
    else { setEdit(null); setF({ name: "", city: "", address: "", description: "", image: "", capacity: "150" }); }
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...f, capacity: Number(f.capacity) };
    try {
      if (edit) { await api(`/venues/${edit.id}`, { method: "PUT", json: payload }); toast("Venue updated"); }
      else { await api("/venues", { method: "POST", json: payload }); toast("Venue created"); }
      setModal(false); load();
    } catch (err) { toast((err as Error).message, "error"); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this venue?")) return;
    try { await api(`/venues/${id}`, { method: "DELETE" }); toast("Venue deleted"); load(); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-white">Venues</h1><p className="text-slate-400 text-sm">Manage venues & seat layouts</p></div>
        <Button onClick={() => open()}><Plus size={16} /> Add Venue</Button>
      </div>

      {!venues ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : venues.length === 0 ? <EmptyState title="No venues" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.image || ""} alt="" className="w-full h-32 object-cover" />
              <div className="p-4">
                <h3 className="text-white font-bold">{v.name}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><MapPin size={13} /> {v.city}</p>
                <p className="text-slate-500 text-xs mt-2">Capacity: {v.capacity} · {v.upcomingEvents} events</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => open(v)}><Edit size={14} /> Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => del(v.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setModal(false)}>
          <div className="bg-[#10182b] border border-white/10 rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{edit ? "Edit Venue" : "Add Venue"}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <Input label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} required />
                <Input label="Capacity" type="number" value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} />
              </div>
              <Input label="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
              <Input label="Image URL" value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} placeholder="https://..." />
              <Textarea label="Description" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
              <div className="text-xs text-slate-500">Default seat layout (10 rows × 15 seats, VIP/Premium/Standard/Economy) is applied automatically.</div>
              <div className="flex gap-2"><Button type="submit" loading={saving}>Save</Button><Button type="button" variant="outline" onClick={() => setModal(false)}>Cancel</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
