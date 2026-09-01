"use client";

import { motion } from "framer-motion";
import { Target, Eye, Sparkles, Users, Calendar, Building2, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function AboutPage() {
  const stats = [
    { icon: Users, value: "250K+", label: "Happy Users" },
    { icon: Calendar, value: "10K+", label: "Events Hosted" },
    { icon: Building2, value: "500+", label: "Partner Venues" },
    { icon: ThumbsUp, value: "99.9%", label: "Satisfaction" },
  ];
  return (
    <div>
      <section className="relative py-20 text-center overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-extrabold text-white">
            About <span className="gradient-text">EVESPLORE</span>
          </motion.h1>
          <p className="text-slate-300 text-lg mt-4">
            EVESPLORE is the premier destination for discovering and booking live events. We connect millions of fans with unforgettable experiences — from electrifying concerts to championship finals.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-6 text-center">
              <s.icon className="text-violet-400 mx-auto" size={28} />
              <div className="text-3xl font-extrabold gradient-text mt-2">{s.value}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-5">
        {[
          { icon: Target, t: "Our Mission", d: "To make live experiences accessible to everyone through a seamless, secure and delightful booking platform." },
          { icon: Eye, t: "Our Vision", d: "A world where discovering and attending live events is effortless, joyful and part of everyday life." },
          { icon: Sparkles, t: "Why EVESPLORE", d: "Real-time seat selection, instant QR e-tickets, bank-grade security and 24/7 support — all in one beautiful platform." },
        ].map((c) => (
          <div key={c.t} className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center"><c.icon className="text-white" size={22} /></div>
            <h3 className="text-white font-bold mt-4">{c.t}</h3>
            <p className="text-slate-400 text-sm mt-2">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <div className="gradient-btn rounded-3xl p-10">
          <h2 className="text-2xl font-extrabold text-white">Join the EVESPLORE community</h2>
          <p className="text-white/90 mt-2">Discover your next unforgettable experience today.</p>
          <Link href="/events" className="inline-block mt-5"><Button className="bg-white text-violet-700 hover:bg-slate-100">Explore Events</Button></Link>
        </div>
      </section>
    </div>
  );
}
