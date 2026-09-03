import type { Metadata } from "next";
import "../styles/globals.css";
import { DarkBackdrop } from "../components/dark-backdrop";

export const metadata: Metadata = {
  title: "Vidlix — Creator Clipping & Campaign Distribution",
  description:
    "Vidlix connects brands with a network of creators who publish and get paid on verified, qualified performance.",
};

// The public-web site is dark end to end — see components/dark-backdrop.tsx
// for the shared background, mounted once here so it's consistent across
// the splash, auth, and marketing pages without every layout re-declaring it.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DarkBackdrop />
        {children}
      </body>
    </html>
  );
}
