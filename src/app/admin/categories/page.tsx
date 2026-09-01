"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { Button, Card, Skeleton, Input } from "@/components/ui";
import { useApp } from "@/context/AppContext";

type Cat = { id: number; name: string; icon: string; eventCount: number };
const EMOJI: Record<string, string> = { Music: "🎵", Concerts: "🎤", Sports: "🏆", Theater: "🎭", Comedy: "😂", Festivals: "🎉", Workshops: "🎓", Conferences: "💼", Family: "👨‍👩‍👧", Arts: "🎨" };

export default function AdminCategories() {
  const { toast } = useApp();
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api<{ categories: Cat[] }>("/categories").then((d) => setCats(d.categories)).catch(() => setCats([]));
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name) return; setSaving(true);
    try { await api("/categories", { method: "POST", json: { name } }); toast("Category added"); setName(""); load(); }
    catch (err) { toast((err as Error).message, "error"); } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try { await api(`/categories/${id}`, { method: "DELETE" }); toast("Category deleted"); load(); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-extrabold text-white">Categories</h1><p className="text-slate-400 text-sm">Manage event categories</p></div>

      <Card className="p-5">
        <form onSubmit={add} className="flex gap-3 items-end">
          <div className="flex-1"><Input label="New Category Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cinema" /></div>
          <Button type="submit" loading={saving}><Plus size={16} /> Add</Button>
        </form>
      </Card>

      {!cats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cats.map((c) => (
            <Card key={c.id} className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{EMOJI[c.name] || "🎫"}</div>
                <div><div className="text-white font-semibold">{c.name}</div><div className="text-slate-500 text-xs">{c.eventCount} events</div></div>
              </div>
              <button onClick={() => del(c.id)} className="text-slate-400 hover:text-red-400 p-2"><Trash2 size={16} /></button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
