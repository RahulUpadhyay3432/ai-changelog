"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCodeBlock() {
  return (
    <QRCodeSVG
      value="https://kapyn.app"
      size={120}
      bgColor="#ffffff"
      fgColor="#0a0a0a"
      level="M"
    />
  );
}
