"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import AuthShell from "@/components/AuthShell";
import { useApp } from "@/context/AppContext";

export default function ForgotPasswordPage() {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      {sent ? (
        <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <div className="text-4xl mb-2">📧</div>
          <p className="text-white font-semibold">Check your email</p>
          <p className="text-slate-400 text-sm mt-1">We&apos;ve sent a password reset link to {email}</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); toast("Reset link sent to your email"); }} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" full size="lg">Send Reset Link</Button>
        </form>
      )}
      <p className="text-center text-slate-400 text-sm mt-6">
        Remember your password? <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Login</Link>
      </p>
    </AuthShell>
  );
}
