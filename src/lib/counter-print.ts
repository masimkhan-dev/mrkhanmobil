import { business } from "../config/business.ts";
import type { InvoiceDetail, InvoiceKind, PartyStatement } from "./counter.types.ts";
import { formatPence } from "./money.ts";
import { generateCode128BarcodeSvg } from "./code128.ts";
import {
  REPAIR_WARRANTY_EXCLUSION_TEXT,
  STANDARD_TERMS,
  TERMS_VERSION,
} from "./counter-constants.ts";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface TermsSnapshotData {
  heading?: string;
  points?: Array<{ title: string; body: string }>;
  version?: string;
  additional_agreement?: string;
}

function resolveTerms(kind: InvoiceKind, invoice: InvoiceDetail, hasWarranty = false) {
  let snap: TermsSnapshotData | null = null;
  if (invoice.terms_snapshot) {
    if (typeof invoice.terms_snapshot === "object") {
      snap = invoice.terms_snapshot as TermsSnapshotData;
    } else if (typeof invoice.terms_snapshot === "string") {
      try {
        snap = JSON.parse(invoice.terms_snapshot);
      } catch {
        snap = null;
      }
    }
  }

  const defaultTerms = STANDARD_TERMS[kind];
  let heading = snap?.heading ?? defaultTerms?.heading ?? "Terms & Warranty Information";
  let points = snap?.points ?? defaultTerms?.points ?? [];

  if (kind === "SALE") {
    if (!hasWarranty) {
      heading = "Sale Terms";
      points = [
        {
          title: "Device Condition",
          body: "The device is sold in the condition and specification stated on this invoice.",
        },
        {
          title: "Proof of Purchase",
          body: "Please retain this receipt as proof of purchase. Your statutory rights under UK consumer law are not affected.",
        },
      ];
    } else {
      heading = "Sale & Warranty Terms";
      points = [
        {
          title: "Device Condition",
          body: "The device is sold in the condition and specification stated on this invoice.",
        },
        {
          title: "Shop Warranty",
          body: "The shop warranty applies for the period stated on this invoice. It is provided in addition to, and does not affect, your statutory rights.",
        },
        {
          title: "Warranty Exclusions",
          body: "Warranty does not cover accidental or liquid damage, misuse, neglect, or unauthorised tampering that caused the fault.",
        },
        {
          title: "Proof of Purchase",
          body: "Please retain this receipt as proof of purchase. Your statutory rights under UK consumer law are not affected.",
        },
      ];
    }
  }

  const version = snap?.version ?? TERMS_VERSION;
  const additional = String(
    snap?.additional_agreement ??
      invoice.additional_agreement ??
      invoice.custom_terms ??
      invoice.shop_note ??
      "",
  ).trim();

  return { heading, points, version, additional };
}

/**
 * Builds a complete, self-contained HTML document for a counter invoice.
 * Pure function — no side effects, no window manipulation.
 * Pass the result to PrintPreviewModal via srcDoc.
 */
export function buildCounterInvoiceHtml(
  kind: InvoiceKind,
  invoice: InvoiceDetail,
  paper: "80MM" | "A4",
): string {
  const vatNum = (business.vatNumber as string | undefined) ?? "";
  const isVatConfigured = Boolean(vatNum.trim().length > 0);
  const isVoid = invoice.status === "VOID";

  const invoiceNumber = String(invoice.invoice_number ?? "INV");
  const barcodeSvg = generateCode128BarcodeSvg(invoiceNumber, {
    height: paper === "80MM" ? 32 : 36,
    moduleWidth: paper === "80MM" ? 1.25 : 1.35,
    showLabel: false,
  });

  const createdAt = new Date(invoice.created_at || Date.now());
  const dateFormatted = createdAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeFormatted = createdAt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalPence = Number(
    invoice.total_pence ?? invoice.purchase_price_pence ?? invoice.selling_price_pence ?? 0,
  );
  const subtotalPence = Number(invoice.subtotal_pence ?? totalPence);
  const discountPence = Number(invoice.discount_pence ?? 0);
  const paidPence = Number(invoice.paid_pence ?? 0);
  const balancePence = Number(invoice.balance_pence ?? Math.max(0, totalPence - paidPence));
  const rawWarranty = invoice.warranty_days ? Number(invoice.warranty_days) : 0;
  const hasWarranty = rawWarranty > 0;
  let warrantyDays = hasWarranty ? `${invoice.warranty_days} Days` : "None";
  if (invoice.warranty_notes && hasWarranty) {
    warrantyDays += ` (${invoice.warranty_notes})`;
  }

  const docTitle =
    kind === "REPAIR"
      ? isVatConfigured
        ? "REPAIR TAX INVOICE"
        : "REPAIR INVOICE / RECEIPT"
      : kind === "SALE"
        ? isVatConfigured
          ? "SALE TAX INVOICE"
          : "MOBILE SALE INVOICE / RECEIPT"
        : "MOBILE PURCHASE / TRADE-IN RECEIPT";

  const ctx = {
    kind,
    invoice,
    invoiceNumber,
    barcodeSvg,
    dateFormatted,
    timeFormatted,
    docTitle,
    isVoid,
    isVatConfigured,
    subtotalPence,
    discountPence,
    totalPence,
    paidPence,
    balancePence,
    warrantyDays,
    hasWarranty,
  };

  return paper === "A4" ? generateA4InvoiceHtml(ctx) : generate80mmThermalHtml(ctx);
}

// ─── A4 Professional Layout ───────────────────────────────────────────────────

function generateA4InvoiceHtml(ctx: {
  kind: InvoiceKind;
  invoice: InvoiceDetail;
  invoiceNumber: string;
  barcodeSvg: string;
  dateFormatted: string;
  timeFormatted: string;
  docTitle: string;
  isVoid: boolean;
  isVatConfigured: boolean;
  subtotalPence: number;
  discountPence: number;
  totalPence: number;
  paidPence: number;
  balancePence: number;
  warrantyDays: string;
  hasWarranty: boolean;
}) {
  const {
    kind,
    invoice,
    invoiceNumber,
    barcodeSvg,
    dateFormatted,
    timeFormatted,
    docTitle,
    isVoid,
    isVatConfigured,
    subtotalPence,
    discountPence,
    totalPence,
    paidPence,
    balancePence,
    warrantyDays,
    hasWarranty,
  } = ctx;

  const partyLabel = kind === "PURCHASE" ? "Seller" : "Customer";
  const partyName = String(
    invoice.customer_name ?? invoice.supplier_name ?? invoice.party_name ?? "Walk-in Customer",
  );
  const rawPartyPhone = String(
    invoice.customer_phone ?? invoice.supplier_phone ?? invoice.party_phone ?? "",
  ).trim();
  const isInvalidPhone =
    !rawPartyPhone ||
    rawPartyPhone === "—" ||
    rawPartyPhone === "-" ||
    rawPartyPhone.toLowerCase().includes("walk-in") ||
    rawPartyPhone.toLowerCase().includes("walk in") ||
    rawPartyPhone.toLowerCase() === "n/a" ||
    rawPartyPhone.toLowerCase() === "none";
  const partyPhone = isInvalidPhone ? null : rawPartyPhone;
  const partyEmail = invoice.supplier_email ? String(invoice.supplier_email) : null;
  const partyAddress = invoice.supplier_address ? String(invoice.supplier_address) : null;
  const purchaseDate = invoice.purchase_date ? String(invoice.purchase_date) : null;
  const idRef = invoice.id_reference ? String(invoice.id_reference) : null;

  const deviceMake = String(invoice.device_make ?? "");
  const deviceModel = String(invoice.device_model ?? "");
  const deviceName = `${deviceMake} ${deviceModel}`.trim() || "Mobile Device";
  const imei1 = invoice.imei ? String(invoice.imei) : null;
  const serialNum = invoice.serial ? String(invoice.serial) : null;
  const imeiOrSerial = imei1 ?? serialNum ?? String(invoice.imei_serial ?? "N/A");
  const condition = invoice.device_condition ? String(invoice.device_condition) : null;
  const storageColour = [invoice.storage, invoice.colour].filter(Boolean).join(" · ");
  const batteryHealth = invoice.battery_health ? String(invoice.battery_health) : null;
  const networkStatus = invoice.network_status ? String(invoice.network_status) : null;
  const accessories = invoice.accessories ? String(invoice.accessories) : null;
  const terms = resolveTerms(kind, invoice, hasWarranty);

  // Itemized service description
  let itemDescription = "";
  let itemSubtext = "";
  let tableHeaderTitle = "Description";

  if (kind === "REPAIR") {
    tableHeaderTitle = "Description & Work Specification";
    itemDescription = String(invoice.problem || "Device Repair Service");
    itemSubtext = invoice.repair_work
      ? `Work Specification: ${String(invoice.repair_work)}`
      : "Diagnostic inspection, component service & functional quality testing";
  } else if (kind === "SALE") {
    tableHeaderTitle = "Item Description";
    itemDescription = `Handset Sale — ${deviceName}`;
    itemSubtext = "";
  } else {
    tableHeaderTitle = "Device Purchased";
    itemDescription = `Device Purchase — ${deviceName}`;
    itemSubtext = "";
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(invoiceNumber)} — ${escapeHtml(business.name)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #111827 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .invoice-container {
        box-shadow: none !important;
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .info-card, table.items-table, .summary-wrap, .terms-box {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 12.5px;
      line-height: 1.45;
      padding: 0;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    .void-banner {
      background: #fee2e2;
      border: 2px dashed #dc2626;
      color: #991b1b;
      font-weight: 800;
      font-size: 14px;
      text-align: center;
      padding: 6px 10px;
      margin-bottom: 14px;
      border-radius: 6px;
      letter-spacing: 2px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #FC4B01;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .invoice-logo {
      height: 64px;
      width: auto;
      max-width: 260px;
      object-fit: contain;
      margin-bottom: 6px;
      display: block;
    }
    .brand-legal {
      font-size: 11.5px;
      font-weight: 600;
      color: #374151;
      margin-top: 2px;
    }
    .brand-contact {
      font-size: 11px;
      color: #6b7280;
      margin-top: 3px;
      line-height: 1.4;
    }
    .meta-box {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .doc-badge {
      display: inline-block;
      background: #FFF1EB;
      color: #FC4B01;
      font-weight: 800;
      font-size: 10.5px;
      letter-spacing: 0.8px;
      padding: 4px 9px;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .inv-num {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 16px;
      font-weight: 800;
      color: #111827;
    }
    .inv-date {
      font-size: 11px;
      color: #6b7280;
      margin-top: 2px;
    }
    .barcode-wrap {
      margin-top: 6px;
      max-width: 175px;
    }
    .grid-two {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .info-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .card-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6b7280;
      margin-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }
    .info-row {
      font-size: 12px;
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .info-row strong {
      color: #111827;
      text-align: right;
    }
    .info-row span {
      color: #6b7280;
      flex-shrink: 0;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    table.items-table th {
      background: #f3f4f6;
      border-top: 1px solid #e5e7eb;
      border-bottom: 2px solid #FC4B01;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 7px 10px;
      color: #374151;
      text-align: left;
    }
    table.items-table th.text-right,
    table.items-table td.text-right {
      text-align: right;
    }
    table.items-table td {
      padding: 9px 10px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
      font-size: 12.5px;
    }
    .item-desc {
      font-weight: 700;
      color: #111827;
    }
    .item-sub {
      font-size: 11px;
      color: #6b7280;
      margin-top: 2px;
      line-height: 1.35;
    }
    .summary-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .summary-box {
      width: 270px;
      border-radius: 6px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 9px 12px;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 3px;
      color: #4b5563;
    }
    .sum-row.total-row {
      border-top: 2px solid #FC4B01;
      padding-top: 5px;
      margin-top: 4px;
      font-size: 14.5px;
      font-weight: 800;
      color: #FC4B01;
    }
    .sum-row.balance-row {
      border-top: 1px solid #e5e7eb;
      padding-top: 4px;
      margin-top: 4px;
      font-size: 12.5px;
      font-weight: 800;
      color: ${balancePence > 0 ? "#b45309" : "#047857"};
    }
    .terms-box {
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
      font-size: 9.5px;
      color: #6b7280;
      line-height: 1.4;
    }
    .terms-title {
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .footer-note {
      text-align: center;
      margin-top: 14px;
      font-size: 10px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    ${isVoid ? '<div class="void-banner">⚠ VOID INVOICE — TRANSACTION REVERSED</div>' : ""}

    <!-- Header -->
    <div class="header">
      <div>
        <img src="/logo.png" alt="${escapeHtml(business.name)}" class="invoice-logo" />
        <p class="brand-legal">${escapeHtml(business.legalName)}</p>
        <p class="brand-contact">
          ${escapeHtml(business.address.line1)}, ${escapeHtml(business.address.city)} ${escapeHtml(business.address.postcode)}<br>
          Tel: ${escapeHtml(business.phone)} | Email: ${escapeHtml(business.email)}
          ${isVatConfigured ? `<br>VAT Reg: ${escapeHtml(business.vatNumber)}` : ""}
        </p>
      </div>
      <div class="meta-box">
        <span class="doc-badge">${escapeHtml(docTitle)}</span>
        <div class="inv-num">${escapeHtml(invoiceNumber)}</div>
        <div class="inv-date">Date: ${escapeHtml(dateFormatted)} · ${escapeHtml(timeFormatted)}</div>
        <div class="barcode-wrap">${barcodeSvg}</div>
      </div>
    </div>

    <!-- Info Cards -->
    <div class="grid-two">
      <div class="info-card">
        <div class="card-title">${escapeHtml(partyLabel)} Information</div>
        <div class="info-row"><span>Name:</span> <strong>${escapeHtml(partyName)}</strong></div>
        ${partyPhone ? `<div class="info-row"><span>Phone:</span> <strong>${escapeHtml(partyPhone)}</strong></div>` : ""}
        ${partyEmail ? `<div class="info-row"><span>Email:</span> <strong>${escapeHtml(partyEmail)}</strong></div>` : ""}
        ${partyAddress ? `<div class="info-row"><span>Address:</span> <strong>${escapeHtml(partyAddress)}</strong></div>` : ""}
        ${idRef ? `<div class="info-row"><span>ID Ref:</span> <strong>${escapeHtml(idRef)}</strong></div>` : ""}
        ${invoice.payment_method ? `<div class="info-row"><span>Payment:</span> <strong>${escapeHtml(String(invoice.payment_method).replace(/_/g, " "))}</strong></div>` : ""}
        ${purchaseDate ? `<div class="info-row"><span>Purchase Date:</span> <strong>${escapeHtml(purchaseDate)}</strong></div>` : ""}
      </div>
      <div class="info-card">
        <div class="card-title">Device Information</div>
        <div class="info-row"><span>Device:</span> <strong>${escapeHtml(deviceName)}</strong></div>
        ${storageColour ? `<div class="info-row"><span>Specification:</span> <strong>${escapeHtml(storageColour)}</strong></div>` : ""}
        ${condition ? `<div class="info-row"><span>Condition:</span> <strong>${escapeHtml(condition)}</strong></div>` : ""}
        ${imei1 ? `<div class="info-row"><span>IMEI:</span> <strong>${escapeHtml(imei1)}</strong></div>` : ""}
        ${!imei1 && serialNum ? `<div class="info-row"><span>Serial:</span> <strong>${escapeHtml(serialNum)}</strong></div>` : ""}
        ${imei1 && serialNum ? `<div class="info-row"><span>Serial:</span> <strong>${escapeHtml(serialNum)}</strong></div>` : ""}
        ${batteryHealth ? `<div class="info-row"><span>Battery:</span> <strong>${escapeHtml(batteryHealth)}%</strong></div>` : ""}
        ${networkStatus ? `<div class="info-row"><span>Network:</span> <strong>${escapeHtml(networkStatus)}</strong></div>` : ""}
        ${accessories ? `<div class="info-row"><span>Accessories:</span> <strong>${escapeHtml(accessories)}</strong></div>` : ""}
        ${kind !== "PURCHASE" ? `<div class="info-row"><span>Warranty:</span> <strong>${escapeHtml(warrantyDays)}</strong></div>` : ""}
        ${
          kind === "REPAIR" && hasWarranty
            ? `<div style="font-size: 10px; color: #6b7280; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #e5e7eb; line-height: 1.35;">${escapeHtml(REPAIR_WARRANTY_EXCLUSION_TEXT)}</div>`
            : ""
        }
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>${escapeHtml(tableHeaderTitle)}</th>
          ${hasWarranty ? '<th style="width: 105px;" class="text-right">Warranty</th>' : ""}
          <th style="width: 110px;" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-desc">${escapeHtml(itemDescription)}</div>
            ${itemSubtext ? `<div class="item-sub">${escapeHtml(itemSubtext)}</div>` : ""}
          </td>
          ${hasWarranty ? `<td class="text-right">${escapeHtml(warrantyDays)}</td>` : ""}
          <td class="text-right" style="font-weight: 700; color: #111827;">${escapeHtml(formatPence(totalPence))}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals Summary -->
    <div class="summary-wrap">
      <div class="summary-box">
        ${
          discountPence > 0
            ? `
          <div class="sum-row"><span>Subtotal:</span><span>${escapeHtml(formatPence(subtotalPence))}</span></div>
          <div class="sum-row"><span>Discount:</span><span>− ${escapeHtml(formatPence(discountPence))}</span></div>
        `
            : ""
        }
        <div class="sum-row total-row">
          <span>Total:</span>
          <span>${escapeHtml(formatPence(totalPence))}</span>
        </div>
        <div class="sum-row">
          <span>Amount Paid:</span>
          <span>${escapeHtml(formatPence(paidPence))}</span>
        </div>
        <div class="sum-row balance-row">
          <span>${balancePence > 0 ? "Balance Due:" : "Balance:"}</span>
          <span>${balancePence > 0 ? escapeHtml(formatPence(balancePence)) : "Paid in Full (£0.00)"}</span>
        </div>
      </div>
    </div>

    <!-- Terms & Warranty Conditions -->
    <div class="terms-box">
      <div class="terms-title">${escapeHtml(terms.heading)}</div>
      ${terms.points
        .map(
          (p) =>
            `<p style="margin-bottom: 2.5px;"><strong>${escapeHtml(p.title)}:</strong> ${escapeHtml(p.body)}</p>`,
        )
        .join("")}

      ${
        terms.additional
          ? `
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #d1d5db;">
          <strong style="color: #111827;">Additional Agreement for This Invoice:</strong>
          <p style="margin-top: 2px; color: #111827;">${escapeHtml(terms.additional)}</p>
        </div>`
          : ""
      }
    </div>

    <!-- Signatures (Only for Purchase / Trade-in) -->
    ${
      kind === "PURCHASE"
        ? `
      <div style="margin-top: 16px; padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 10.5px; color: #374151; line-height: 1.45;">
        <strong style="font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Seller Declaration</strong>
        <p style="margin-top: 3px; font-style: italic; color: #111827;">
          &ldquo;I confirm that I am the lawful owner of this device, the information provided is correct, and I have received the agreed payment.&rdquo;
        </p>
      </div>
      <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; font-size: 10.5px; color: #374151;">
        <div>
          <div style="margin-bottom: 18px;">Seller Name: ____________________________________</div>
          <div>Seller Signature: _______________________________</div>
        </div>
        <div>
          <div style="margin-bottom: 18px;">Date: ___________________________________________</div>
          <div>Authorised Shop Signature: ______________________</div>
        </div>
      </div>`
        : ""
    }

    <div class="footer-note">
      Thank you for choosing ${escapeHtml(business.name)}.<br>
      Your statutory rights under UK consumer law are not affected.
    </div>
  </div>
</body>
</html>`;
}

// ─── 80mm POS Thermal Receipt Layout ──────────────────────────────────────────

function generate80mmThermalHtml(ctx: {
  kind: InvoiceKind;
  invoice: InvoiceDetail;
  invoiceNumber: string;
  barcodeSvg: string;
  dateFormatted: string;
  timeFormatted: string;
  docTitle: string;
  isVoid: boolean;
  isVatConfigured: boolean;
  subtotalPence: number;
  discountPence: number;
  totalPence: number;
  paidPence: number;
  balancePence: number;
  warrantyDays: string;
  hasWarranty: boolean;
}) {
  const {
    kind,
    invoice,
    invoiceNumber,
    barcodeSvg,
    dateFormatted,
    timeFormatted,
    docTitle,
    isVoid,
    isVatConfigured,
    discountPence,
    totalPence,
    paidPence,
    balancePence,
    warrantyDays,
    hasWarranty,
  } = ctx;

  const partyName = String(
    invoice.customer_name ?? invoice.supplier_name ?? invoice.party_name ?? "Walk-in Customer",
  );
  const rawPartyPhone = String(
    invoice.customer_phone ?? invoice.supplier_phone ?? invoice.party_phone ?? "",
  ).trim();
  const isInvalidPhone =
    !rawPartyPhone ||
    rawPartyPhone === "—" ||
    rawPartyPhone === "-" ||
    rawPartyPhone.toLowerCase().includes("walk-in") ||
    rawPartyPhone.toLowerCase().includes("walk in") ||
    rawPartyPhone.toLowerCase() === "n/a" ||
    rawPartyPhone.toLowerCase() === "none";
  const partyPhone = isInvalidPhone ? null : rawPartyPhone;
  const partyEmail = invoice.supplier_email ? String(invoice.supplier_email) : "";
  const deviceName =
    `${invoice.device_make ?? ""} ${invoice.device_model ?? ""}`.trim() || "Mobile Device";
  const imei1 = invoice.imei ? String(invoice.imei) : "";
  const serialNum = invoice.serial ? String(invoice.serial) : "";
  const imeiOrSerial = imei1 || serialNum || String(invoice.imei_serial ?? "");
  const batteryHealth80 = invoice.battery_health ? String(invoice.battery_health) : "";
  const networkStatus80 = invoice.network_status ? String(invoice.network_status) : "";
  const accessories80 = invoice.accessories ? String(invoice.accessories) : "";
  const problem = invoice.problem ? String(invoice.problem) : "";
  const repairWork = invoice.repair_work ? String(invoice.repair_work) : "";
  const terms = resolveTerms(kind, invoice, hasWarranty);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(invoiceNumber)}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 2mm 3mm !important;
        width: 100% !important;
        background: #ffffff !important;
        color: #000000 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
      color: #000;
      background: #fff;
      font-size: 12px;
      line-height: 1.35;
      padding: 3px 5px;
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .brand-name { font-size: 16px; font-weight: 900; letter-spacing: 0.5px; }
    .brand-sub { font-size: 10px; margin-top: 2px; }
    .divider { border-top: 1px dashed #000; margin: 6px 0; }
    .divider-solid { border-top: 1px solid #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; gap: 6px; margin: 3px 0; font-size: 11.5px; }
    .row span { color: #222; flex-shrink: 0; }
    .total-row { font-size: 14px; font-weight: 900; margin: 5px 0; }
    .barcode-box { margin: 6px 0; text-align: center; }
    .void-banner { border: 2px solid #000; padding: 4px; text-align: center; font-weight: bold; margin-bottom: 6px; font-size: 12px; }
    .footer { font-size: 9.5px; text-align: center; margin-top: 8px; line-height: 1.35; }
  </style>
</head>
<body>
  ${isVoid ? '<div class="void-banner">*** VOID INVOICE ***</div>' : ""}

  <div class="text-center">
    <div class="brand-name">${escapeHtml(business.name)}</div>
    <div class="brand-sub">${escapeHtml(business.address.line1)}, ${escapeHtml(business.address.postcode)}</div>
    <div class="brand-sub">Tel: ${escapeHtml(business.phone)}</div>
    ${isVatConfigured ? `<div class="brand-sub">VAT: ${escapeHtml(business.vatNumber)}</div>` : ""}
  </div>

  <div class="divider"></div>

  <div class="text-center bold" style="font-size: 12px; text-transform: uppercase;">
    ${escapeHtml(docTitle)}
  </div>
  <div class="text-center" style="font-size: 10.5px; margin-top: 2px;">
    ${escapeHtml(dateFormatted)} · ${escapeHtml(timeFormatted)}
  </div>

  <div class="barcode-box">
    ${barcodeSvg}
  </div>

  <div class="divider"></div>

  <div class="row">
    <span>${kind === "PURCHASE" ? "Seller:" : "Customer:"}</span>
    <strong class="text-right">${escapeHtml(partyName)}</strong>
  </div>
  ${partyPhone ? `<div class="row"><span>Phone:</span><strong class="text-right">${escapeHtml(partyPhone)}</strong></div>` : ""}
  ${kind === "PURCHASE" && partyEmail ? `<div class="row"><span>Email:</span><strong class="text-right">${escapeHtml(partyEmail)}</strong></div>` : ""}

  <div class="row">
    <span>Device:</span>
    <strong class="text-right">${escapeHtml(deviceName)}</strong>
  </div>
  ${kind === "PURCHASE" && imei1 ? `<div class="row"><span>IMEI:</span><strong class="text-right">${escapeHtml(imei1)}</strong></div>` : ""}
  ${kind !== "PURCHASE" && imeiOrSerial ? `<div class="row"><span>IMEI/SN:</span><strong class="text-right">${escapeHtml(imeiOrSerial)}</strong></div>` : ""}
  ${kind === "PURCHASE" && serialNum ? `<div class="row"><span>Serial:</span><strong class="text-right">${escapeHtml(serialNum)}</strong></div>` : ""}
  ${problem ? `<div class="row"><span>Problem:</span><strong class="text-right">${escapeHtml(problem)}</strong></div>` : ""}
  ${repairWork ? `<div class="row"><span>Work:</span><strong class="text-right">${escapeHtml(repairWork)}</strong></div>` : ""}
  ${batteryHealth80 && kind === "PURCHASE" ? `<div class="row"><span>Battery:</span><strong class="text-right">${escapeHtml(batteryHealth80)}%</strong></div>` : ""}
  ${networkStatus80 && kind === "PURCHASE" ? `<div class="row"><span>Network:</span><strong class="text-right">${escapeHtml(networkStatus80)}</strong></div>` : ""}
  ${accessories80 && kind === "PURCHASE" ? `<div class="row"><span>Accessories:</span><strong class="text-right">${escapeHtml(accessories80)}</strong></div>` : ""}
  ${kind !== "PURCHASE" ? `<div class="row"><span>Warranty:</span><strong class="text-right">${escapeHtml(warrantyDays)}</strong></div>` : ""}
  ${
    kind === "REPAIR" && hasWarranty
      ? `<div style="font-size: 8.5px; color: #333; margin-top: 2px; line-height: 1.3;">${escapeHtml(REPAIR_WARRANTY_EXCLUSION_TEXT)}</div>`
      : ""
  }

  <div class="divider-solid"></div>

  ${discountPence > 0 ? `<div class="row"><span>Discount:</span><strong class="text-right">− ${escapeHtml(formatPence(discountPence))}</strong></div>` : ""}
  
  <div class="row total-row">
    <span>TOTAL:</span>
    <strong class="text-right">${escapeHtml(formatPence(totalPence))}</strong>
  </div>
  
  <div class="row">
    <span>Paid (${escapeHtml(String(invoice.payment_method ?? "CASH").replace(/_/g, " "))}):</span>
    <strong class="text-right">${escapeHtml(formatPence(paidPence))}</strong>
  </div>
  
  <div class="row bold">
    <span>${balancePence > 0 ? "BALANCE DUE:" : "BALANCE:"}</span>
    <strong class="text-right">${balancePence > 0 ? escapeHtml(formatPence(balancePence)) : "Paid in Full (£0.00)"}</strong>
  </div>

  <div class="divider"></div>

  <div class="terms-section" style="font-size: 8px; line-height: 1.35; margin: 5px 0; color: #111;">
    <div class="bold text-center" style="margin-bottom: 3px; font-size: 9px; text-transform: uppercase;">
      ${escapeHtml(terms.heading)}
    </div>
    ${terms.points
      .map(
        (p) =>
          `<div style="margin-bottom: 2px;"><strong>${escapeHtml(p.title)}:</strong> ${escapeHtml(p.body)}</div>`,
      )
      .join("")}
    
    ${
      terms.additional
        ? `
      <div style="margin-top: 4px; padding-top: 3px; border-top: 1px dashed #000;">
        <strong>Additional Agreement:</strong><br>
        ${escapeHtml(terms.additional)}
      </div>`
        : ""
    }
  </div>

  ${
    kind === "PURCHASE"
      ? `
  <div class="divider"></div>
  <div style="font-size: 8px; line-height: 1.4; margin: 5px 0; color: #111;">
    <div style="font-style: italic; margin-bottom: 4px;">&ldquo;I confirm that I am the lawful owner of this device, the info provided is correct, and I received payment.&rdquo;</div>
    <div>Seller Sig: _______________________________</div>
    <div style="margin-top: 3px;">Date: ______________________________________</div>
  </div>`
      : ""
  }

  <div class="divider"></div>

  <div class="footer">
    ${escapeHtml(business.name)}<br>
    ${escapeHtml(business.address.line1)}, ${escapeHtml(business.address.postcode)}<br>
    Tel: ${escapeHtml(business.phone)}<br>
    <strong>Thank you for choosing ${escapeHtml(business.name)}!</strong><br>
    Your statutory rights under UK consumer law are not affected.
  </div>
</body>
</html>`;
}

// ─── Statement Printing ────────────────────────────────────────────────────────

/**
 * Builds a complete, self-contained HTML document for a customer/supplier statement.
 * Pure function — no side effects, no window manipulation.
 */
export function buildStatementHtml(
  statement: PartyStatement,
  type: "CUSTOMER" | "SUPPLIER",
): string {
  let running = statement.opening_pence;
  const rows = statement.entries
    .map((entry) => {
      running += entry.debit_pence - entry.credit_pence;
      return `<tr>
        <td>${escapeHtml(new Date(entry.created_at).toLocaleDateString("en-GB"))}</td>
        <td>${escapeHtml(entry.description)}</td>
        <td style="font-family: monospace;">${escapeHtml(entry.reference)}</td>
        <td style="text-align: right;">${entry.debit_pence ? escapeHtml(formatPence(entry.debit_pence)) : "\u2014"}</td>
        <td style="text-align: right; color: #047857;">${entry.credit_pence ? escapeHtml(formatPence(entry.credit_pence)) : "\u2014"}</td>
        <td style="text-align: right; font-weight: bold;">${escapeHtml(formatPence(running))}</td>
      </tr>`;
    })
    .join("");

  const balanceDue = statement.balance_pence;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Statement — ${escapeHtml(statement.party.name)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      padding: 10px;
      font-size: 12.5px;
      line-height: 1.45;
    }
    .header {
      border-bottom: 2px solid #FC4B01;
      padding-bottom: 14px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .statement-logo {
      height: 64px;
      width: auto;
      max-width: 260px;
      object-fit: contain;
      margin-bottom: 6px;
      display: block;
    }
    .title {
      font-size: 22px;
      font-weight: 900;
      color: #FC4B01;
    }
    .meta {
      text-align: right;
      font-size: 11.5px;
      color: #6b7280;
    }
    .party-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 18px;
    }
    .balance-badge {
      font-size: 19px;
      font-weight: bold;
      color: ${balanceDue > 0 ? "#b45309" : "#047857"};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      font-size: 12px;
    }
    th {
      background: #f3f4f6;
      border-bottom: 2px solid #FC4B01;
      padding: 8px 8px;
      text-align: left;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 8px 8px;
      border-bottom: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <img src="/logo.png" alt="${escapeHtml(business.name)}" class="statement-logo" />
      <p style="font-size: 11px; color: #6b7280; margin-top: 2px;">
        ${escapeHtml(business.address.line1)}, ${escapeHtml(business.address.city)} ${escapeHtml(business.address.postcode)} · Tel: ${escapeHtml(business.phone)}
      </p>
    </div>
    <div class="meta">
      <h2 style="font-size: 15px; font-weight: bold; color: #111827;">${type === "CUSTOMER" ? "CUSTOMER" : "SUPPLIER"} STATEMENT</h2>
      <p>Date: ${escapeHtml(new Date().toLocaleDateString("en-GB"))}</p>
    </div>
  </div>

  <div class="party-box">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <p style="font-size: 15px; font-weight: bold; color: #111827;">${escapeHtml(statement.party.name)}</p>
        <p style="color: #6b7280; font-size: 12px;">${escapeHtml(statement.party.phone)}</p>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 10.5px; text-transform: uppercase; color: #6b7280; font-weight: 600;">${type === "CUSTOMER" ? "Total Amount Due" : "Total Owed"}</p>
        <p class="balance-badge">${escapeHtml(formatPence(balanceDue))}</p>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Reference</th>
        <th style="text-align: right;">Invoice</th>
        <th style="text-align: right;">Payment</th>
        <th style="text-align: right;">Running Balance</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="5" style="font-weight: 600; color: #6b7280;">Opening Balance</td>
        <td style="text-align: right; font-weight: bold;">${escapeHtml(formatPence(statement.opening_pence))}</td>
      </tr>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}
