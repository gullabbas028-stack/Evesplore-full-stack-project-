import Link from "next/link";
import { LogoMark } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-[#050816]">
      <Link href="/" className="flex items-center gap-2.5 mb-8"><LogoMark size={40} /><span className="text-2xl font-extrabold gradient-text">EVESPLORE</span></Link>
      <div className="text-7xl font-extrabold gradient-text">404</div>
      <h1 className="text-2xl font-bold text-white mt-4">Page Not Found</h1>
      <p className="text-slate-400 mt-2 max-w-md">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="flex gap-3 mt-6">
        <Link href="/" className="gradient-btn text-white font-semibold px-6 py-3 rounded-xl">Go Home</Link>
        <Link href="/events" className="border border-white/15 text-slate-200 font-semibold px-6 py-3 rounded-xl hover:bg-white/5">Browse Events</Link>
      </div>
    </div>
  );
}
