"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, ChevronDown, LogOut, User, Ticket, Heart, LayoutDashboard } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button, LogoMark } from "./ui";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Venues", href: "/venues" },
  { label: "About Us", href: "/about" },
  { label: "Support", href: "/support" },
];

export default function Navbar() {
  const { user, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={34} />
          <span className="text-xl font-extrabold tracking-tight gradient-text">EVESPLORE</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                pathname === n.href ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button className="relative text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] flex items-center justify-center">2</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenu((m) => !m)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=a855f7&color=fff`}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                    alt=""
                  />
                  <span className="text-sm text-white font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-56 glass rounded-xl border border-white/10 p-1.5 shadow-xl"
                      onMouseLeave={() => setMenu(false)}
                    >
                      <MenuLink href="/profile" icon={<User size={16} />} label="Profile" onClick={() => setMenu(false)} />
                      <MenuLink href="/my-bookings" icon={<Ticket size={16} />} label="My Bookings" onClick={() => setMenu(false)} />
                      <MenuLink href="/favorites" icon={<Heart size={16} />} label="Favorites" onClick={() => setMenu(false)} />
                      {(user.role === "ADMIN" || user.role === "STAFF") && (
                        <MenuLink href="/admin" icon={<LayoutDashboard size={16} />} label="Admin Dashboard" onClick={() => setMenu(false)} />
                      )}
                      <button
                        onClick={async () => {
                          setMenu(false);
                          await logout();
                          router.push("/");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-200 hover:text-white px-3 py-2">
                Login
              </Link>
              <Button size="sm" onClick={() => router.push("/register")}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        <button className="lg:hidden text-white p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-white/10 bg-[#0b1224]"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5">
                  {n.label}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2" />
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5">Profile</Link>
                  <Link href="/my-bookings" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5">My Bookings</Link>
                  <Link href="/favorites" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/5">Favorites</Link>
                  {(user.role === "ADMIN" || user.role === "STAFF") && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-violet-300 hover:bg-white/5">Admin Dashboard</Link>
                  )}
                  <button onClick={async () => { setOpen(false); await logout(); router.push("/"); }} className="text-left px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/10">Logout</button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" full onClick={() => { setOpen(false); router.push("/login"); }}>Login</Button>
                  <Button full onClick={() => { setOpen(false); router.push("/register"); }}>Sign Up</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5">
      {icon} {label}
    </Link>
  );
}
