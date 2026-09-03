import { PageHeader, Card, EmptyState } from "@clip/ui";

// /billing/invoices — see docs/product/PLATFORM_FEATURES.md. Invoice
// generation (PDF export) isn't implemented yet — no reporting/PDF
// pipeline exists — see docs/operations/REPORTING_SYSTEM.md.
export default function InvoicesPage() {
  return (
    <div>
      <PageHeader title="Invoices" />
      <Card>
        <EmptyState title="Invoice generation isn't available yet" description="This ships with the reporting/export pipeline." />
      </Card>
    </div>
  );
}
