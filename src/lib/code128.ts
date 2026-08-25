/**
 * ISO/IEC 15417 Standard-Compliant Code 128 (Subset B) Barcode Generator.
 * Encodes ASCII 32..126 with Start B (104), Modulo 103 checksum, and Stop (106).
 * Output: Clean, scalable vector SVG string.
 */

// Code 128 Pattern Table (indices 0 to 106)
// Each 6-digit string represents the widths of: [bar, space, bar, space, bar, space]
const CODE128_PATTERNS: readonly string[] = [
  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213", // 0-9
  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132", // 10-19
  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211", // 20-29
  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313", // 30-39
  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331", // 40-49
  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111", // 50-59
  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214", // 60-69
  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111", // 70-79
  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141", // 80-89
  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141", // 90-99
  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112", // 100-106 (106 is Stop with 7 elements)
];

const START_B = 104; // Start Code B (ASCII 32 to 127)
const STOP = 106;

/**
 * Encodes ASCII text into a Code 128 (Subset B) module string (e.g. "1101...").
 */
function encodeCode128B(text: string): string {
  const clean = text.replace(/[^\x20-\x7E]/g, "");
  if (!clean) return "";

  // 1. Calculate values and Checksum
  // Checksum = (StartB + Sum(i * value[i-1])) % 103
  let checksumTotal = START_B;
  const values: number[] = [START_B];

  for (let i = 0; i < clean.length; i++) {
    const codeVal = clean.charCodeAt(i) - 32;
    values.push(codeVal);
    checksumTotal += codeVal * (i + 1);
  }

  const checkVal = checksumTotal % 103;
  values.push(checkVal);
  values.push(STOP);

  // 2. Convert pattern widths to binary module string ('1' for bar, '0' for space)
  let modules = "";
  for (const val of values) {
    const pattern = CODE128_PATTERNS[val];
    if (!pattern) continue;

    let isBar = true;
    for (let p = 0; p < pattern.length; p++) {
      const width = parseInt(pattern[p], 10);
      modules += (isBar ? "1" : "0").repeat(width);
      isBar = !isBar;
    }
  }

  return modules;
}

/**
 * Generates an SVG string representation of a Code 128 barcode.
 * @param text Content to encode (e.g. Invoice Number "INV-202608-0001")
 * @param options Height, module width, and whether to include human-readable label
 */
export function generateCode128BarcodeSvg(
  text: string,
  options?: {
    height?: number;
    moduleWidth?: number;
    showLabel?: boolean;
    labelFontSize?: number;
    quietZone?: number;
  },
): string {
  const height = options?.height ?? 44;
  const moduleWidth = options?.moduleWidth ?? 1.5;
  const showLabel = options?.showLabel ?? true;
  const labelFontSize = options?.labelFontSize ?? 11;
  const quietZone = options?.quietZone ?? 10; // Quiet zone in modules

  const modules = encodeCode128B(text);
  if (!modules) return "";

  const totalModules = modules.length + quietZone * 2;
  const totalWidth = totalModules * moduleWidth;
  const totalHeight = height + (showLabel ? labelFontSize + 6 : 0);

  // Build rect elements for consecutive '1' runs to optimize SVG size
  let rects = "";
  let inBar = false;
  let barStart = 0;

  for (let i = 0; i < modules.length; i++) {
    const x = (i + quietZone) * moduleWidth;
    if (modules[i] === "1") {
      if (!inBar) {
        inBar = true;
        barStart = x;
      }
    } else {
      if (inBar) {
        inBar = false;
        rects += `<rect x="${barStart.toFixed(1)}" y="0" width="${(x - barStart).toFixed(1)}" height="${height}" fill="#111827"/>`;
      }
    }
  }

  if (inBar) {
    const endX = (modules.length + quietZone) * moduleWidth;
    rects += `<rect x="${barStart.toFixed(1)}" y="0" width="${(endX - barStart).toFixed(1)}" height="${height}" fill="#111827"/>`;
  }

  const labelSvg = showLabel
    ? `<text x="${(totalWidth / 2).toFixed(1)}" y="${height + labelFontSize + 2}" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace" font-size="${labelFontSize}" font-weight="600" fill="#374151" letter-spacing="1.5">${escapeXml(text)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth.toFixed(1)} ${totalHeight.toFixed(1)}" width="${totalWidth.toFixed(1)}" height="${totalHeight.toFixed(1)}" style="max-width:100%;height:auto;display:inline-block;vertical-align:middle;">${rects}${labelSvg}</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
