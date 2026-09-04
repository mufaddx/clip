import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Vidlix Admin",
  description: "Platform management: users, campaigns, finance, and security.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
