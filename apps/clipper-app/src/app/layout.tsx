import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "CLIP for Clippers",
  description: "Discover campaigns, track performance, and manage your earnings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
