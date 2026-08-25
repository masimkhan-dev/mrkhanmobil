export function poundsToPence(value: string): number {
  const normalized = value.trim().replace(/[£,\s]/g, "");
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return Number.NaN;
  const [pounds, pennies = ""] = normalized.split(".");
  return Number(pounds) * 100 + Number(pennies.padEnd(2, "0"));
}

export function cents(value: string): number {
  const normalized = value.trim();
  if (!normalized) return 0;
  const [whole, decimal = ""] = normalized.split(".");
  if (!/^\d+$/.test(whole) || !/^\d{0,2}$/.test(decimal)) return Number.NaN;
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}

export function formatPence(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value / 100);
}

export function paymentStatus(totalPence: number, paidPence: number) {
  if (totalPence === 0) return "Paid";
  if (paidPence <= 0) return "Unpaid";
  if (paidPence >= totalPence) return "Paid";
  return "Partially Paid";
}
