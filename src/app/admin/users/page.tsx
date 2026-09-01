"use client";

import { useEffect, useState } from "react";
import { api, fmtDate } from "@/lib/client";
import { Card, Skeleton, Badge } from "@/components/ui";

type U = { id: number; name: string; email: string; role: string; phone: string | null; avatar: string | null; createdAt: string };

export default function AdminUsers() {
  const [users, setUsers] = useState<U[] | null>(null);
  useEffect(() => { api<{ users: U[] }>("/admin/users").then((d) => setUsers(d.users)).catch(() => setUsers([])); }, []);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-extrabold text-white">Users</h1><p className="text-slate-400 text-sm">All registered users</p></div>
      {!users ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-slate-400 text-left border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 font-medium">User</th><th className="p-4 font-medium">Email</th><th className="p-4 font-medium">Phone</th><th className="p-4 font-medium">Role</th><th className="p-4 font-medium">Joined</th>
              </tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4"><div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=a855f7&color=fff`} className="w-9 h-9 rounded-full" alt="" />
                      <span className="text-white font-medium">{u.name}</span></div></td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4 text-slate-300">{u.phone || "—"}</td>
                    <td className="p-4"><Badge color={u.role === "ADMIN" ? "pink" : u.role === "STAFF" ? "blue" : "slate"}>{u.role}</Badge></td>
                    <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
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
