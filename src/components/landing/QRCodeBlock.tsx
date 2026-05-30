"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCodeBlock() {
  return (
    <QRCodeSVG
      value="https://kapyn.vercel.app"
      size={56}
      bgColor="#ffffff"
      fgColor="#0a0a0a"
      level="M"
    />
  );
}
