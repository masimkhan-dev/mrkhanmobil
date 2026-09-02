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
  purchase_invoice_id?: string | null;
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

export type InvoiceDetail = {
  id: string;
  invoice_number: string;
  status: "FINAL" | "VOID";
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  supplier_name?: string | null;
  supplier_phone?: string | null;
  supplier_email?: string | null;
  supplier_address?: string | null;
  party_name?: string | null;
  party_phone?: string | null;
  device_make?: string | null;
  device_model?: string | null;
  storage?: string | null;
  colour?: string | null;
  imei?: string | null;
  serial?: string | null;
  imei_serial?: string | null;
  device_condition?: string | null;
  battery_health?: string | number | null;
  network_status?: string | null;
  accessories?: string | null;
  problem?: string | null;
  repair_work?: string | null;
  subtotal_pence?: number | null;
  discount_pence?: number | null;
  total_pence?: number | null;
  paid_pence?: number | null;
  balance_pence?: number | null;
  purchase_price_pence?: number | null;
  selling_price_pence?: number | null;
  warranty_days?: number | string | null;
  warranty_notes?: string | null;
  payment_method?: string | null;
  terms_snapshot?:
    | string
    | {
        heading?: string;
        points?:
          | ReadonlyArray<{ readonly title?: string; readonly body?: string }>
          | Array<{ title?: string; body?: string }>;
        version?: string;
        additional_agreement?: string;
        [key: string]:
          | string
          | ReadonlyArray<{ readonly title?: string; readonly body?: string }>
          | Array<{ title?: string; body?: string }>
          | undefined;
      }
    | null;
  additional_agreement?: string | null;
  custom_terms?: string | null;
  shop_note?: string | null;
  purchase_date?: string | null;
  id_reference?: string | null;
  notes?: string | null;
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
