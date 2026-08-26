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
    supplier_email: optionalText(200),
    supplier_address: optionalText(300),
    purchase_date: z.string().date().optional(),
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
    battery_health: optionalText(20),
    network_status: optionalText(50),
    accessories: optionalText(200),
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

export type StockDeviceDetail = StockDevice & {
  purchase_invoice?: {
    id: string;
    invoice_number: string;
    supplier_id?: string | null;
    supplier_name: string;
    supplier_phone: string;
    supplier_email?: string | null;
    supplier_address?: string | null;
    seller_note?: string | null;
    purchase_price_pence: number;
    paid_pence: number;
    payment_method?: string | null;
    created_at: string;
  } | null;
  sale_invoice?: {
    id: string;
    invoice_number: string;
    customer_name: string;
    customer_phone: string;
    total_pence: number;
    created_at: string;
  } | null;
  movement_note?: string | null;
};

export const getStockDevice = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<StockDeviceDetail> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: stockRow, error: stockErr } = await (supabaseAdmin as any)
      .from("stock_devices")
      .select("*")
      .eq("id", data.id)
      .single();

    if (stockErr || !stockRow) throw new Error(stockErr?.message || "Stock device not found.");

    let purchaseInvoice = null;
    if (stockRow.purchase_invoice_id) {
      const { data: pInv } = await (supabaseAdmin as any)
        .from("purchase_invoices")
        .select(
          "id, invoice_number, supplier_id, supplier_name, supplier_phone, seller_note, purchase_price_pence, paid_pence, payment_method, created_at",
        )
        .eq("id", stockRow.purchase_invoice_id)
        .maybeSingle();
      if (pInv) purchaseInvoice = pInv;
    }

    let saleInvoice = null;
    if (stockRow.status === "SOLD") {
      const { data: sInv } = await (supabaseAdmin as any)
        .from("sale_invoices")
        .select("id, invoice_number, customer_name, customer_phone, total_pence, created_at")
        .eq("stock_device_id", stockRow.id)
        .eq("status", "FINAL")
        .maybeSingle();
      if (sInv) saleInvoice = sInv;
    }

    const { data: movement } = await (supabaseAdmin as any)
      .from("stock_movements")
      .select("note")
      .eq("stock_device_id", stockRow.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      ...stockRow,
      purchase_invoice: purchaseInvoice,
      sale_invoice: saleInvoice,
      movement_note: movement?.note || null,
    };
  });

export const UpdateStockInput = z.object({
  id: z.string().uuid(),
  device_make: z.string().trim().min(1).max(80).optional(),
  device_model: z.string().trim().min(1).max(120).optional(),
  storage: z.string().trim().max(40).optional().nullable(),
  colour: z.string().trim().max(40).optional().nullable(),
  imei: z.string().trim().max(30).optional().nullable(),
  serial: z.string().trim().max(80).optional().nullable(),
  device_condition: z.string().trim().min(1).max(100),
  purchase_price_pence: z.number().int().min(0).optional(),
  expected_sale_price_pence: z.number().int().min(0).optional().nullable(),
  notes: z.string().trim().max(3000).optional().nullable(),
});

export const updateStockDevice = createServerFn({ method: "POST" })
  .validator((data: unknown) => UpdateStockInput.parse(data))
  .handler(async ({ data }) => {
    const { getMyRole } = await import("@/lib/admin.functions");
    const role = await getMyRole();
    if (!role?.isAdmin) {
      throw new Error("Unauthorized: Only administrators can edit stock records.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch existing stock device
    const { data: existing, error: findErr } = await (supabaseAdmin as any)
      .from("stock_devices")
      .select("*")
      .eq("id", data.id)
      .single();

    if (findErr || !existing) throw new Error("Stock item not found.");
    if (existing.status !== "IN_STOCK") {
      throw new Error(
        `Cannot edit stock item: status is ${existing.status}. Only active (IN_STOCK) items can be modified.`,
      );
    }

    const isSellerLinked = Boolean(existing.purchase_invoice_id);

    // Reject tampering attempts on seller-purchased items
    if (isSellerLinked) {
      if (data.device_make && data.device_make.trim() !== existing.device_make) {
        throw new Error(
          "Cannot edit brand of a phone purchased from a seller (locked to purchase invoice).",
        );
      }
      if (data.device_model && data.device_model.trim() !== existing.device_model) {
        throw new Error(
          "Cannot edit model of a phone purchased from a seller (locked to purchase invoice).",
        );
      }
      if (
        data.purchase_price_pence !== undefined &&
        data.purchase_price_pence !== existing.purchase_price_pence
      ) {
        throw new Error(
          "Cannot edit purchase cost of a phone purchased from a seller (locked to purchase invoice).",
        );
      }
      const incomingImei = data.imei ? data.imei.replace(/[\s-]/g, "") : null;
      if (incomingImei && existing.imei && incomingImei !== existing.imei) {
        throw new Error(
          "Cannot edit IMEI of a phone purchased from a seller (locked to purchase invoice).",
        );
      }
    }

    // Atomic duplicate IMEI validation
    const cleanImei = data.imei ? data.imei.replace(/[\s-]/g, "") : null;
    if (cleanImei && !/^\d{15}$/.test(cleanImei)) {
      throw new Error("IMEI must contain exactly 15 numeric digits.");
    }

    if (cleanImei && cleanImei !== existing.imei) {
      const { data: dup } = await (supabaseAdmin as any)
        .from("stock_devices")
        .select("id, device_make, device_model")
        .eq("imei", cleanImei)
        .neq("id", data.id)
        .in("status", ["IN_STOCK", "SOLD"])
        .limit(1)
        .maybeSingle();

      if (dup) {
        throw new Error(
          `This IMEI is already in use by ${dup.device_make} ${dup.device_model} (SKU: STK-${dup.id.substring(0, 8).toUpperCase()}).`,
        );
      }
    }

    // Prepare whitelisted update payload
    const updatePayload: Record<string, unknown> = {
      device_condition: data.device_condition.trim(),
      expected_sale_price_pence: data.expected_sale_price_pence ?? null,
      updated_at: new Date().toISOString(),
    };

    // For direct stock entries only, allow updating device identity & cost
    if (!isSellerLinked) {
      if (data.device_make) updatePayload.device_make = data.device_make.trim();
      if (data.device_model) updatePayload.device_model = data.device_model.trim();
      if (data.storage !== undefined) updatePayload.storage = data.storage || null;
      if (data.colour !== undefined) updatePayload.colour = data.colour || null;
      if (data.imei !== undefined) updatePayload.imei = cleanImei;
      if (data.serial !== undefined) updatePayload.serial = data.serial?.trim() || null;
      if (data.purchase_price_pence !== undefined) {
        updatePayload.purchase_price_pence = data.purchase_price_pence;
      }
    }

    // Compute change diffs for detailed audit
    const diffs: string[] = [];
    if (
      updatePayload.device_condition &&
      updatePayload.device_condition !== existing.device_condition
    ) {
      diffs.push(`Condition: "${existing.device_condition}" → "${updatePayload.device_condition}"`);
    }
    if (
      updatePayload.expected_sale_price_pence !== undefined &&
      updatePayload.expected_sale_price_pence !== existing.expected_sale_price_pence
    ) {
      diffs.push(
        `Selling Price: ${existing.expected_sale_price_pence ?? 0}p → ${updatePayload.expected_sale_price_pence ?? 0}p`,
      );
    }
    if (
      updatePayload.purchase_price_pence !== undefined &&
      updatePayload.purchase_price_pence !== existing.purchase_price_pence
    ) {
      diffs.push(
        `Cost: ${existing.purchase_price_pence ?? 0}p → ${updatePayload.purchase_price_pence ?? 0}p`,
      );
    }
    if (updatePayload.device_make && updatePayload.device_make !== existing.device_make) {
      diffs.push(`Brand: "${existing.device_make}" → "${updatePayload.device_make}"`);
    }
    if (updatePayload.device_model && updatePayload.device_model !== existing.device_model) {
      diffs.push(`Model: "${existing.device_model}" → "${updatePayload.device_model}"`);
    }
    if (updatePayload.storage !== undefined && updatePayload.storage !== existing.storage) {
      diffs.push(`Storage: "${existing.storage || "None"}" → "${updatePayload.storage || "None"}"`);
    }
    if (updatePayload.colour !== undefined && updatePayload.colour !== existing.colour) {
      diffs.push(`Colour: "${existing.colour || "None"}" → "${updatePayload.colour || "None"}"`);
    }
    if (updatePayload.imei !== undefined && updatePayload.imei !== existing.imei) {
      diffs.push(`IMEI: "${existing.imei || "None"}" → "${updatePayload.imei || "None"}"`);
    }
    if (updatePayload.serial !== undefined && updatePayload.serial !== existing.serial) {
      diffs.push(`Serial: "${existing.serial || "None"}" → "${updatePayload.serial || "None"}"`);
    }

    const { data: updated, error: updateErr } = await (supabaseAdmin as any)
      .from("stock_devices")
      .update(updatePayload)
      .eq("id", data.id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    // Record structured audit log in stock_movements
    const auditSummary =
      diffs.length > 0
        ? `Updated fields: [${diffs.join(", ")}]${data.notes ? ` | Notes: ${data.notes}` : ""}`
        : `Stock item saved${data.notes ? ` | Notes: ${data.notes}` : ""}`;

    await (supabaseAdmin as any).from("stock_movements").insert({
      stock_device_id: data.id,
      movement_type: "UPDATED",
      reference: "STOCK_EDIT",
      note: auditSummary,
    });

    return updated;
  });
