"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import React from "react";

type BtnProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  full?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  full,
  className = "",
  disabled,
  ...rest
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };
  const variants = {
    primary: "gradient-btn text-white hover:opacity-90 shadow-lg shadow-violet-900/40",
    outline: "border border-white/15 text-slate-200 hover:bg-white/5",
    ghost: "text-slate-300 hover:bg-white/5",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
    success: "bg-green-500/90 text-white hover:bg-green-500",
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Input({
  label,
  className = "",
  ...rest
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="text-sm text-slate-300 mb-1.5 block">{label}</span>}
      <input
        className={`w-full bg-[#0b1224] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition ${className}`}
        {...rest}
      />
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  ...rest
}: { label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && <span className="text-sm text-slate-300 mb-1.5 block">{label}</span>}
      <textarea
        className={`w-full bg-[#0b1224] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition ${className}`}
        {...rest}
      />
    </label>
  );
}

export function Select({
  label,
  className = "",
  children,
  ...rest
}: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && <span className="text-sm text-slate-300 mb-1.5 block">{label}</span>}
      <select
        className={`w-full bg-[#0b1224] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({
  children,
  color = "violet",
}: {
  children: React.ReactNode;
  color?: "violet" | "pink" | "green" | "yellow" | "red" | "slate" | "blue";
}) {
  const map = {
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    pink: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    green: "bg-green-500/15 text-green-300 border-green-500/30",
    yellow: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    red: "bg-red-500/15 text-red-300 border-red-500/30",
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${map[color]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#10182b] border border-white/[0.06] rounded-2xl ${className}`}>{children}</div>
  );
}

export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="animate-spin text-violet-400" size={size} />
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center gradient-btn shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
        <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" transform="rotate(45 12 12)" />
      </svg>
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">🎟️</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">{subtitle}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export { Link };
