import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400, error?: string) {
  return NextResponse.json({ success: false, message, error: error ?? message }, { status });
}

export function handleError(e: unknown) {
  if (e instanceof AuthError) return fail(e.message, e.status);
  const msg = e instanceof Error ? e.message : "Internal server error";
  console.error("[API ERROR]", e);
  return fail(msg, 500);
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export function genBookingCode() {
  return "EVS-" + Math.random().toString(36).slice(2, 8).toUpperCase() + Date.now().toString(36).slice(-4).toUpperCase();
}

export function genToken(len = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
