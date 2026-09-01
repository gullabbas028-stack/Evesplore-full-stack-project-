"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Toaster() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            className="glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg border border-white/10"
          >
            {t.type === "success" && <CheckCircle2 className="text-green-400 shrink-0" size={20} />}
            {t.type === "error" && <XCircle className="text-red-400 shrink-0" size={20} />}
            {t.type === "info" && <Info className="text-violet-400 shrink-0" size={20} />}
            <span className="text-sm text-slate-100 flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
