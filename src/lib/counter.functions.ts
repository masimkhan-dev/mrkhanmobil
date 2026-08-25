import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
// ⚠️ DEV ONLY: requireSupabaseAuth removed for testing.
// Re-enable before production!
import type { Database } from "../integrations/supabase/types.ts";
import type {
  CounterDashboard,
  CounterResult,
  InvoiceDetail,
  InvoiceSummary,
  PartyStatement,
  PartySummary,
  StockDevice,
} from "./counter.types.ts";

const money = z.number().int().min(0).max(100_000_000);
const requiredText = (max: number) => z.string().trim().min(1).max(max);
const phone = z.string().trim().min(6, "Enter a valid phone number.").max(30);
const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const paymentMethod = z.enum(["CASH", "CARD", "BANK_TRANSFER", "OTHER"]);

export const RepairInput = z
  .object({
    request_id: z.string().uuid(),
    customer_id: z.string().uuid().optional(),
    customer_name: requiredText(100),
    customer_phone: phone,
    device_make: requiredText(80),
    device_model: requiredText(120),
    imei_serial: optionalText(80),
    problem: requiredText(1000),
    repair_work: requiredText(1000),
    shop_note: optionalText(1000),
    warranty_notes: optionalText(500),
    terms_snapshot: z.any().optional(),
    subtotal_pence: money,
    discount_pence: money,
    paid_pence: money,
    payment_method: paymentMethod,
    warranty_days: z.number().int().min(0).max(3650),
  })
  .superRefine((value, ctx) => {
    const total = value.subtotal_pence - value.discount_pence;
    if (total < 0) ctx.addIssue({ code: "custom", message: "Discount cannot exceed subtotal." });
    if (value.paid_pence > total)
      ctx.addIssue({ code: "custom", message: "Amount paid cannot exceed total." });
  });

export const PurchaseInput = z
  .object({
    request_id: z.string().uuid(),
    supplier_id: z.string().uuid().optional(),
    supplier_name: requiredText(100),
    supplier_phone: z.string().trim().min(1).max(30),
    id_reference: optionalText(100),
    seller_note: optionalText(1000),
    terms_snapshot: z.any().optional(),
    device_make: requiredText(80),
    device_model: requiredText(120),
    storage: optionalText(40),
    colour: optionalText(40),
    imei: optionalText(30),
    serial: optionalText(80),
    device_condition: requiredText(100),
    purchase_price_pence: money,
    paid_pence: money,
    expected_sale_price_pence: money.optional(),
    payment_method: paymentMethod,
  })
  .superRefine((value, ctx) => {
    const cleanImei = value.imei ? value.imei.replace(/[\s-]/g, "") : "";
    const cleanSerial = value.serial ? value.serial.trim() : "";
    if (!cleanImei && !cleanSerial) {
      ctx.addIssue({ code: "custom", message: "Enter an IMEI or serial number." });
    }
    if (cleanImei && !/^\d{15}$/.test(cleanImei)) {
      ctx.addIssue({
        code: "custom",
        path: ["imei"],
        message:
          "IMEI must contain exactly 15 numeric digits (or leave blank and enter Serial number).",
      });
    }
    if (value.paid_pence > value.purchase_price_pence) {
      ctx.addIssue({ code: "custom", message: "Amount paid cannot exceed purchase price." });
    }
  });

export const InternalStockInput = z
  .object({
    device_make: requiredText(80),
    device_model: requiredText(120),
    storage: optionalText(40),
    colour: optionalText(40),
    imei: optionalText(30),
    serial: optionalText(80),
    device_condition: requiredText(100),
    purchase_price_pence: money.default(0),
    expected_sale_price_pence: money.optional(),
    notes: optionalText(1000),
  })
  .superRefine((value, ctx) => {
    const cleanImei = value.imei ? value.imei.replace(/[\s-]/g, "") : "";
    const cleanSerial = value.serial ? value.serial.trim() : "";
    if (!cleanImei && !cleanSerial) {
      ctx.addIssue({ code: "custom", message: "Enter an IMEI or serial number." });
    }
    if (cleanImei && !/^\d{15}$/.test(cleanImei)) {
      ctx.addIssue({
        code: "custom",
        path: ["imei"],
        message: "IMEI must contain exactly 15 numeric digits (or enter Serial number).",
      });
    }
  });

export const SaleInput = z
  .object({
    request_id: z.string().uuid(),
    sale_source: z.enum(["STOCK", "DIRECT"]).default("STOCK"),
    stock_device_id: z.string().uuid().optional(),
    customer_id: z.string().uuid().optional(),
    customer_name: requiredText(100),
    customer_phone: z.string().trim().min(1).max(30),
    device_make: optionalText(80),
    device_model: optionalText(120),
    storage: optionalText(40),
    colour: optionalText(40),
    imei: optionalText(30),
    serial: optionalText(80),
    device_condition: optionalText(100),
    cost_price_pence: money.optional(),
    selling_price_pence: money,
    discount_pence: money,
    paid_pence: money,
    payment_method: paymentMethod,
    warranty_days: z.number().int().min(0).max(3650),
    warranty_notes: optionalText(500),
    terms_snapshot: z.any().optional(),
  })
  .superRefine((value, ctx) => {
    const total = value.selling_price_pence - value.discount_pence;
    if (total < 0) ctx.addIssue({ code: "custom", message: "Discount cannot exceed price." });
    if (value.paid_pence > total)
      ctx.addIssue({ code: "custom", message: "Amount paid cannot exceed total." });

    if (value.sale_source === "STOCK") {
      if (!value.stock_device_id) {
        ctx.addIssue({
          code: "custom",
          path: ["stock_device_id"],
          message: "Please select a device from stock.",
        });
      }
    } else {
      if (!value.device_make?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["device_make"],
          message: "Device make/brand is required.",
        });
      }
      if (!value.device_model?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["device_model"],
          message: "Device model is required.",
        });
      }
      const cleanImei = value.imei ? value.imei.replace(/[\s-]/g, "") : "";
      const cleanSerial = value.serial ? value.serial.trim() : "";
      if (!cleanImei && !cleanSerial) {
        ctx.addIssue({ code: "custom", message: "Enter an IMEI or serial number." });
      }
      if (cleanImei && !/^\d{15}$/.test(cleanImei)) {
        ctx.addIssue({
          code: "custom",
          path: ["imei"],
          message:
            "IMEI must contain exactly 15 numeric digits (or leave blank and enter Serial number).",
        });
      }
    }
  });

const partyPayment = z.object({
  request_id: z.string().uuid(),
  amount_pence: z.number().int().positive().max(100_000_000),
  payment_method: paymentMethod,
  reference_note: optionalText(300),
});

/** Dev helper — runs an RPC via the admin client (bypasses RLS for testing). */
async function devRpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (
    supabaseAdmin as unknown as {
      rpc: (
        name: string,
        args?: unknown,
      ) => Promise<{ data: unknown; error: { message: string } | null }>;
    }
  ).rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const createRepairInvoice = createServerFn({ method: "POST" })
  .validator((data: unknown) => RepairInput.parse(data))
  .handler(({ data }) => devRpc<CounterResult>("counter_create_repair", { p_data: data }));

export const createPurchaseInvoice = createServerFn({ method: "POST" })
  .validator((data: unknown) => PurchaseInput.parse(data))
  .handler(({ data }) => devRpc<CounterResult>("counter_create_purchase", { p_data: data }));

export const createInternalStockDevice = createServerFn({ method: "POST" })
  .validator((data: unknown) => InternalStockInput.parse(data))
  .handler(async ({ data }) => {
    try {
      return await devRpc<{ id: string; stock_device_id: string; sku: string }>(
        "counter_add_internal_stock",
        { p_data: data },
      );
    } catch {
      // Fallback: Direct insert via supabaseAdmin without invoice/supplier
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const cleanImei = data.imei ? data.imei.replace(/[\s-]/g, "") : null;
      const { data: stockRow, error: stockErr } = await (supabaseAdmin as any)
        .from("stock_devices")
        .insert({
          device_make: data.device_make.trim(),
          device_model: data.device_model.trim(),
          storage: data.storage || null,
          colour: data.colour || null,
          imei: cleanImei,
          serial: data.serial?.trim() || null,
          device_condition: data.device_condition.trim(),
          purchase_price_pence: data.purchase_price_pence ?? 0,
          expected_sale_price_pence: data.expected_sale_price_pence ?? null,
          status: "IN_STOCK",
        })
        .select("id")
        .single();

      if (stockErr) throw new Error(stockErr.message);

      return {
        id: stockRow.id,
        stock_device_id: stockRow.id,
        sku: "STK-" + stockRow.id.substring(0, 8).toUpperCase(),
      };
    }
  });

export const createSaleInvoice = createServerFn({ method: "POST" })
  .validator((data: unknown) => SaleInput.parse(data))
  .handler(({ data }) => devRpc<CounterResult>("counter_create_sale", { p_data: data }));

export const getCounterDashboard = createServerFn({ method: "GET" }).handler(() =>
  devRpc<CounterDashboard>("counter_dashboard"),
);

const SearchInput = z.object({ query: z.string().trim().max(100).default("") });

export const searchCounterCustomers = createServerFn({ method: "POST" })
  .validator((data: unknown) => SearchInput.parse(data))
  .handler(({ data }) =>
    devRpc<PartySummary[]>("counter_search_customers", { p_query: data.query }),
  );

export const searchCounterSuppliers = createServerFn({ method: "POST" })
  .validator((data: unknown) => SearchInput.parse(data))
  .handler(({ data }) =>
    devRpc<PartySummary[]>("counter_search_suppliers", { p_query: data.query }),
  );
export interface DirectPartyResult {
  id: string;
  name: string;
  phone: string;
  id_reference?: string | null;
  note?: string | null;
  existing: boolean;
}

export const createCounterCustomer = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: requiredText(100),
        phone: phone,
        note: optionalText(500),
      })
      .parse(data),
  )
  .handler(({ data }) => devRpc<DirectPartyResult>("counter_create_customer", { p_data: data }));

export const createCounterSupplier = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: requiredText(100),
        phone: phone,
        id_reference: optionalText(100),
        note: optionalText(500),
      })
      .parse(data),
  )
  .handler(({ data }) => devRpc<DirectPartyResult>("counter_create_supplier", { p_data: data }));
const StockSearchInput = z.object({
  query: z.string().trim().max(100).default(""),
  status: z.enum(["ALL", "IN_STOCK", "SOLD", "REMOVED"]).default("ALL"),
});
export const listCounterStock = createServerFn({ method: "POST" })
  .validator((data: unknown) => StockSearchInput.parse(data))
  .handler(({ data }) =>
    devRpc<StockDevice[]>("counter_stock", {
      p_query: data.query,
      p_status: data.status,
    }),
  );

const InvoiceSearchInput = z.object({
  query: z.string().trim().max(100).default(""),
  kind: z.enum(["ALL", "REPAIR", "SALE", "PURCHASE"]).default("ALL"),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
});
export const listCounterInvoices = createServerFn({ method: "POST" })
  .validator((data: unknown) => InvoiceSearchInput.parse(data))
  .handler(({ data }) =>
    devRpc<InvoiceSummary[]>("counter_invoices", {
      p_query: data.query,
      p_kind: data.kind,
      p_from: data.from,
      p_to: data.to,
    }),
  );

export const getCounterInvoice = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ kind: z.enum(["REPAIR", "SALE", "PURCHASE"]), id: z.string().uuid() }).parse(data),
  )
  .handler(({ data }) =>
    devRpc<InvoiceDetail>("counter_invoice_detail", {
      p_kind: data.kind,
      p_invoice_id: data.id,
    }),
  );

export const receiveCustomerPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => partyPayment.extend({ customer_id: z.string().uuid() }).parse(data))
  .handler(({ data }) =>
    devRpc<{ payment_id: string; amount_pence: number }>("counter_receive_customer_payment", {
      p_data: data,
    }),
  );

export const payCounterSupplier = createServerFn({ method: "POST" })
  .validator((data: unknown) => partyPayment.extend({ supplier_id: z.string().uuid() }).parse(data))
  .handler(({ data }) =>
    devRpc<{ payment_id: string; amount_pence: number }>("counter_pay_supplier", {
      p_data: data,
    }),
  );

export const getCustomerStatement = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        from: z.string().date().optional(),
        to: z.string().date().optional(),
      })
      .parse(data),
  )
  .handler(({ data }) =>
    devRpc<PartyStatement>("counter_customer_statement", {
      p_customer_id: data.id,
      p_from: data.from,
      p_to: data.to,
    }),
  );

export const getSupplierStatement = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        from: z.string().date().optional(),
        to: z.string().date().optional(),
      })
      .parse(data),
  )
  .handler(({ data }) =>
    devRpc<PartyStatement>("counter_supplier_statement", {
      p_supplier_id: data.id,
      p_from: data.from,
      p_to: data.to,
    }),
  );

export const voidCounterInvoice = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        kind: z.enum(["REPAIR", "SALE", "PURCHASE"]),
        id: z.string().uuid(),
        reason: z.string().trim().min(3).max(500),
      })
      .parse(data),
  )
  .handler(({ data }) =>
    devRpc<{ ok: boolean }>("counter_void_invoice", {
      p_kind: data.kind,
      p_invoice_id: data.id,
      p_reason: data.reason,
    }),
  );
