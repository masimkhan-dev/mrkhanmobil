import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { formatPence, paymentStatus, poundsToPence } from "../src/lib/money.ts";
import {
  RepairInput,
  PurchaseInput,
  SaleInput,
  InternalStockInput,
} from "../src/lib/counter.functions.ts";
import { buildCounterInvoiceHtml } from "../src/lib/counter-print.ts";
import { STANDARD_TERMS, TERMS_VERSION } from "../src/lib/counter-constants.ts";
import type { InvoiceDetail } from "../src/lib/counter.types.ts";

test("GBP input converts to integer pennies without floating point arithmetic", () => {
  assert.equal(poundsToPence("120.50"), 12050);
  assert.equal(poundsToPence("£1,200.05"), 120005);
  assert.equal(poundsToPence("0.9"), 90);
  assert.ok(Number.isNaN(poundsToPence("12.999")));
  assert.ok(Number.isNaN(poundsToPence("abc")));
});

test("penny formatting and payment labels are stable", () => {
  assert.equal(formatPence(12050), "£120.50");
  assert.equal(paymentStatus(10000, 0), "Unpaid");
  assert.equal(paymentStatus(10000, 4000), "Partially Paid");
  assert.equal(paymentStatus(10000, 10000), "Paid");
  assert.equal(paymentStatus(0, 0), "Paid");
});

test("counter migration contains core financial and stock integrity protections", () => {
  const sql = readFileSync("supabase/migrations/20260821000000_counter_mode.sql", "utf8");
  assert.match(sql, /request_id UUID NOT NULL UNIQUE/);
  assert.match(sql, /last_number = last_number \+ 1/);
  assert.match(sql, /FOR UPDATE/);
  assert.match(sql, /stock_active_imei_idx/);
  assert.match(sql, /sale_active_stock_idx/);
  assert.match(sql, /payment_allocations/);
  assert.match(sql, /VOID_REVERSAL/);
  assert.match(sql, /IF r\.total_pence>0 THEN/);
  assert.match(sql, /IF r\.purchase_price_pence>0 THEN/);
  assert.match(sql, /Cannot void purchase: phone has already been sold/);
  assert.doesNotMatch(sql, /\b(?:REAL|DOUBLE PRECISION|FLOAT|MONEY)\b/i);
});

test("all three invoice types and both ledger payment flows are transactional RPCs", () => {
  const sql = readFileSync("supabase/migrations/20260821000000_counter_mode.sql", "utf8");
  for (const fn of [
    "counter_create_repair",
    "counter_create_purchase",
    "counter_create_sale",
    "counter_receive_customer_payment",
    "counter_pay_supplier",
    "counter_void_invoice",
  ]) {
    assert.match(sql, new RegExp(`FUNCTION public\\.${fn}`));
  }
});

test("internal stock addition RPC exists and isolates stock from purchase invoices and supplier ledgers", () => {
  const sql = readFileSync("supabase/migrations/20260824000000_counter_internal_stock.sql", "utf8");
  assert.match(sql, /FUNCTION public\.counter_add_internal_stock/);
  assert.match(sql, /INSERT INTO public\.stock_devices/);
  assert.doesNotMatch(sql, /INSERT INTO public\.purchase_invoices/);
  assert.doesNotMatch(sql, /INSERT INTO public\.suppliers/);
  assert.doesNotMatch(sql, /INSERT INTO public\.supplier_ledger_entries/);
  assert.doesNotMatch(sql, /INSERT INTO public\.payments/);
});

test("RepairInput blocks overpayment and validates mandatory fields", () => {
  const valid = {
    request_id: "a0000000-0000-0000-0000-000000000001",
    customer_name: "John Doe",
    customer_phone: "07700900123",
    device_make: "Apple",
    device_model: "iPhone 15 Pro",
    problem: "Screen Replacement",
    repair_work: "Screen Replacement completed",
    subtotal_pence: 8000,
    discount_pence: 1000,
    paid_pence: 7000,
    payment_method: "CASH",
    warranty_days: 90,
  };
  assert.ok(RepairInput.safeParse(valid).success);

  // Overpayment blocked (paid > total)
  const overpaid = { ...valid, paid_pence: 7500 };
  assert.equal(RepairInput.safeParse(overpaid).success, false);

  // Discount exceeding subtotal blocked
  const badDiscount = { ...valid, discount_pence: 9000, paid_pence: 0 };
  assert.equal(RepairInput.safeParse(badDiscount).success, false);
});

test("SaleInput blocks overpayment and validates stock or direct device", () => {
  const validSale = {
    request_id: "b0000000-0000-0000-0000-000000000002",
    sale_source: "STOCK",
    stock_device_id: "c0000000-0000-0000-0000-000000000003",
    customer_name: "Walk-in Customer",
    customer_phone: "Walk-in",
    selling_price_pence: 45000,
    discount_pence: 0,
    paid_pence: 45000,
    payment_method: "CARD",
    warranty_days: 90,
  };
  assert.ok(SaleInput.safeParse(validSale).success);

  // Overpayment blocked
  const overpaidSale = { ...validSale, paid_pence: 50000 };
  assert.equal(SaleInput.safeParse(overpaidSale).success, false);

  // Missing stock_device_id in STOCK mode blocked
  const noStockId = { ...validSale, stock_device_id: undefined };
  assert.equal(SaleInput.safeParse(noStockId).success, false);
});

test("InternalStockInput enforces 15-digit numeric IMEI or serial and non-negative cost", () => {
  const validInternal = {
    device_make: "Samsung",
    device_model: "Galaxy S24 Ultra",
    storage: "256GB",
    colour: "Titanium Gray",
    imei: "351234567890123",
    device_condition: "Grade A",
    purchase_price_pence: 60000,
    expected_sale_price_pence: 80000,
  };
  assert.ok(InternalStockInput.safeParse(validInternal).success);

  // Non-15 digit IMEI rejected
  const badImei = { ...validInternal, imei: "12345" };
  assert.equal(InternalStockInput.safeParse(badImei).success, false);
});

test("Custom warranty and terms snapshot survive invoice print generation", () => {
  const mockInvoice: InvoiceDetail = {
    id: "e0000000-0000-0000-0000-000000000005",
    invoice_number: "REP-000042",
    created_at: new Date().toISOString(),
    status: "FINAL",
    customer_name: "Sarah Smith",
    customer_phone: "07700900456",
    device_make: "Apple",
    device_model: "iPhone 14",
    problem: "Battery Replacement",
    subtotal_pence: 4500,
    discount_pence: 0,
    total_pence: 4500,
    paid_pence: 4500,
    balance_pence: 0,
    payment_method: "CARD",
    warranty_days: 45,
    warranty_notes: "Special 45-day battery health guarantee",
    additional_agreement: "Customer agrees to charge cycle test at home",
    terms_snapshot: {
      heading: "Repair & Warranty Information",
      points: STANDARD_TERMS.REPAIR.points,
      version: TERMS_VERSION,
      additional_agreement: "Customer agrees to charge cycle test at home",
    },
  };

  const a4Html = buildCounterInvoiceHtml("REPAIR", mockInvoice, "A4");
  const thermalHtml = buildCounterInvoiceHtml("REPAIR", mockInvoice, "80MM");

  // Verify financial figures are identical in A4 and Thermal
  assert.match(a4Html, /£45\.00/);
  assert.match(thermalHtml, /£45\.00/);

  // Verify custom warranty note is printed
  assert.match(a4Html, /Special 45-day battery health guarantee/);
  assert.match(thermalHtml, /Special 45-day battery health guarantee/);

  // Verify Additional Agreement is printed
  assert.match(a4Html, /Customer agrees to charge cycle test at home/);
  assert.match(thermalHtml, /Customer agrees to charge cycle test at home/);

  // Verify Terms Version
  assert.match(a4Html, new RegExp(TERMS_VERSION));
  assert.match(thermalHtml, new RegExp(TERMS_VERSION));
});

test("Purchase receipt renders seller signature fields on both A4 and 80mm thermal", () => {
  const mockPurchase: InvoiceDetail = {
    id: "f0000000-0000-0000-0000-000000000006",
    invoice_number: "BUY-000010",
    created_at: new Date().toISOString(),
    status: "FINAL",
    supplier_name: "James Wilson",
    supplier_phone: "07700900789",
    device_make: "Apple",
    device_model: "iPhone 13",
    imei: "359876543210987",
    purchase_price_pence: 22000,
    paid_pence: 22000,
    balance_pence: 0,
    payment_method: "CASH",
  };

  const a4Html = buildCounterInvoiceHtml("PURCHASE", mockPurchase, "A4");
  const thermalHtml = buildCounterInvoiceHtml("PURCHASE", mockPurchase, "80MM");

  assert.match(a4Html, /Seller Signature/);
  assert.match(a4Html, /Authorised Shop Signature/);
  assert.match(thermalHtml, /Seller Sig/);
});
