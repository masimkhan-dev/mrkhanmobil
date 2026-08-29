import React from "react";

interface BrandLogoProps {
  name: string;
  className?: string;
}

/*
 * Official brand colours used:
 * Apple      #000000 (black)
 * Samsung    #1428A0 (Samsung Blue)
 * Google     multi-colour (G logo)
 * Huawei     #CF0A2C (Huawei Red)
 * Xiaomi     #FF6900 (Xiaomi Orange)
 * Oppo       #1D8348 → actually #007DC5 (Oppo Blue)
 * OnePlus    #F5010C (OnePlus Red)
 * Honor      #C0282D (Honor Red)
 * Sony       #003087 (Sony Blue)
 * Nokia      #005AFF (Nokia Blue)
 * Motorola   #DA1F26 (Motorola Red)
 */

export function BrandLogo({ name, className = "h-5 w-5" }: BrandLogoProps) {
  switch (name.toLowerCase()) {
    // ── Apple ──────────────────────────────────────────────────────────────
    case "apple":
      return (
        <svg
          className={className}
          viewBox="0 0 170 170"
          fill="#000000"
          aria-label="Apple"
          role="img"
        >
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.25-9.69-1.85-14.63-6.3-3.26-2.77-7.14-7.44-11.64-14.02-6.53-9.5-11.51-20.08-14.95-31.74C3.72 101.64 2 90.35 2 79.44c0-14.86 3.82-27.18 11.46-36.96 7.64-9.78 17.26-14.78 28.87-15 4.82 0 10.23 1.25 16.23 3.75 6 2.5 10.3 3.75 12.91 3.75 2.12 0 6.53-1.32 13.23-3.97 6.7-2.65 12.3-3.86 16.8-3.63 12.75.5 22.84 5.37 30.27 14.62-11.27 6.83-16.78 16.42-16.53 28.77.25 9.77 4.07 17.85 11.46 24.24 7.39 6.39 16.14 9.87 26.25 10.44-2.5 7.66-5.83 15.35-10.01 23.08zM119.22 31.08c0-7.39 2.65-14.62 7.95-21.68C132.47 2.34 139.29-2 147.63-3.62c.25 1 .38 1.94.38 2.83 0 7.39-2.72 14.75-8.16 22.08-5.44 7.33-12.28 11.75-20.52 13.26-.06-1.12-.11-2.28-.11-3.47z" />
        </svg>
      );

    // ── Samsung ─────────────────────────────────────────────────────────────
    case "samsung":
      return (
        <svg
          className={className}
          viewBox="0 0 300 112"
          fill="#1428A0"
          aria-label="Samsung"
          role="img"
        >
          {/* Samsung wordmark-style simplified bars */}
          <path d="M16 56C16 33.9 33.9 16 56 16h188c22.1 0 40 17.9 40 40s-17.9 40-40 40H56C33.9 96 16 78.1 16 56z" />
          <path
            d="M56 40h188c8.8 0 16 7.2 16 16s-7.2 16-16 16H56c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
            fill="#ffffff"
          />
          <text
            x="150"
            y="70"
            textAnchor="middle"
            fontSize="48"
            fontFamily="SamsungOne, Arial, sans-serif"
            fontWeight="700"
            fill="#1428A0"
            letterSpacing="2"
          >
            SAMSUNG
          </text>
        </svg>
      );

    // ── Google ──────────────────────────────────────────────────────────────
    case "google":
      return (
        <svg className={className} viewBox="0 0 48 48" aria-label="Google" role="img">
          <path
            fill="#4285F4"
            d="M43.61 20.08H24v7.84h11.08c-1.08 5.34-5.67 8.08-11.08 8.08-6.63 0-12-5.37-12-12s5.37-12 12-12c2.97 0 5.65 1.05 7.75 2.77l5.91-5.91C33.82 5.51 29.16 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20c11.02 0 19.28-7.75 19.28-19.28 0-1.3-.13-2.56-.38-3.64h-.29z"
          />
          <path
            fill="#34A853"
            d="M6.31 14.69l6.84 5.02C14.88 16.13 19.07 13 24 13c2.97 0 5.65 1.05 7.75 2.77l5.91-5.91C33.82 5.51 29.16 4 24 4 16.02 4 9.14 8.39 6.31 14.69z"
          />
          <path
            fill="#FBBC05"
            d="M24 44c5.16 0 9.82-1.77 13.47-4.69l-6.23-5.26C29.22 35.66 26.73 36.5 24 36.5c-5.38 0-9.94-3.63-11.6-8.56l-6.87 5.3C8.95 39.5 15.97 44 24 44z"
          />
          <path
            fill="#EA4335"
            d="M43.61 20.08H24v7.84h11.08c-.5 2.56-1.98 4.74-3.84 6.27l6.23 5.26c3.63-3.37 5.81-8.41 5.81-14.09 0-1.3-.13-2.56-.38-3.64h-.29z"
          />
        </svg>
      );

    // ── Huawei ──────────────────────────────────────────────────────────────
    case "huawei":
      return (
        <svg className={className} viewBox="0 0 100 100" aria-label="Huawei" role="img">
          {/* Huawei flower logo — 4 petal shapes in official red */}
          <g fill="#CF0A2C">
            <ellipse cx="50" cy="28" rx="10" ry="24" transform="rotate(-45 50 50)" />
            <ellipse cx="72" cy="50" rx="10" ry="24" transform="rotate(45 50 50)" />
            <ellipse cx="50" cy="72" rx="10" ry="24" transform="rotate(-45 50 50)" />
            <ellipse cx="28" cy="50" rx="10" ry="24" transform="rotate(45 50 50)" />
          </g>
          <circle cx="50" cy="50" r="8" fill="#CF0A2C" opacity="0.7" />
        </svg>
      );

    // ── Xiaomi ──────────────────────────────────────────────────────────────
    case "xiaomi":
      return (
        <svg className={className} viewBox="0 0 100 100" aria-label="Xiaomi" role="img">
          {/* Xiaomi MI logo mark */}
          <rect x="5" y="5" width="90" height="90" rx="18" fill="#FF6900" />
          <rect x="18" y="22" width="16" height="56" rx="3" fill="#ffffff" />
          <rect x="66" y="22" width="16" height="56" rx="3" fill="#ffffff" />
          <rect x="34" y="22" width="32" height="16" rx="3" fill="#ffffff" />
          <rect x="34" y="62" width="32" height="16" rx="3" fill="#ffffff" />
          <rect x="42" y="38" width="16" height="24" rx="2" fill="#FF6900" />
        </svg>
      );

    // ── Oppo ────────────────────────────────────────────────────────────────
    case "oppo":
      return (
        <svg className={className} viewBox="0 0 100 100" aria-label="Oppo" role="img">
          {/* Oppo ring logo */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#007DC5" strokeWidth="12" />
          <circle cx="50" cy="50" r="26" fill="none" stroke="#007DC5" strokeWidth="8" />
        </svg>
      );

    // ── OnePlus ─────────────────────────────────────────────────────────────
    case "oneplus":
      return (
        <svg className={className} viewBox="0 0 100 100" aria-label="OnePlus" role="img">
          {/* OnePlus 1+ mark */}
          <rect x="4" y="4" width="92" height="92" rx="12" fill="#F5010C" />
          {/* Vertical bar of + */}
          <rect x="46" y="20" width="12" height="60" rx="4" fill="#ffffff" />
          {/* Horizontal bar of + */}
          <rect x="20" y="44" width="60" height="12" rx="4" fill="#ffffff" />
        </svg>
      );

    // ── Honor ───────────────────────────────────────────────────────────────
    case "honor":
      return (
        <svg className={className} viewBox="0 0 100 100" aria-label="Honor" role="img">
          {/* Honor diamond / shield logo simplified */}
          <path d="M50 8L92 32v36L50 92 8 68V32z" fill="#C0282D" />
          <path d="M50 22l28 15v26L50 78 22 63V37z" fill="#ffffff" fillOpacity="0.15" />
          <path d="M38 42h24v16H38z" rx="2" fill="#ffffff" />
          <rect x="38" y="42" width="24" height="16" rx="2" fill="#ffffff" />
          <rect x="46" y="34" width="8" height="32" rx="2" fill="#ffffff" />
        </svg>
      );

    // ── Sony ────────────────────────────────────────────────────────────────
    case "sony":
      return (
        <svg className={className} viewBox="0 0 100 40" fill="#003087" aria-label="Sony" role="img">
          {/* Sony wordmark bars (simplified S-O-N-Y) */}
          <rect x="0" y="10" width="100" height="5" rx="2.5" />
          <rect x="0" y="25" width="100" height="5" rx="2.5" />
          {/* S curve hint */}
          <path
            d="M10 5 Q5 20 10 35"
            stroke="#003087"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );

    // ── Nokia ───────────────────────────────────────────────────────────────
    case "nokia":
      return (
        <svg className={className} viewBox="0 0 100 100" aria-label="Nokia" role="img">
          {/* Nokia wordmark-inspired N shape */}
          <rect x="5" y="5" width="90" height="90" rx="14" fill="#005AFF" />
          {/* N letterform */}
          <rect x="22" y="22" width="12" height="56" rx="3" fill="#ffffff" />
          <rect x="66" y="22" width="12" height="56" rx="3" fill="#ffffff" />
          <path d="M34 22 L66 78" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
        </svg>
      );

    // ── Motorola ─────────────────────────────────────────────────────────────
    case "motorola":
      return (
        <svg className={className} viewBox="0 0 100 100" aria-label="Motorola" role="img">
          {/* Motorola batwing M */}
          <circle cx="50" cy="50" r="46" fill="#DA1F26" />
          {/* M batwing shape */}
          <path
            d="M18 68 L18 38 Q18 22 32 22 Q42 22 44 34 L50 50 L56 34 Q58 22 68 22 Q82 22 82 38 L82 68 L70 68 L70 40 Q70 34 64 34 Q58 34 56 42 L50 62 L44 42 Q42 34 36 34 Q30 34 30 40 L30 68 Z"
            fill="#ffffff"
          />
        </svg>
      );

    // ── Default (generic phone) ──────────────────────────────────────────────
    default:
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
  }
}
