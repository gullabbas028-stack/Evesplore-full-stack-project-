"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";
import { Button, Input } from "@/components/ui";
import AuthShell from "@/components/AuthShell";
import { useApp } from "@/context/AppContext";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, toast } = useApp();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast("Passwords do not match", "error"); return; }
    if (form.password.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    setLoading(true);
    try {
      const user = await api<{ id: number; name: string; email: string; role: string; avatar: string | null }>("/auth/register", { method: "POST", json: { name: form.name, email: form.email, password: form.password } });
      setUser(user);
      toast("Account created! Welcome to EVESPLORE 🎉");
      router.push("/events");
    } catch (err) {
      toast((err as Error).message, "error");
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join EVESPLORE and start booking events">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
        </div>
        <Button type="submit" full size="lg" loading={loading}>{loading ? "Creating account..." : "Sign Up"}</Button>
      </form>
      <p className="text-center text-slate-400 text-sm mt-6">
        Already have an account? <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Login</Link>
      </p>
    </AuthShell>
  );
}
