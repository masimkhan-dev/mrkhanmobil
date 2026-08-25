export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";
export type InvoiceKind = "REPAIR" | "SALE" | "PURCHASE";
export type StockStatus = "IN_STOCK" | "SOLD" | "REMOVED";
export type SaleSource = "STOCK" | "DIRECT";

export type CounterResult = {
  id: string;
  invoice_number: string;
  stock_device_id?: string | null;
  sale_source?: SaleSource;
};

export type CounterDashboard = {
  today_repairs: number;
  today_sales: number;
  in_stock: number;
  customer_due: number;
  supplier_due: number;
};

export type PartySummary = {
  id: string;
  name: string;
  phone: string;
  balance_pence: number;
  total_invoices_pence?: number;
  total_purchases_pence?: number;
  total_paid_pence: number;
  last_activity: string | null;
  id_reference?: string | null;
};

export type StockDevice = {
  id: string;
  device_make: string;
  device_model: string;
  storage: string | null;
  colour: string | null;
  imei: string | null;
  serial: string | null;
  device_condition: string;
  purchase_price_pence: number;
  expected_sale_price_pence: number | null;
  status: StockStatus;
  purchased_at: string;
  created_at: string;
};

export type InvoiceSummary = {
  kind: InvoiceKind;
  id: string;
  invoice_number: string;
  party_name: string;
  party_phone: string;
  device_make: string;
  device_model: string;
  identifier: string | null;
  total_pence: number;
  paid_pence: number;
  balance_pence: number;
  payment_status: PaymentStatus;
  status: "FINAL" | "VOID";
  created_at: string;
};

export type InvoiceDetail = Record<string, string | number | null> & {
  id: string;
  invoice_number: string;
  status: "FINAL" | "VOID";
  created_at: string;
};

export type LedgerEntry = {
  id: string;
  transaction_type: string;
  reference: string;
  description: string;
  debit_pence: number;
  credit_pence: number;
  reason: string | null;
  created_at: string;
};

export type PartyStatement = {
  party: { id: string; name: string; phone: string; id_reference?: string | null };
  balance_pence: number;
  opening_pence: number;
  entries: LedgerEntry[];
};
