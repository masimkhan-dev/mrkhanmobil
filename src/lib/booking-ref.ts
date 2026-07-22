// 8-char human-friendly reference (no ambiguous chars).
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateBookingRef(): string {
  let out = "MK-";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
