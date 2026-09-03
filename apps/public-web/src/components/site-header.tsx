"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@clip/ui";
import { IconArrowRight } from "./icons";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-brands", label: "For brands" },
  { href: "/for-clippers", label: "For clippers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

// Actual brand wordmark (public/logo-wordmark-white.png, 1061x250 —
// height set explicitly per usage below, width left to scale so the image
// never distorts). The site is dark everywhere now, so the white variant
// is the only one this ever needs to render.
export function Logo({ className = "", height = 28 }: { className?: string; height?: number }) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <img
        src="/logo-wordmark-white.png"
        alt="Vidlix"
        height={height}
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}

// The whole site is dark (see components/dark-backdrop.tsx) — this header
// is a translucent dark bar, not the light-mode bar it started as.
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0A10]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-400 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">
              Sign up
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-white lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
            {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#0A0A10] px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <span className="flex h-10 w-full items-center justify-center rounded-md border border-white/15 text-sm font-medium text-white">
                Log in
              </span>
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)}>
              <Button className="w-full">Sign up</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
