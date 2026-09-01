"use client";

import { useState } from "react";
import { ScanLine, CheckCircle2, XCircle, AlertTriangle, Search } from "lucide-react";
import { api } from "@/lib/client";
import { Button, Card, Input } from "@/components/ui";
import { useApp } from "@/context/AppContext";

type Result = {
  result: "VALID" | "USED" | "CANCELLED" | "INVALID";
  message: string;
  booking?: { id: number; bookingCode: string; seats: { label: string }[]; ticketType: string; customerName: string; eventTitle: string; eventDate: string };
};

export default function TicketScanner() {
  const { toast } = useApp();
  const [code, setCode] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true); setRes(null);
    try {
      // Accept either "EVESPLORE|CODE|TOKEN" QR payload or a raw booking code
      let qrToken: string | undefined; let bookingCode: string | undefined;
      if (code.includes("|")) { const p = code.split("|"); bookingCode = p[1]; qrToken = p[2]; }
      else bookingCode = code.trim();
      const r = await api<Result>("/tickets/verify", { method: "POST", json: { qrToken, bookingCode } });
      setRes(r);
    } catch (err) { toast((err as Error).message, "error"); }
    finally { setLoading(false); }
  };

  const markUsed = async () => {
    if (!res?.booking) return;
    try { await api(`/tickets/${res.booking.id}/use`, { method: "POST" }); toast("Entry confirmed — ticket marked as USED"); setRes({ ...res, result: "USED", message: "Ticket already used" }); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mx-auto"><ScanLine className="text-white" size={30} /></div>
        <h1 className="text-2xl font-extrabold text-white mt-4">Ticket Scanner</h1>
        <p className="text-slate-400 text-sm">Verify tickets by scanning QR data or entering a booking code</p>
      </div>

      <Card className="p-6">
        <form onSubmit={verify} className="flex gap-2 items-end">
          <div className="flex-1"><Input label="QR Data / Booking Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="EVS-XXXXXX or paste QR data" /></div>
          <Button type="submit" loading={loading}><Search size={16} /> Verify</Button>
        </form>
        <p className="text-xs text-slate-500 mt-3">Tip: Enter a booking code like <span className="text-violet-300">EVS-XXXXXX</span> from any confirmed booking.</p>
      </Card>

      {res && (
        <Card className={`p-6 border-2 ${res.result === "VALID" ? "border-green-500/50" : res.result === "USED" ? "border-yellow-500/50" : "border-red-500/50"}`}>
          <div className="flex flex-col items-center text-center">
            {res.result === "VALID" && <CheckCircle2 className="text-green-400" size={56} />}
            {res.result === "USED" && <AlertTriangle className="text-yellow-400" size={56} />}
            {(res.result === "INVALID" || res.result === "CANCELLED") && <XCircle className="text-red-400" size={56} />}
            <h2 className={`text-xl font-extrabold mt-3 ${res.result === "VALID" ? "text-green-400" : res.result === "USED" ? "text-yellow-400" : "text-red-400"}`}>
              {res.result === "VALID" ? "VALID TICKET" : res.result === "USED" ? "TICKET ALREADY USED" : res.result === "CANCELLED" ? "TICKET CANCELLED" : "INVALID TICKET"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{res.message}</p>
          </div>

          {res.booking && (
            <div className="mt-5 bg-[#0b1224] rounded-xl p-4 space-y-2 text-sm">
              <Row label="Booking ID" value={res.booking.bookingCode} />
              <Row label="Event" value={res.booking.eventTitle} />
              <Row label="Customer" value={res.booking.customerName} />
              <Row label="Ticket Type" value={res.booking.ticketType} />
              <Row label="Seats" value={res.booking.seats.map((s) => s.label).join(", ")} />
            </div>
          )}

          {res.result === "VALID" && res.booking && (
            <Button full size="lg" variant="success" className="mt-5" onClick={markUsed}><CheckCircle2 size={18} /> Confirm Entry & Mark Used</Button>
          )}
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-400">{label}</span><span className="text-white font-medium">{value}</span></div>;
}
