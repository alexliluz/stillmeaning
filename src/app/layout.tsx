import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "StillMeaning — Reduce motion, not meaning",
  description:
    "Analyze web animations and create safer reduced-motion alternatives that preserve meaning.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
