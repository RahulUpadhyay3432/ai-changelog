import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KapynPrototype, type PrototypeScreen } from "../Prototype";

const SCREENS: PrototypeScreen[] = ["landing", "today", "radar", "toolkit"];

export const metadata: Metadata = {
  title: "Kapyn V2 product concept",
  description: "Private, interactive Kapyn UI exploration.",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return SCREENS.map((screen) => ({ screen }));
}

export default async function KapynV2Screen({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  if (!SCREENS.includes(screen as PrototypeScreen)) notFound();
  return <KapynPrototype screen={screen as PrototypeScreen} />;
}
