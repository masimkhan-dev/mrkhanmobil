import { createFileRoute } from "@tanstack/react-router";
import { LedgerPage } from "@/components/counter/ledger-page";
export const Route = createFileRoute("/_authenticated/admin/suppliers")({
  ssr: false,
  head: () => ({ meta: [{ title: "Suppliers — MR KHAN" }] }),
  component: () => <LedgerPage type="SUPPLIER" />,
});
