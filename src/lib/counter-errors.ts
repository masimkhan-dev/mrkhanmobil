/**
 * User-Friendly Error Mapper & Safe Logger for Counter & Stock Modules.
 *
 * Translates low-level errors (Supabase, Postgres, RPC, Zod, Network)
 * into plain English messages with clear next steps.
 * Never exposes raw SQL, stack traces, or technical error codes to the shop worker.
 */

export type UserFriendlyError = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionType?: "RELOAD" | "SIGN_IN" | "RETRY" | "STOCK_LIST" | "INVOICE_LIST";
  isWarning?: boolean;
};

/**
 * Maps any error object or message into a structured, customer-friendly message.
 */
export function mapCounterError(
  error: unknown,
  context?: {
    operation?: string;
    stockId?: string;
    invoiceNumber?: string;
    imei?: string;
  },
): UserFriendlyError {
  const rawMsg = error instanceof Error ? error.message : String(error || "");
  const lowerMsg = rawMsg.toLowerCase();

  // 1. Session / Authentication Errors
  if (
    lowerMsg.includes("jwt") ||
    lowerMsg.includes("not authenticated") ||
    lowerMsg.includes("auth/session-expired") ||
    lowerMsg.includes("session expired") ||
    lowerMsg.includes("unauthenticated")
  ) {
    return {
      title: "Session expired",
      description: "Sign in again to continue.",
      actionLabel: "Sign In",
      actionHref: "/login",
      actionType: "SIGN_IN",
    };
  }

  // 2. Permission / Admin Role Errors
  if (
    lowerMsg.includes("unauthorized") ||
    lowerMsg.includes("permission denied") ||
    lowerMsg.includes("forbidden") ||
    lowerMsg.includes("only administrators") ||
    lowerMsg.includes("admin permission")
  ) {
    return {
      title: "Permission denied",
      description: "You do not have permission to perform this action.",
      actionLabel: "Return to Phone Stock",
      actionHref: "/admin/stock",
      actionType: "STOCK_LIST",
    };
  }

  // 3. Duplicate IMEI Conflicts
  if (
    lowerMsg.includes("imei is already in use") ||
    lowerMsg.includes("duplicate imei") ||
    lowerMsg.includes("stock_active_imei_idx") ||
    lowerMsg.includes("already in stock")
  ) {
    return {
      title: "IMEI already exists",
      description: "This IMEI is already assigned to another stock item in your inventory.",
      actionLabel: "View Phone Stock",
      actionHref: "/admin/stock",
      actionType: "STOCK_LIST",
    };
  }

  // 4. Record Not Found / Inaccessible
  if (
    lowerMsg.includes("stock item not found") ||
    lowerMsg.includes("record not found") ||
    lowerMsg.includes("pgrst116") ||
    lowerMsg.includes("0 rows")
  ) {
    return {
      title: "Stock item not found",
      description: "This stock item may have been removed or is no longer available.",
      actionLabel: "Return to Phone Stock",
      actionHref: "/admin/stock",
      actionType: "STOCK_LIST",
    };
  }

  // 5. Terminal Status Records (Sold, Removed, Voided)
  if (lowerMsg.includes("status is sold") || lowerMsg.includes("has already been sold")) {
    return {
      title: "This phone has already been sold",
      description: "Sold stock records are read-only and cannot be modified.",
      actionLabel: "View Phone Stock",
      actionHref: "/admin/stock",
      actionType: "STOCK_LIST",
      isWarning: true,
    };
  }

  if (
    lowerMsg.includes("status is removed") ||
    lowerMsg.includes("status is voided") ||
    lowerMsg.includes("cannot edit stock item: status")
  ) {
    return {
      title: "This stock item cannot be edited",
      description: "Removed and voided stock records are permanent and read-only.",
      actionLabel: "Return to Phone Stock",
      actionHref: "/admin/stock",
      actionType: "STOCK_LIST",
      isWarning: true,
    };
  }

  // 6. Seller Purchase Lock Violation (Tamper attempt)
  if (
    lowerMsg.includes("locked to purchase invoice") ||
    lowerMsg.includes("cannot edit brand") ||
    lowerMsg.includes("cannot edit model") ||
    lowerMsg.includes("cannot edit purchase cost") ||
    lowerMsg.includes("cannot edit imei")
  ) {
    return {
      title: "Purchase invoice locked",
      description:
        "Core purchase facts (brand, model, IMEI, purchase cost) belong to the purchase invoice and cannot be changed from stock editing.",
      actionLabel: "View Invoices",
      actionHref: "/admin/invoices",
      actionType: "INVOICE_LIST",
    };
  }

  // 7. Concurrent Update / Version Conflicts
  if (
    lowerMsg.includes("conflict") ||
    lowerMsg.includes("concurrency") ||
    lowerMsg.includes("updated elsewhere") ||
    lowerMsg.includes("deadlock")
  ) {
    return {
      title: "Stock item was updated elsewhere",
      description: "Reload the latest information before making more changes.",
      actionLabel: "Reload",
      actionType: "RELOAD",
    };
  }

  // 8. Timeouts
  if (
    lowerMsg.includes("timeout") ||
    lowerMsg.includes("timed out") ||
    lowerMsg.includes("abort") ||
    lowerMsg.includes("etimedout")
  ) {
    return {
      title: "Request timed out",
      description: "The server took too long to respond. Please try again.",
      actionLabel: "Retry",
      actionType: "RETRY",
    };
  }

  // 9. Network / Connection Errors
  const isOffline =
    typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.onLine === false;
  if (
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("networkerror") ||
    lowerMsg.includes("net::err") ||
    lowerMsg.includes("offline") ||
    isOffline
  ) {
    return {
      title: "Connection problem",
      description: "Check your internet connection and try again.",
      actionLabel: "Retry",
      actionType: "RETRY",
    };
  }

  // 10. Purchase Invoice Creation Atomic Failure
  if (
    context?.operation === "createPurchase" ||
    lowerMsg.includes("counter_create_purchase") ||
    lowerMsg.includes("purchase invoice")
  ) {
    return {
      title: "Purchase could not be saved",
      description: "No invoice or stock record was created. Review the information and try again.",
      actionLabel: "Check Invoices",
      actionHref: "/admin/invoices",
      actionType: "INVOICE_LIST",
    };
  }

  // Safe Default / Unknown Server Error
  return {
    title: "Something went wrong",
    description: "Your changes were not saved. Please check your information and try again.",
    actionLabel: "Retry",
    actionType: "RETRY",
  };
}

/**
 * Developer Error Logger that sanitizes sensitive data (PII, tokens, cards).
 */
export function logCounterError(
  operation: string,
  error: unknown,
  metadata?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === "development") {
    // Sanitize metadata
    const sanitizedMeta: Record<string, unknown> = {};
    if (metadata) {
      for (const [k, v] of Object.entries(metadata)) {
        if (
          k.includes("password") ||
          k.includes("token") ||
          k.includes("secret") ||
          k.includes("auth") ||
          k.includes("seller_name") ||
          k.includes("seller_phone") ||
          k.includes("seller_email") ||
          k.includes("seller_address")
        ) {
          sanitizedMeta[k] = "[REDACTED]";
        } else {
          sanitizedMeta[k] = v;
        }
      }
    }

    console.error(`[Counter POS Error] Operation: ${operation}`, {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      metadata: sanitizedMeta,
    });
  }
}
