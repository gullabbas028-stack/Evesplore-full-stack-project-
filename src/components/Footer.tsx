"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, Camera, AtSign, Video, Mail } from "lucide-react";
import { LogoMark, Button, Input } from "./ui";
import { useApp } from "@/context/AppContext";

export default function Footer() {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  return (
    <footer className="bg-[#0b1224] border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark size={34} />
              <span className="text-xl font-extrabold gradient-text">EVESPLORE</span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              Discover, book & experience live events. Concerts, festivals, sports, theater and more — all in one place.
            </p>
            <div className="flex gap-3 mt-5">
              {[Send, Camera, AtSign, Video].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-violet-500/20 flex items-center justify-center text-slate-300 hover:text-violet-300 transition">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Explore" links={[["Events", "/events"], ["Venues", "/venues"], ["About Us", "/about"], ["Support", "/support"]]} />
          <FooterCol title="Account" links={[["My Bookings", "/my-bookings"], ["Favorites", "/favorites"], ["Profile", "/profile"], ["Login", "/login"]]} />
          <FooterCol title="Legal" links={[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Refund Policy", "/refund-policy"]]} />
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6 items-center border-t border-white/10 pt-8">
          <div>
            <h4 className="text-white font-semibold flex items-center gap-2"><Mail size={18} className="text-violet-400" /> Subscribe to our newsletter</h4>
            <p className="text-slate-400 text-sm mt-1">Get the latest events & exclusive offers.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                toast("Subscribed! Check your inbox 🎉");
                setEmail("");
              }
            }}
            className="flex gap-2"
          >
            <Input placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>

        <div className="mt-10 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} EVESPLORE. All rights reserved. Built for live experiences.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-slate-400 hover:text-violet-300 text-sm transition">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
