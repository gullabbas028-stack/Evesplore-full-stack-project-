"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";
import { Button, Input } from "@/components/ui";
import AuthShell from "@/components/AuthShell";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, refreshFavorites, toast } = useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api<{ id: number; name: string; email: string; role: string; avatar: string | null }>("/auth/login", { method: "POST", json: form });
      setUser(user);
      await refreshFavorites();
      toast(`Welcome back, ${user.name.split(" ")[0]}!`);
      router.push(user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/events");
    } catch (err) {
      toast((err as Error).message, "error");
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to continue booking amazing events">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300">Forgot password?</Link>
        </div>
        <Button type="submit" full size="lg" loading={loading}>{loading ? "Logging in..." : "Login"}</Button>
      </form>

      <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm">
        <div className="text-violet-300 font-semibold mb-1">Demo Accounts</div>
        <div className="text-slate-400 text-xs space-y-0.5">
          <div>Admin: <span className="text-white">admin@evesplore.com</span> / admin123</div>
          <div>User: <span className="text-white">user@evesplore.com</span> / user123</div>
        </div>
      </div>

      <p className="text-center text-slate-400 text-sm mt-6">
        Don&apos;t have an account? <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium">Sign up</Link>
      </p>
    </AuthShell>
  );
}
