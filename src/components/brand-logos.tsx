import React from "react";

interface BrandLogoProps {
  name: string;
  className?: string;
}

export function BrandLogo({ name, className = "h-5 w-5 fill-current" }: BrandLogoProps) {
  switch (name.toLowerCase()) {
    case "apple":
      return (
        <svg className={className} viewBox="0 0 170 170" fill="currentColor" aria-hidden="true">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.25-9.69-1.85-14.63-6.3-3.26-2.77-7.14-7.44-11.64-14.02-6.53-9.5-11.51-20.08-14.95-31.74-3.44-11.66-5.16-22.95-5.16-33.86 0-14.86 3.82-27.18 11.46-36.96 7.64-9.78 17.26-14.78 28.87-15 4.82 0 10.23 1.25 16.23 3.75 6 2.5 10.3 3.75 12.91 3.75 2.12 0 6.53-1.32 13.23-3.97 6.7-2.65 12.3-3.86 16.8-3.63 12.75.5 22.84 5.37 30.27 14.62-11.27 6.83-16.78 16.42-16.53 28.77.25 9.77 4.07 17.85 11.46 24.24 7.39 6.39 16.14 9.87 26.25 10.44-2.5 7.66-5.83 15.35-10.01 23.08zM119.22 31.08c0-7.39 2.65-14.62 7.95-21.68 5.3-7.06 12.12-11.4 20.46-13.02.25 1 .38 1.94.38 2.83 0 7.39-2.72 14.75-8.16 22.08-5.44 7.33-12.28 11.75-20.52 13.26-.06-1.12-.11-2.28-.11-3.47z" />
        </svg>
      );
    case "samsung":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.49 0-4.5-2.01-4.5-4.5S8.51 7.5 11 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
        </svg>
      );
    case "google":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.987 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      );
    case "huawei":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      );
    case "xiaomi":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 3h18v18H3V3zm4 4v10h3v-7h2v7h3V7H7zm7 0h3v10h-3V7z" />
        </svg>
      );
    case "oneplus":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2 2h20v20H2V2zm4 4v12h12V6H6zm5 2h2v3h3v2h-3v3h-2v-3H8v-2h3V8z" />
        </svg>
      );
    case "oppo":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="7" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="17" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "honor":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 6h3v12H4V6zm13 0h3v12h-3V6zm-8 0h3v12H9V6z" />
        </svg>
      );
    case "sony":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 7h16v3H4V7zm0 7h16v3H4v-3z" />
        </svg>
      );
    case "nokia":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 5h4l7 10V5h5v14h-4L9 9v10H4V5z" />
        </svg>
      );
    case "motorola":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5L7 8h2.5l2.5 5 2.5-5H17l-4 8.5V18.5h-2V16.5z" />
        </svg>
      );
    default:
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
  }
}
