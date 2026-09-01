"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogoMark } from "./ui";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/60 to-violet-900/40" />
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute bottom-0 p-12">
          <Link href="/" className="flex items-center gap-2.5 mb-6"><LogoMark size={40} /><span className="text-2xl font-extrabold gradient-text">EVESPLORE</span></Link>
          <h2 className="text-4xl font-extrabold text-white leading-tight">Discover, Book &<br />Experience Live Events</h2>
          <p className="text-slate-300 mt-3 max-w-sm">Concerts, festivals, sports, theater and more. Your next unforgettable experience awaits.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 bg-[#050816]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden"><LogoMark size={34} /><span className="text-xl font-extrabold gradient-text">EVESPLORE</span></Link>
          <h1 className="text-2xl font-extrabold text-white">{title}</h1>
          <p className="text-slate-400 mt-1 mb-6">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
