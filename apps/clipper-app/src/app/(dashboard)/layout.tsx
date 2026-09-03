import { AppShell, Header } from "@clip/ui";
import { AppSidebar } from "../../components/app-sidebar";

// Shared frame for every authenticated clipper route — see
// docs/ui-ux/NAVIGATION_ARCHITECTURE.md "Global pattern".
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<AppSidebar />}
      header={<Header userMenu={<div className="h-8 w-8 rounded-full bg-slate-200" />} />}
    >
      {children}
    </AppShell>
  );
}
