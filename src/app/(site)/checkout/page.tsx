"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Lock, Tag, ArrowRight, ShieldCheck, Calendar, MapPin } from "lucide-react";
import { api, fmtMoney, dateParts } from "@/lib/client";
import { Button, Input, Badge } from "@/components/ui";
import { useApp } from "@/context/AppContext";

type Checkout = {
  eventId: number;
  sessionId: string;
  seats: { label: string; category: string; price: number }[];
  event: { title: string; date: string; startTime: string; endTime: string; banner: string; venueName: string; venueCity: string };
};

const BOOKING_FEE = 500;
const SERVICE_FEE = 350;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, toast } = useApp();
  const [data, setData] = useState<Checkout | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applied, setApplied] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("evs_checkout") : null;
    if (!raw) { router.push("/events"); return; }
    setData(JSON.parse(raw));
  }, [router]);

  useEffect(() => { if (!user) { toast("Please login to checkout", "error"); router.push("/login"); } }, [user, router, toast]);

  if (!data) return null;

  const subtotal = data.seats.reduce((s, x) => s + x.price, 0);
  const total = subtotal + BOOKING_FEE + SERVICE_FEE - discount;
  const dp = dateParts(data.event.date);

  const applyCoupon = () => {
    const map: Record<string, number> = { EVES10: 10, WELCOME20: 20, VIP15: 15 };
    const pct = map[coupon.toUpperCase()];
    if (pct) { setDiscount(Math.round((subtotal * pct) / 100)); setApplied(coupon.toUpperCase()); toast(`Coupon applied — ${pct}% off!`); }
    else { setDiscount(0); setApplied(""); toast("Invalid coupon code", "error"); }
  };

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (card.number.replace(/\s/g, "").length < 12 || !card.expiry || card.cvc.length < 3) {
      toast("Please enter valid card details", "error"); return;
    }
    setProcessing(true);
    try {
      const res = await api<{ bookingId: number }>("/bookings/create", {
        method: "POST",
        json: { eventId: data.eventId, sessionId: data.sessionId, seats: data.seats, couponCode: applied || undefined },
      });
      sessionStorage.removeItem("evs_checkout");
      toast("Payment successful! Booking confirmed 🎉");
      router.push(`/booking/success/${res.bookingId}`);
    } catch (err) {
      toast((err as Error).message, "error");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-4 flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.event.banner} alt="" className="w-28 h-24 object-cover rounded-xl" />
            <div>
              <h2 className="text-white font-bold">{data.event.title}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><Calendar size={14} /> {dp.weekday}, {dp.month} {dp.day} · {data.event.startTime}</p>
              <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={14} /> {data.event.venueName}, {data.event.venueCity}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {data.seats.map((s) => <Badge key={s.label} color="violet">{s.label} · {s.category}</Badge>)}
              </div>
            </div>
          </div>

          <form onSubmit={pay} className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="text-violet-400" size={20} />
              <h2 className="text-lg font-bold text-white">Payment Details</h2>
              <span className="ml-auto text-xs text-slate-500 flex items-center gap-1"><Lock size={12} /> Secure</span>
            </div>

            <Input label="Cardholder Name" placeholder="John Doe" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} required />
            <Input
              label="Card Number" placeholder="4242 4242 4242 4242" inputMode="numeric"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19) })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiry (MM/YY)" placeholder="12/28" value={card.expiry}
                onChange={(e) => { let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); setCard({ ...card, expiry: v }); }} required />
              <Input label="CVC" placeholder="123" inputMode="numeric" value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/[^\d]/g, "").slice(0, 4) })} required />
            </div>

            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck size={16} className="text-violet-400" />
              This is a demo Stripe integration. Use any card number (e.g. 4242 4242 4242 4242). No real charge is made.
            </div>

            <Button type="submit" full size="lg" loading={processing}>
              {processing ? "Processing Payment..." : <>Pay {fmtMoney(total)} <ArrowRight size={18} /></>}
            </Button>
          </form>
        </div>

        {/* Order summary */}
        <div>
          <div className="sticky top-20 bg-[#10182b] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {data.seats.map((s) => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{s.label} ({s.category})</span>
                  <span className="text-slate-200">{fmtMoney(s.price)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="ENTER PROMO CODE"
                  className="w-full bg-[#0b1224] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:border-violet-500" />
              </div>
              <Button variant="outline" onClick={applyCoupon} type="button">Apply</Button>
            </div>

            <div className="space-y-2 text-sm border-t border-white/10 pt-4">
              <Row label="Tickets" value={fmtMoney(subtotal)} />
              <Row label="Booking Fee" value={fmtMoney(BOOKING_FEE)} />
              <Row label="Service Fee" value={fmtMoney(SERVICE_FEE)} />
              {discount > 0 && <Row label={`Discount (${applied})`} value={`- ${fmtMoney(discount)}`} green />}
            </div>
            <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
              <span className="text-white font-semibold">Total</span>
              <span className="text-2xl font-extrabold gradient-text">{fmtMoney(total)}</span>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">Try codes: EVES10, WELCOME20, VIP15</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return <div className="flex justify-between"><span className="text-slate-400">{label}</span><span className={green ? "text-green-400" : "text-slate-200"}>{value}</span></div>;
}
