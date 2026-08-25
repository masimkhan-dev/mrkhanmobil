import { createFileRoute } from "@tanstack/react-router";
import { LedgerPage } from "@/components/counter/ledger-page";
export const Route = createFileRoute("/_authenticated/admin/customers")({
  ssr: false,
  head: () => ({ meta: [{ title: "Customers — MR KHAN" }] }),
  component: () => <LedgerPage type="CUSTOMER" />,
});
