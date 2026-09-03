// Site-wide dark background — mounted once in the root layout so every
// page (splash, auth, marketing) shares the same backdrop instead of each
// page rolling its own flat gradient. Three layers stacked for depth:
// a fixed near-black base, a very faint dot-grid texture (the thing that
// separates "professional dark SaaS site" from "flat black rectangle"),
// and two soft blurred brand-color glows positioned off-center so the
// page doesn't look perfectly symmetrical/artificial.
export function DarkBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-50 bg-[#0A0A10]">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="absolute -top-56 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-100px] h-[420px] w-[520px] rounded-full bg-brand-500/10 blur-[110px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A10]" />
    </div>
  );
}
