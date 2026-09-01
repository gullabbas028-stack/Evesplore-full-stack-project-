"use client";

import { useState } from "react";
import { Search, Mail, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { useApp } from "@/context/AppContext";

const FAQS = [
  { q: "How to book tickets?", a: "Browse events, select an event, choose your seats on the interactive seat map, proceed to checkout and pay securely. Your QR e-ticket is generated instantly." },
  { q: "How to cancel a booking?", a: "Go to My Bookings, find your booking and click Cancel. If cancellation is allowed, your seats are released and a refund is processed." },
  { q: "What payment methods are accepted?", a: "We accept all major credit and debit cards via Stripe, our secure payment processor. PayPal support is coming soon." },
  { q: "How to download my ticket?", a: "Open your ticket from My Bookings and click Download PDF, or print it directly. Your QR code is included." },
  { q: "How does the QR ticket work?", a: "Each ticket has a unique QR code containing a secure verification token. Staff scan it at the venue for instant, contactless entry." },
  { q: "What is your refund policy?", a: "Refunds are available for cancellations made before the event, subject to the organizer's policy. See our Refund Policy page for details." },
];

export default function SupportPage() {
  const { toast } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const [search, setSearch] = useState("");
  const filtered = FAQS.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white">How can we help?</h1>
        <p className="text-slate-400 mt-2">Search our help articles or reach out to our team</p>
        <div className="max-w-lg mx-auto mt-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search support articles..."
            className="w-full bg-[#10182b] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Popular Topics</h2>
      <div className="space-y-3 mb-10">
        {filtered.map((f, i) => (
          <div key={f.q} className="bg-[#10182b] border border-white/[0.06] rounded-xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
              <span className="text-white font-medium">{f.q}</span>
              <ChevronDown size={18} className={`text-slate-400 transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <div className="px-5 pb-4 text-slate-400 text-sm">{f.a}</div>}
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Mail, t: "Email Us", d: "support@evesplore.com" },
          { icon: Phone, t: "Call Us", d: "+92 300 1234567" },
          { icon: MessageCircle, t: "Live Chat", d: "Available 24/7" },
        ].map((c) => (
          <button key={c.t} onClick={() => toast("Connecting you to support...")} className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-6 text-center card-glow">
            <c.icon className="text-violet-400 mx-auto" size={26} />
            <div className="text-white font-semibold mt-3">{c.t}</div>
            <div className="text-slate-400 text-sm mt-1">{c.d}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
