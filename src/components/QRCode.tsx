"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";

export default function QRCode({ value, size = 180 }: { value: string; size?: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCodeLib.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#050816", light: "#ffffff" },
      errorCorrectionLevel: "H",
    })
      .then(setSrc)
      .catch(() => setSrc(""));
  }, [value, size]);

  if (!src) return <div className="rounded-xl bg-white/10 animate-pulse" style={{ width: size, height: size }} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="QR code" width={size} height={size} className="rounded-xl bg-white p-2" />;
}
