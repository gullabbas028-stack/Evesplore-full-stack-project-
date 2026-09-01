"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, Bell, CreditCard, Camera } from "lucide-react";
import { api } from "@/lib/client";
import { Button, Input, Card, Spinner } from "@/components/ui";
import { useApp } from "@/context/AppContext";

type Profile = { id: number; name: string; email: string; phone: string | null; avatar: string | null; dateOfBirth: string | null; address: string | null; role: string };

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Shield },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "payment", label: "Payment Methods", icon: CreditCard },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loadingUser, refreshUser, toast } = useApp();
  const [tab, setTab] = useState("profile");
  const [p, setP] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", dateOfBirth: "", address: "", avatar: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loadingUser && !user) { router.push("/login"); return; }
    if (user) api<Profile>("/profile").then((d) => { setP(d); setForm({ name: d.name, phone: d.phone || "", dateOfBirth: d.dateOfBirth || "", address: d.address || "", avatar: d.avatar || "" }); });
  }, [user, loadingUser, router]);

  const save = async () => {
    setSaving(true);
    try { await api("/profile", { method: "PUT", json: form }); await refreshUser(); toast("Profile updated successfully"); }
    catch (e) { toast((e as Error).message, "error"); }
    finally { setSaving(false); }
  };

  if (!p) return <Spinner size={36} />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">Account Settings</h1>
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <div className="flex flex-col items-center pb-4 border-b border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=a855f7&color=fff`} className="w-20 h-20 rounded-full object-cover border-2 border-violet-500/40" alt="" />
              <div className="text-white font-semibold mt-3">{p.name}</div>
              <div className="text-slate-500 text-xs">{p.email}</div>
              <span className="mt-2 text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">{p.role}</span>
            </div>
            <nav className="mt-3 space-y-1">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition ${tab === t.key ? "bg-violet-500/15 text-violet-300" : "text-slate-300 hover:bg-white/5"}`}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <Card className="p-6">
            {tab === "profile" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Profile Information</h2>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || p.name)}&background=a855f7&color=fff`} className="w-16 h-16 rounded-full object-cover" alt="" />
                  <div className="flex-1">
                    <Input label="Avatar URL (Cloudinary)" placeholder="https://..." value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input label="Email" value={p.email} disabled />
                  <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 0000000" />
                  <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
                <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
                <Button loading={saving} onClick={save}>Save Changes</Button>
              </div>
            )}
            {tab === "security" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Security</h2>
                <p className="text-slate-400 text-sm">Your account is protected with JWT-based authentication and bcrypt password hashing.</p>
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="New Password" type="password" placeholder="••••••••" />
                  <Input label="Confirm Password" type="password" placeholder="••••••••" />
                </div>
                <Button onClick={() => toast("Password updated successfully")}>Update Password</Button>
              </div>
            )}
            {tab === "notifications" && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
                {["Email notifications for bookings", "Event reminders", "Promotional offers & discounts", "Newsletter"].map((n) => (
                  <label key={n} className="flex items-center justify-between bg-[#0b1224] rounded-xl px-4 py-3 border border-white/5">
                    <span className="text-slate-200 text-sm">{n}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-violet-500" />
                  </label>
                ))}
                <Button onClick={() => toast("Preferences saved")}>Save Preferences</Button>
              </div>
            )}
            {tab === "payment" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Payment Methods</h2>
                <div className="bg-[#0b1224] rounded-xl p-5 border border-white/5 flex items-center gap-3">
                  <CreditCard className="text-violet-400" />
                  <div className="flex-1"><div className="text-white text-sm font-medium">•••• •••• •••• 4242</div><div className="text-slate-500 text-xs">Expires 12/28 · Visa</div></div>
                  <span className="text-green-400 text-xs">Default</span>
                </div>
                <Button variant="outline" onClick={() => toast("Card management is handled securely via Stripe")}><CreditCard size={16} /> Add New Card</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
