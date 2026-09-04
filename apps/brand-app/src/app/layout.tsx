import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Vidlix for Brands",
  description: "Create campaigns, track creator performance, and manage your budget.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
