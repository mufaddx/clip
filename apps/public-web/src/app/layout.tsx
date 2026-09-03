import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "CLIP — Creator Clipping & Campaign Distribution",
  description:
    "CLIP connects brands with a network of creators who publish and get paid on verified, qualified performance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
