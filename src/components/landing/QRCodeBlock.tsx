"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCodeBlock({ size = 120 }: { size?: number }) {
  return (
    <QRCodeSVG
      value="https://kapyn.app"
      size={size}
      bgColor="#ffffff"
      fgColor="#0a0a0a"
      level="M"
    />
  );
}
