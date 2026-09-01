import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Toaster from "@/components/Toaster";

export const metadata: Metadata = {
  title: "EVESPLORE — Discover, Book & Experience Live Events",
  description:
    "Book concerts, festivals, sports, theater and more. Real-time seat selection, secure payments, and QR e-tickets.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#050816] text-slate-100 antialiased min-h-screen">
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
