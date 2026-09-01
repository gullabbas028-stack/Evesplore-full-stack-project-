"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, Users, Ticket, Building2, Tag, CreditCard,
  BarChart3, ScanLine, Menu, X, LogOut, ArrowLeft,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { LogoMark, Spinner } from "./ui";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/venues", label: "Venues", icon: Building2 },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/ticket-scanner", label: "Ticket Scanner", icon: ScanLine },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loadingUser, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loadingUser && (!user || (user.role !== "ADMIN" && user.role !== "STAFF"))) router.push("/login");
  }, [user, loadingUser, router]);

  if (loadingUser || !user) return <Spinner size={36} />;
  if (user.role !== "ADMIN" && user.role !== "STAFF") return null;

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <Link href="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
        <LogoMark size={32} /><span className="text-lg font-extrabold gradient-text">EVESPLORE</span>
      </Link>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((n) => {
          const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${active ? "gradient-btn text-white" : "text-slate-300 hover:bg-white/5"}`}>
              <n.icon size={18} /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5"><ArrowLeft size={18} /> Back to Site</Link>
        <button onClick={async () => { await logout(); router.push("/"); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/10"><LogOut size={18} /> Logout</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-[#0b1224] border-r border-white/10 flex-col">{SidebarContent}</aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 z-40" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="lg:hidden fixed inset-y-0 left-0 w-64 bg-[#0b1224] border-r border-white/10 z-50">{SidebarContent}</motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 glass border-b border-white/10 h-16 flex items-center justify-between px-4 lg:px-8">
          <button className="lg:hidden text-white" onClick={() => setOpen(true)}><Menu size={24} /></button>
          <div className="lg:hidden flex items-center gap-2"><LogoMark size={28} /><span className="font-extrabold gradient-text">EVESPLORE</span></div>
          <div className="hidden lg:block text-white font-semibold">Admin Panel</div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=a855f7&color=fff`} className="w-9 h-9 rounded-full" alt="" />
            <div className="hidden sm:block"><div className="text-sm text-white font-medium leading-none">{user.name}</div><div className="text-xs text-slate-500">{user.role}</div></div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
