import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Barcode,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Lock,
  Package,
  PackagePlus,
  Pencil,
  Printer,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CField,
  CompactConfirmModal,
  InlineError,
  MoneyInput,
  PaymentMethodSelector,
  StatusBadge,
  getSavedPaymentMethod,
} from "@/components/counter/ds";
import {
  createInternalStockDevice,
  createPurchaseInvoice,
  getCounterInvoice,
  getStockDevice,
  listCounterStock,
  searchCounterSuppliers,
  updateStockDevice,
  type StockDeviceDetail,
} from "@/lib/counter.functions";
import { buildCounterInvoiceHtml } from "@/lib/counter-print";
import { PrintPreviewModal } from "@/components/counter/print-preview-modal";
import { cents, formatPence } from "@/lib/money";
import { DEVICE_MODELS, inferBrand } from "@/lib/counter-constants";
import { mapCounterError, logCounterError } from "@/lib/counter-errors";
import type { PartySummary } from "@/lib/counter.types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/buy")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { editId?: string } => {
    return {
      editId: typeof search.editId === "string" && search.editId ? search.editId : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Add / Edit Phone Stock — MR KHAN" }] }),
  component: AddPhoneToStockPage,
});

// ─── Options & Constants ──────────────────────────────────────────────────────

const POPULAR_BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Motorola",
  "Huawei",
  "OnePlus",
  "Nokia",
  "Other",
] as const;

const STORAGE_OPTIONS = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "Other"] as const;

const CONDITION_OPTIONS = [
  { value: "New", label: "New", sub: "Sealed" },
  { value: "Grade A", label: "Grade A", sub: "Flawless" },
  { value: "Grade B", label: "Grade B", sub: "Minor wear" },
  { value: "Grade C", label: "Grade C", sub: "Visible wear" },
  { value: "Faulty", label: "Faulty", sub: "Spares/Repair" },
] as const;

const NETWORK_OPTIONS = ["Unlocked", "Network Locked", "Unknown"] as const;
const ACCESSORIES_LIST = ["Box", "Charger", "Cable", "Case", "Earphones"] as const;

type CheckStatus = "WORKING" | "NOT_WORKING" | "NOT_TESTED" | "NA";

const CHECK_KEYS = [
  "biometrics",
  "screen",
  "cameras",
  "audio",
  "charging",
  "buttons",
  "connectivity",
  "network",
] as const;

type DeviceChecksState = {
  biometrics: CheckStatus;
  screen: CheckStatus;
  cameras: CheckStatus;
  audio: CheckStatus;
  charging: CheckStatus;
  buttons: CheckStatus;
  connectivity: CheckStatus;
  network: CheckStatus;
  batteryHealth: string;
  faultNotes: string;
};

const initialDeviceChecks = (): DeviceChecksState => ({
  biometrics: "NOT_TESTED",
  screen: "NOT_TESTED",
  cameras: "NOT_TESTED",
  audio: "NOT_TESTED",
  charging: "NOT_TESTED",
  buttons: "NOT_TESTED",
  connectivity: "NOT_TESTED",
  network: "NOT_TESTED",
  batteryHealth: "",
  faultNotes: "",
});

type StockEntryMode = "DIRECT" | "SELLER";
type PayMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";

type PhoneForm = {
  brand: string;
  customBrand: string;
  model: string;
  storage: string;
  customStorage: string;
  colour: string;
  imei1: string;
  condition: string;
  cost_price: string;
  selling_price: string;
  // Optional details (modal)
  imei2: string;
  serial: string;
  network_status: string;
  accessories: string[];
  source_note: string;
  general_notes: string;
  // Seller details (SELLER mode)
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  seller_address: string;
  purchase_date: string;
  payment_method: PayMethod;
  purchase_notes: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const blankForm = (): PhoneForm => ({
  brand: "",
  customBrand: "",
  model: "",
  storage: "128GB",
  customStorage: "",
  colour: "",
  imei1: "",
  condition: "Grade A",
  cost_price: "",
  selling_price: "",
  imei2: "",
  serial: "",
  network_status: "Unlocked",
  accessories: [],
  source_note: "",
  general_notes: "",
  seller_id: "",
  seller_name: "",
  seller_phone: "",
  seller_email: "",
  seller_address: "",
  purchase_date: todayISO(),
  payment_method: "CASH",
  purchase_notes: "",
});

type FormErrors = Partial<Record<keyof PhoneForm | "imei1_length" | "imei2_length", string>>;

// ─── Parser for Stored Notes ──────────────────────────────────────────────────

function parseStoredNotes(noteStr?: string | null) {
  const checks = initialDeviceChecks();
  let networkStatus = "Unlocked";
  const accessories: string[] = [];
  let sourceNote = "";
  let generalNotes = "";

  if (!noteStr) return { checks, networkStatus, accessories, sourceNote, generalNotes };

  const checksMatch = noteStr.match(/\[Checks:\s*([^\]]+)\]/);
  if (checksMatch) {
    const items = checksMatch[1].split(",");
    items.forEach((item) => {
      const [name, val] = item.split(":").map((s) => s.trim());
      if (!name || !val) return;
      const status: CheckStatus = val.toUpperCase() === "WORKING" ? "WORKING" : "NOT_WORKING";
      if (
        name.includes("Face") ||
        name.includes("Touch") ||
        name.includes("Fingerprint") ||
        name.includes("Biometrics")
      ) {
        checks.biometrics = status;
      } else if (name.includes("Screen")) checks.screen = status;
      else if (name.includes("Camera")) checks.cameras = status;
      else if (name.includes("Audio") || name.includes("Speaker") || name.includes("Mic")) {
        checks.audio = status;
      } else if (name.includes("Charging")) checks.charging = status;
      else if (name.includes("Button")) checks.buttons = status;
      else if (
        name.includes("Wi-Fi") ||
        name.includes("Connectivity") ||
        name.includes("Bluetooth")
      ) {
        checks.connectivity = status;
      } else if (name.includes("SIM") || name.includes("Network")) checks.network = status;
    });
  }

  const faultMatch = noteStr.match(/\[Faults:\s*([^\]]+)\]/);
  if (faultMatch) checks.faultNotes = faultMatch[1].trim();

  const batteryMatch = noteStr.match(/\[Battery:\s*(\d+)%?\]/);
  if (batteryMatch) checks.batteryHealth = batteryMatch[1];

  const netMatch = noteStr.match(/\[Network:\s*([^\]]+)\]/);
  if (netMatch) networkStatus = netMatch[1].trim();

  const accMatch = noteStr.match(/\[Accessories:\s*([^\]]+)\]/);
  if (accMatch) {
    accMatch[1].split(",").forEach((a) => {
      const trimmed = a.trim();
      if (trimmed) accessories.push(trimmed);
    });
  }

  const srcMatch = noteStr.match(/\[Source:\s*([^\]]+)\]/);
  if (srcMatch) sourceNote = srcMatch[1].trim();

  const notesMatch = noteStr.match(/\[Notes:\s*([^\]]+)\]/);
  if (notesMatch) generalNotes = notesMatch[1].trim();
  else if (!noteStr.includes("[")) generalNotes = noteStr.trim();

  return { checks, networkStatus, accessories, sourceNote, generalNotes };
}

// ─── Main Component ───────────────────────────────────────────────────────────

function AddPhoneToStockPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const editId = searchParams.editId;
  const isEditMode = Boolean(editId);

  const uid = useId();

  const [mode, setMode] = useState<StockEntryMode>("DIRECT");
  const [form, setForm] = useState<PhoneForm>(() => ({
    ...blankForm(),
    payment_method: getSavedPaymentMethod(),
  }));
  const [deviceChecks, setDeviceChecks] = useState<DeviceChecksState>(initialDeviceChecks);
  const [tempDeviceChecks, setTempDeviceChecks] = useState<DeviceChecksState>(initialDeviceChecks);
  const [checksModalError, setChecksModalError] = useState<string | null>(null);

  // Snapshot for dirty / unsaved changes checking
  const [initialSnapshot, setInitialSnapshot] = useState<{
    form: PhoneForm;
    checks: DeviceChecksState;
    mode: StockEntryMode;
  } | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [modelSearch, setModelSearch] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Modals
  const [checksModalOpen, setChecksModalOpen] = useState(false);
  const [optionalModalOpen, setOptionalModalOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<{
    id: string;
    invoice_number: string;
    phoneName: string;
    imeiEnding: string;
    selling_price_pence: number;
    stock_device_id?: string;
    mode: StockEntryMode;
  } | null>(null);
  const [preview, setPreview] = useState<{
    invoiceNumber: string;
    html80mm: string;
    htmlA4: string;
  } | null>(null);

  // Seller search state
  const [sellerSearch, setSellerSearch] = useState("");
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);

  // Refs for focusing first invalid element
  const brandRef = useRef<HTMLSelectElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const colourRef = useRef<HTMLInputElement>(null);
  const imei1Ref = useRef<HTMLInputElement>(null);
  const sellerNameRef = useRef<HTMLInputElement>(null);
  const sellerPhoneRef = useRef<HTMLInputElement>(null);

  const requestId = useRef<string | null>(null);
  const qc = useQueryClient();

  const internalStockFn = useServerFn(createInternalStockDevice);
  const stockFn = useServerFn(listCounterStock);
  const createFn = useServerFn(createPurchaseInvoice);
  const detailFn = useServerFn(getCounterInvoice);
  const getStockFn = useServerFn(getStockDevice);
  const updateStockFn = useServerFn(updateStockDevice);
  const suppliersFn = useServerFn(searchCounterSuppliers);

  // ─── Fetch Stock Item for Edit ─────────────────────────────────────────────
  const {
    data: existingStock,
    isLoading: isStockLoading,
    isError: isStockError,
    error: stockError,
    refetch: refetchStock,
  } = useQuery({
    queryKey: ["counter", "stock_device", editId],
    queryFn: () => getStockFn({ data: { id: editId! } }),
    enabled: isEditMode,
  });

  // Pre-fill existing stock item
  useEffect(() => {
    if (!existingStock) return;

    const entryMode: StockEntryMode = existingStock.purchase_invoice_id ? "SELLER" : "DIRECT";
    const brandIsPopular = (POPULAR_BRANDS as readonly string[]).includes(
      existingStock.device_make,
    );
    const storageIsStandard = (STORAGE_OPTIONS as readonly string[]).includes(
      existingStock.storage || "",
    );

    const parsedNotes = parseStoredNotes(
      existingStock.movement_note || existingStock.purchase_invoice?.seller_note,
    );

    const loadedForm: PhoneForm = {
      brand: brandIsPopular ? existingStock.device_make : "Other",
      customBrand: brandIsPopular ? "" : existingStock.device_make,
      model: existingStock.device_model,
      storage: storageIsStandard ? existingStock.storage || "128GB" : "Other",
      customStorage: storageIsStandard ? "" : existingStock.storage || "",
      colour: existingStock.colour || "",
      imei1: existingStock.imei || "",
      condition: existingStock.device_condition || "Grade A",
      cost_price: existingStock.purchase_price_pence
        ? (existingStock.purchase_price_pence / 100).toFixed(2)
        : "",
      selling_price: existingStock.expected_sale_price_pence
        ? (existingStock.expected_sale_price_pence / 100).toFixed(2)
        : "",
      imei2: "",
      serial: existingStock.serial || "",
      network_status: parsedNotes.networkStatus,
      accessories: parsedNotes.accessories,
      source_note: parsedNotes.sourceNote,
      general_notes: parsedNotes.generalNotes,
      seller_id: existingStock.purchase_invoice?.supplier_id || "",
      seller_name: existingStock.purchase_invoice?.supplier_name || "",
      seller_phone: existingStock.purchase_invoice?.supplier_phone || "",
      seller_email: existingStock.purchase_invoice?.supplier_email || "",
      seller_address: existingStock.purchase_invoice?.supplier_address || "",
      purchase_date: existingStock.purchase_invoice?.created_at
        ? existingStock.purchase_invoice.created_at.slice(0, 10)
        : todayISO(),
      payment_method: (existingStock.purchase_invoice?.payment_method as PayMethod) || "CASH",
      purchase_notes: "",
    };

    setMode(entryMode);
    setForm(loadedForm);
    setDeviceChecks(parsedNotes.checks);
    setTempDeviceChecks(parsedNotes.checks);
    setModelSearch(existingStock.device_model);

    setInitialSnapshot({
      form: loadedForm,
      checks: parsedNotes.checks,
      mode: entryMode,
    });
  }, [existingStock]);

  const isReadOnly =
    isEditMode &&
    Boolean(
      existingStock && (existingStock.status === "SOLD" || existingStock.status === "REMOVED"),
    );

  const isInvoiceLocked = isEditMode && Boolean(existingStock?.purchase_invoice_id);

  // ─── Unsaved Changes Detection ──────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!initialSnapshot) {
      if (!isEditMode) {
        return (
          Boolean(form.brand) ||
          Boolean(form.model) ||
          Boolean(form.imei1) ||
          Boolean(form.cost_price)
        );
      }
      return false;
    }
    return (
      JSON.stringify(form) !== JSON.stringify(initialSnapshot.form) ||
      JSON.stringify(deviceChecks) !== JSON.stringify(initialSnapshot.checks) ||
      mode !== initialSnapshot.mode
    );
  }, [form, deviceChecks, mode, initialSnapshot, isEditMode]);

  // Browser refresh / tab close unsaved changes prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !savedSuccess) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, savedSuccess]);

  const handleCancelOrNavigate = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      navigate({ to: isEditMode ? "/admin/stock" : "/admin" });
    }
  };

  // ─── IMEI duplicate checks (Excludes self during edit) ───────────────────────
  const cleanImei1 = form.imei1.replace(/[\s-]/g, "");
  const { data: stockForImei1 = [] } = useQuery({
    queryKey: ["counter", "stock", "check_imei1", cleanImei1],
    queryFn: () => stockFn({ data: { query: cleanImei1, status: "ALL" } }),
    enabled: cleanImei1.length >= 10,
    staleTime: 10_000,
  });

  const duplicateImei1 = stockForImei1.find(
    (s) =>
      s.imei && s.imei.replace(/[\s-]/g, "") === cleanImei1 && (!isEditMode || s.id !== editId),
  );

  const cleanImei2 = form.imei2.replace(/[\s-]/g, "");
  const { data: stockForImei2 = [] } = useQuery({
    queryKey: ["counter", "stock", "check_imei2", cleanImei2],
    queryFn: () => stockFn({ data: { query: cleanImei2, status: "ALL" } }),
    enabled: cleanImei2.length >= 10,
    staleTime: 10_000,
  });

  const duplicateImei2 =
    cleanImei2.length >= 10
      ? stockForImei2.find(
          (s) =>
            s.imei &&
            s.imei.replace(/[\s-]/g, "") === cleanImei2 &&
            (!isEditMode || s.id !== editId),
        )
      : undefined;

  // ─── Seller Search ─────────────────────────────────────────────────────────
  const { data: sellerMatches = [] } = useQuery({
    queryKey: ["counter", "suppliers", "search", sellerSearch],
    queryFn: () => suppliersFn({ data: { query: sellerSearch } }),
    enabled: sellerSearch.trim().length >= 2,
    staleTime: 15_000,
  });

  // ─── Pricing calculations ──────────────────────────────────────────────────
  const costPence = cents(form.cost_price || "0");
  const sellingPence = cents(form.selling_price || "0");
  const profitPence =
    Number.isFinite(sellingPence) && Number.isFinite(costPence) ? sellingPence - costPence : 0;
  const isLoss = Number.isFinite(profitPence) && profitPence < 0;
  const profitColor =
    profitPence > 0
      ? "text-emerald-700 font-black"
      : isLoss
        ? "text-red-600 font-black"
        : "text-slate-500 font-semibold";

  // ─── Model Autocomplete ────────────────────────────────────────────────────
  const filteredModels = useMemo(() => {
    const list = DEVICE_MODELS.filter((m) => {
      if (form.brand && form.brand !== "Other") {
        return inferBrand(m).toLowerCase() === form.brand.toLowerCase();
      }
      return true;
    });
    if (!modelSearch) return list.slice(0, 10);
    return list.filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase())).slice(0, 10);
  }, [form.brand, modelSearch]);

  // ─── Update helper ─────────────────────────────────────────────────────────
  const update = useCallback(
    <K extends keyof PhoneForm>(key: K, value: PhoneForm[K]) => {
      if (isReadOnly) return;
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [errors, isReadOnly],
  );

  const handleSelectModel = (m: string) => {
    if (isReadOnly || (isEditMode && isInvoiceLocked)) return;
    const inferred = inferBrand(m, form.brand);
    setForm((prev) => ({ ...prev, model: m, brand: inferred, customBrand: "" }));
    setModelSearch(m);
    setShowModelDropdown(false);
    setErrors((prev) => ({ ...prev, model: undefined }));
  };

  const handleSelectSeller = (party: PartySummary) => {
    if (isReadOnly || (isEditMode && isInvoiceLocked)) return;
    setForm((prev) => ({
      ...prev,
      seller_id: party.id,
      seller_name: party.name,
      seller_phone: party.phone,
    }));
    setSellerSearch(party.name);
    setShowSellerDropdown(false);
    setErrors((prev) => ({ ...prev, seller_name: undefined, seller_phone: undefined }));
  };

  const handleClearSeller = () => {
    if (isReadOnly || (isEditMode && isInvoiceLocked)) return;
    setForm((prev) => ({
      ...prev,
      seller_id: "",
      seller_name: "",
      seller_phone: "",
      seller_email: "",
      seller_address: "",
    }));
    setSellerSearch("");
  };

  const toggleAccessory = (acc: string) => {
    if (isReadOnly) return;
    setForm((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(acc)
        ? prev.accessories.filter((a) => a !== acc)
        : [...prev.accessories, acc],
    }));
  };

  // ─── Device checks status helper ───────────────────────────────────────────
  const checkStatusSummary = useMemo(() => {
    const totalFaults = CHECK_KEYS.filter((k) => deviceChecks[k] === "NOT_WORKING").length;
    const workingCount = CHECK_KEYS.filter((k) => deviceChecks[k] === "WORKING").length;
    const testedCount = CHECK_KEYS.filter(
      (k) => deviceChecks[k] === "WORKING" || deviceChecks[k] === "NOT_WORKING",
    ).length;

    if (totalFaults > 0) {
      return {
        label: `${totalFaults} fault${totalFaults > 1 ? "s" : ""} found`,
        color: "bg-red-50 text-red-700 border-red-200",
        faultCount: totalFaults,
      };
    }
    if (testedCount > 0 && workingCount === testedCount) {
      return {
        label: "All working",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        faultCount: 0,
      };
    }
    return {
      label: "Not checked",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      faultCount: 0,
    };
  }, [deviceChecks]);

  const isApple = form.brand.toLowerCase() === "apple";
  const biometricLabel = isApple ? "Face ID / Touch ID" : "Face Unlock / Fingerprint";

  const faultNames = useMemo(() => {
    const map: Record<string, string> = {
      biometrics: biometricLabel,
      screen: "Screen & Touch",
      cameras: "Cameras",
      audio: "Audio/Mic",
      charging: "Charging Port",
      buttons: "Physical Buttons",
      connectivity: "Wi-Fi/Bluetooth",
      network: "SIM & Network",
    };
    return CHECK_KEYS.filter((k) => deviceChecks[k] === "NOT_WORKING").map((k) => map[k]);
  }, [deviceChecks, biometricLabel]);

  const optionalCount = useMemo(() => {
    let count = 0;
    if (form.imei2) count++;
    if (form.serial) count++;
    if (form.network_status && form.network_status !== "Unlocked") count++;
    if (form.accessories.length > 0) count++;
    if (form.source_note) count++;
    if (form.general_notes) count++;
    return count;
  }, [form]);

  // ─── Field Validation (User-Facing Text Rules) ─────────────────────────────
  const validate = (): { errors: FormErrors; firstInvalidKey?: string } => {
    const errs: FormErrors = {};
    let firstInvalidKey: string | undefined;

    const recordError = (key: keyof FormErrors, msg: string) => {
      errs[key] = msg;
      if (!firstInvalidKey) firstInvalidKey = key;
    };

    if (mode === "SELLER" && !isEditMode) {
      if (!form.seller_name.trim()) {
        recordError("seller_name", "Seller name is required.");
      }
      if (!form.seller_phone.trim()) {
        recordError("seller_phone", "Seller phone number is required.");
      } else if (!/^[0-9+ ]{7,20}$/.test(form.seller_phone.trim())) {
        recordError("seller_phone", "Enter a valid phone number.");
      }
      if (!form.purchase_date) {
        recordError("purchase_date", "Purchase date is required.");
      }
      if (!form.payment_method) {
        recordError("payment_method", "Select a payment method.");
      }
    }

    const effectiveBrand = form.brand === "Other" ? form.customBrand.trim() : form.brand.trim();
    if (!effectiveBrand) {
      recordError("brand", "Brand is required.");
    }
    if (!form.model.trim()) {
      recordError("model", "Model is required.");
    }
    const effectiveStorage =
      form.storage === "Other" ? form.customStorage.trim() : form.storage.trim();
    if (!effectiveStorage) {
      recordError("storage", "Storage is required.");
    }
    if (!form.colour.trim()) {
      recordError("colour", "Colour is required.");
    }

    if (!cleanImei1) {
      recordError("imei1", "IMEI 1 is required.");
    } else if (cleanImei1.length !== 15) {
      recordError("imei1_length", "IMEI must contain exactly 15 digits.");
    } else if (duplicateImei1) {
      recordError("imei1", "This IMEI already belongs to another stock item.");
    }

    if (!form.condition) {
      recordError("condition", "Condition is required.");
    }

    if (!form.cost_price) {
      recordError("cost_price", "Purchase cost is required.");
    } else if (Number.isNaN(costPence)) {
      recordError("cost_price", "Enter a valid amount.");
    } else if (costPence < 0) {
      recordError("cost_price", "Price cannot be negative.");
    }

    if (!form.selling_price) {
      recordError("selling_price", "Selling price is required.");
    } else if (Number.isNaN(sellingPence)) {
      recordError("selling_price", "Enter a valid amount.");
    } else if (sellingPence < 0) {
      recordError("selling_price", "Price cannot be negative.");
    }

    if (cleanImei2 && cleanImei2.length !== 15) {
      recordError("imei2_length", "IMEI must contain exactly 15 digits.");
    }
    if (cleanImei2 && duplicateImei2) {
      recordError("imei2", "This IMEI already belongs to another stock item.");
    }

    return { errors: errs, firstInvalidKey };
  };

  // ─── Structured Note Builder ────────────────────────────────────────────────
  const buildPersistedNotes = () => {
    const checksList = CHECK_KEYS.map((k) => {
      const val = deviceChecks[k];
      if (val === "NOT_TESTED" || val === "NA") return null;
      const name = k === "biometrics" ? biometricLabel : k;
      return `${name}: ${val === "WORKING" ? "Working" : "FAULTY"}`;
    }).filter(Boolean);

    const parts = [
      checksList.length > 0 ? `[Checks: ${checksList.join(", ")}]` : "",
      deviceChecks.faultNotes.trim() ? `[Faults: ${deviceChecks.faultNotes.trim()}]` : "",
      deviceChecks.batteryHealth.trim() ? `[Battery: ${deviceChecks.batteryHealth.trim()}%]` : "",
      form.network_status ? `[Network: ${form.network_status}]` : "",
      form.accessories.length > 0 ? `[Accessories: ${form.accessories.join(", ")}]` : "",
      form.source_note.trim() ? `[Source: ${form.source_note.trim()}]` : "",
      form.purchase_notes.trim() ? `[Purchase Notes: ${form.purchase_notes.trim()}]` : "",
      form.general_notes.trim() ? `[Notes: ${form.general_notes.trim()}]` : "",
    ].filter(Boolean);

    return parts.join(" | ");
  };

  // ─── Save / Update Handlers ────────────────────────────────────────────────
  const handleSave = async (action: "save" | "add_another" | "print") => {
    if (isReadOnly || busy) return;

    // In Edit mode, if nothing was modified, show friendly informational notice
    if (isEditMode && !isDirty) {
      toast.info("No changes to save", {
        description: "Update a field before saving.",
      });
      return;
    }

    const { errors: errs, firstInvalidKey } = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Check the highlighted fields", {
        description: "Complete the required information before continuing.",
      });

      // Focus first invalid element
      if (firstInvalidKey === "seller_name") sellerNameRef.current?.focus();
      else if (firstInvalidKey === "seller_phone") sellerPhoneRef.current?.focus();
      else if (firstInvalidKey === "brand") brandRef.current?.focus();
      else if (firstInvalidKey === "model") modelRef.current?.focus();
      else if (firstInvalidKey === "colour") colourRef.current?.focus();
      else if (firstInvalidKey === "imei1" || firstInvalidKey === "imei1_length")
        imei1Ref.current?.focus();
      else if (firstInvalidKey === "cost_price") document.getElementById(`${uid}-cost`)?.focus();
      else if (firstInvalidKey === "selling_price") document.getElementById(`${uid}-sell`)?.focus();

      return;
    }

    requestId.current ??= crypto.randomUUID();
    setBusy(true);
    setBusyAction(action);

    const effectiveBrand = form.brand === "Other" ? form.customBrand.trim() : form.brand.trim();
    const effectiveStorage =
      form.storage === "Other" ? form.customStorage.trim() : form.storage.trim();
    const sanitizedImei1 = cleanImei1;
    const sanitizedImei2 = cleanImei2 || undefined;
    const persistedNote = buildPersistedNotes();

    try {
      if (isEditMode) {
        // ── UPDATE EXISTING STOCK ITEM ──
        await updateStockFn({
          data: {
            id: editId!,
            device_make: isInvoiceLocked ? undefined : effectiveBrand,
            device_model: isInvoiceLocked ? undefined : form.model.trim(),
            storage: isInvoiceLocked ? undefined : effectiveStorage,
            colour: isInvoiceLocked ? undefined : form.colour.trim(),
            imei: isInvoiceLocked ? undefined : sanitizedImei1,
            serial: isInvoiceLocked ? undefined : sanitizedImei2 || form.serial.trim() || null,
            device_condition: form.condition,
            purchase_price_pence: isInvoiceLocked ? undefined : costPence,
            expected_sale_price_pence: sellingPence,
            notes: persistedNote || null,
          },
        });

        // Clear dirty state
        setInitialSnapshot({
          form: { ...form },
          checks: { ...deviceChecks },
          mode,
        });

        toast.success("Stock item updated", {
          description: `Changes to ${effectiveBrand} ${form.model} have been saved.`,
        });
        await qc.invalidateQueries({ queryKey: ["counter"] });
        navigate({ to: "/admin/stock" });
        return;
      }

      // ── CREATE NEW STOCK ITEM: DIRECT ──
      if (mode === "DIRECT") {
        const stockResult = await internalStockFn({
          data: {
            device_make: effectiveBrand,
            device_model: form.model.trim(),
            storage: effectiveStorage,
            colour: form.colour.trim(),
            imei: sanitizedImei1,
            serial: sanitizedImei2 || form.serial.trim() || undefined,
            device_condition: form.condition,
            purchase_price_pence: costPence,
            expected_sale_price_pence: sellingPence,
            notes: persistedNote || undefined,
          },
        });

        // Clear dirty state
        setInitialSnapshot({
          form: { ...form },
          checks: { ...deviceChecks },
          mode,
        });

        requestId.current = null;
        await qc.invalidateQueries({ queryKey: ["counter"] });

        if (action === "add_another") {
          toast.success("Phone added to stock", {
            description: "The form is ready for another phone.",
          });
          setForm((prev) => ({
            ...blankForm(),
            brand: prev.brand,
            customBrand: prev.customBrand,
            condition: prev.condition,
            payment_method: prev.payment_method,
            purchase_date: prev.purchase_date,
          }));
          setDeviceChecks(initialDeviceChecks);
          setModelSearch("");
          setErrors({});
        } else {
          toast.success("Phone added to stock", {
            description: `${effectiveBrand} ${form.model} has been added successfully.`,
            action: {
              label: "View Stock",
              onClick: () => navigate({ to: "/admin/stock" }),
            },
          });
          setSavedSuccess({
            id: stockResult.id,
            invoice_number: stockResult.sku,
            phoneName: `${effectiveBrand} ${form.model} (${effectiveStorage} · ${form.colour})`,
            imeiEnding: sanitizedImei1.slice(-5),
            selling_price_pence: sellingPence,
            stock_device_id: stockResult.stock_device_id,
            mode: "DIRECT",
          });
        }
      } else {
        // ── CREATE NEW STOCK ITEM: SELLER ──
        const result = await createFn({
          data: {
            request_id: requestId.current,
            supplier_id: form.seller_id || undefined,
            supplier_name: form.seller_name.trim(),
            supplier_phone: form.seller_phone.trim(),
            supplier_email: form.seller_email.trim() || undefined,
            supplier_address: form.seller_address.trim() || undefined,
            purchase_date: form.purchase_date || undefined,
            id_reference: undefined,
            seller_note: persistedNote || undefined,
            device_make: effectiveBrand,
            device_model: form.model.trim(),
            storage: effectiveStorage,
            colour: form.colour.trim(),
            imei: sanitizedImei1,
            serial: sanitizedImei2 || form.serial.trim() || undefined,
            device_condition: form.condition,
            battery_health: deviceChecks.batteryHealth.trim() || undefined,
            network_status: form.network_status || undefined,
            accessories: form.accessories.join(", ") || undefined,
            purchase_price_pence: costPence,
            paid_pence: costPence,
            expected_sale_price_pence: sellingPence,
            payment_method: form.payment_method,
          },
        });

        // Clear dirty state
        setInitialSnapshot({
          form: { ...form },
          checks: { ...deviceChecks },
          mode,
        });

        requestId.current = null;
        await qc.invalidateQueries({ queryKey: ["counter"] });

        const successData = {
          id: result.id,
          invoice_number: result.invoice_number,
          phoneName: `${effectiveBrand} ${form.model} (${effectiveStorage} · ${form.colour})`,
          imeiEnding: sanitizedImei1.slice(-5),
          selling_price_pence: sellingPence,
          stock_device_id: result.stock_device_id || undefined,
          mode: "SELLER" as const,
        };

        if (action === "add_another") {
          toast.success("Purchase saved", {
            description: `Purchase invoice ${result.invoice_number} was created and the phone was added to stock.`,
          });
          setForm((prev) => ({
            ...blankForm(),
            brand: prev.brand,
            customBrand: prev.customBrand,
            condition: prev.condition,
            payment_method: prev.payment_method,
            purchase_date: prev.purchase_date,
            seller_id: prev.seller_id,
            seller_name: prev.seller_name,
            seller_phone: prev.seller_phone,
            seller_email: prev.seller_email,
            seller_address: prev.seller_address,
          }));
          setDeviceChecks(initialDeviceChecks);
          setModelSearch("");
          setErrors({});
          return;
        }

        if (action === "print") {
          toast.success("Purchase saved", {
            description: `Invoice ${result.invoice_number} is ready to print.`,
            action: {
              label: "View Invoice",
              onClick: () => navigate({ to: "/admin/invoices" }),
            },
          });
          setSavedSuccess(successData);

          try {
            const detail = await detailFn({
              data: { kind: "PURCHASE", id: result.id },
            });
            setPreview({
              invoiceNumber: result.invoice_number,
              html80mm: buildCounterInvoiceHtml("PURCHASE", detail, "80MM"),
              htmlA4: buildCounterInvoiceHtml("PURCHASE", detail, "A4"),
            });
          } catch (printErr) {
            logCounterError("openPrintPreview", printErr, { invoiceId: result.id });
            toast.error("Purchase saved, but preview could not open", {
              description: `Invoice ${result.invoice_number} was created successfully. Open it from Invoice History to print.`,
              action: {
                label: "View Invoices",
                onClick: () => navigate({ to: "/admin/invoices" }),
              },
            });
          }
        } else {
          toast.success("Purchase saved", {
            description: `Purchase invoice ${result.invoice_number} was created and the phone was added to stock.`,
            action: {
              label: "View Invoice",
              onClick: () => navigate({ to: "/admin/invoices" }),
            },
          });
          setSavedSuccess(successData);
        }
      }
    } catch (error) {
      logCounterError(isEditMode ? "updateStock" : "createStock", error, {
        mode,
        stockId: editId,
      });
      const friendly = mapCounterError(error, {
        operation: isEditMode ? "updateStock" : "createPurchase",
        stockId: editId,
      });

      if (friendly.isWarning) {
        toast.warning(friendly.title, { description: friendly.description });
      } else {
        toast.error(friendly.title, {
          description: friendly.description,
          action: friendly.actionLabel
            ? {
                label: friendly.actionLabel,
                onClick: () => {
                  if (friendly.actionHref) {
                    window.location.href = friendly.actionHref;
                  } else if (friendly.actionType === "RELOAD") {
                    window.location.reload();
                  }
                },
              }
            : undefined,
        });
      }
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  // ─── Loading / Error States for Edit Record ───────────────────────────────
  if (isEditMode) {
    if (isStockLoading) {
      return (
        <div className="py-12 max-w-xl mx-auto space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-slate-200 rounded" />
            <div className="h-6 w-48 bg-slate-200 rounded" />
          </div>
          <div className="h-12 bg-slate-200 rounded-xl" />
          <div className="h-44 bg-slate-200 rounded-xl" />
          <div className="h-44 bg-slate-200 rounded-xl" />
          <p className="text-center text-[12px] font-semibold text-slate-400">
            Loading phone stock details…
          </p>
        </div>
      );
    }
    if (isStockError || !existingStock) {
      const friendlyErr = mapCounterError(stockError, {
        operation: "getStockDevice",
        stockId: editId,
      });
      return (
        <div className="py-12 max-w-md mx-auto text-center space-y-4 animate-in fade-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-black text-slate-900">{friendlyErr.title}</h2>
            <p className="text-[13px] text-slate-500 mt-1">{friendlyErr.description}</p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/admin/stock"
              className="rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
            >
              Return to Phone Stock
            </Link>
            <button
              type="button"
              onClick={() => refetchStock()}
              className="rounded-lg bg-[var(--kimi-accent)] px-4 py-2 text-[13px] font-bold text-white hover:bg-[var(--kimi-accent-hover)]"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
  }

  // ─── Success Screen (Create Mode) ──────────────────────────────────────────
  if (savedSuccess) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-lg rounded-xl border border-emerald-200 bg-white p-6 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-[20px] font-black text-slate-900">
              {savedSuccess.mode === "DIRECT" ? "Phone Added to Stock" : "Purchase Saved"}
            </h2>
            <p className="mt-1 text-[14px] font-bold text-slate-800">{savedSuccess.phoneName}</p>
            <p className="text-[12px] text-slate-500 font-mono mt-0.5">
              Ref: {savedSuccess.invoice_number} · IMEI ending …{savedSuccess.imeiEnding}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Selling Price
            </p>
            <p className="text-[24px] font-black text-emerald-700 tabular-nums">
              {formatPence(savedSuccess.selling_price_pence)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <Link
              to="/admin/sell"
              className="flex items-center justify-center gap-2 rounded-lg bg-[var(--kimi-accent)] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[var(--kimi-accent-hover)] transition-colors min-h-[44px]"
            >
              <ShoppingBag className="h-4 w-4" />
              Sell Phone Now
            </Link>
            <button
              type="button"
              onClick={() => {
                setSavedSuccess(null);
                setForm({ ...blankForm(), payment_method: getSavedPaymentMethod() });
                setDeviceChecks(initialDeviceChecks);
                setModelSearch("");
                setErrors({});
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-800 hover:bg-slate-50 transition-colors min-h-[44px]"
            >
              <PackagePlus className="h-4 w-4" />
              Add Another Phone
            </button>
          </div>

          {savedSuccess.mode === "SELLER" && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const detail = await detailFn({
                    data: { kind: "PURCHASE", id: savedSuccess.id },
                  });
                  setPreview({
                    invoiceNumber: savedSuccess.invoice_number,
                    html80mm: buildCounterInvoiceHtml("PURCHASE", detail, "80MM"),
                    htmlA4: buildCounterInvoiceHtml("PURCHASE", detail, "A4"),
                  });
                } catch {
                  toast.error("Preview could not open", {
                    description:
                      "Invoice is saved in Invoice History and can be printed from there.",
                  });
                }
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full min-h-[40px]"
            >
              <Printer className="h-4 w-4" />
              Print Purchase Invoice
            </button>
          )}

          <div className="pt-1">
            <Link
              to="/admin"
              className="text-[13px] font-semibold text-[var(--kimi-accent)] hover:underline"
            >
              Return to Counter →
            </Link>
          </div>
        </div>

        {preview && (
          <PrintPreviewModal
            open
            onClose={() => setPreview(null)}
            kind="PURCHASE"
            invoiceNumber={preview.invoiceNumber}
            html80mm={preview.html80mm}
            htmlA4={preview.htmlA4}
          />
        )}
      </div>
    );
  }

  // ─── Derived display values ────────────────────────────────────────────────
  const effectiveBrand = form.brand === "Other" ? form.customBrand.trim() : form.brand.trim();
  const effectiveStorage =
    form.storage === "Other" ? form.customStorage.trim() : form.storage.trim();
  const hasPhoneDetails = Boolean(effectiveBrand && form.model.trim());
  const imei1Digits = cleanImei1.length;
  const imei1Complete = imei1Digits === 15;

  return (
    <div className="space-y-3.5 max-w-[1360px] mx-auto">
      {/* ── Compact Header Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCancelOrNavigate}
            disabled={busy}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-black text-slate-900 tracking-tight leading-none">
                {isEditMode ? "Edit Phone Stock" : "Add a Phone to Stock"}
              </h1>
              {isEditMode && existingStock && (
                <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  SKU: STK-{existingStock.id.substring(0, 8).toUpperCase()}
                </span>
              )}
              {isEditMode && existingStock && <StatusBadge status={existingStock.status} />}
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {isEditMode
                ? "Update the phone’s stock details."
                : "Enter phone details, purchase cost and selling price."}
            </p>
          </div>
        </div>
        <Link
          to="/admin/stock"
          className="text-[12px] font-bold text-[var(--kimi-accent)] hover:underline flex items-center gap-1 shrink-0"
        >
          <Package className="h-3.5 w-3.5" /> View Phone Stock
        </Link>
      </div>

      {/* ── Status Banners for Read-Only or Invoice-Locked items ────────────── */}
      {isReadOnly && existingStock && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-[13px] font-bold text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              {existingStock.status === "SOLD"
                ? "This phone has already been sold. Sold stock records are read-only."
                : "This stock item cannot be edited. Removed and voided stock records are read-only."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {existingStock.sale_invoice && (
              <Link
                to="/admin/invoices"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--kimi-accent)] bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5" /> Sale {existingStock.sale_invoice.invoice_number}
              </Link>
            )}
            {existingStock.purchase_invoice && (
              <Link
                to="/admin/invoices"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5" /> Purchase{" "}
                {existingStock.purchase_invoice.invoice_number}
              </Link>
            )}
          </div>
        </div>
      )}

      {isEditMode && isInvoiceLocked && !isReadOnly && existingStock?.purchase_invoice && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px] font-medium text-blue-950">
            <Lock className="h-4 w-4 text-blue-700 shrink-0" />
            <span>
              This information belongs to purchase invoice{" "}
              <strong>{existingStock.purchase_invoice.invoice_number}</strong> and core purchase
              facts cannot be changed from stock editing.
            </span>
          </div>
          <Link
            to="/admin/invoices"
            className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--kimi-accent)] bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-50 shrink-0"
          >
            <Eye className="h-3.5 w-3.5" /> View Purchase Invoice
          </Link>
        </div>
      )}

      {/* ── Entry Mode Selector (Disabled in Edit Mode) ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {(
          [
            {
              value: "DIRECT",
              icon: Package,
              label: "Direct Stock Entry",
              desc: "Fast inventory addition without seller info.",
            },
            {
              value: "SELLER",
              icon: User,
              label: "Bought from Seller",
              desc: "Record seller, purchase invoice & add to stock.",
            },
          ] as const
        ).map(({ value, icon: Icon, label, desc }) => {
          const selected = mode === value;
          const disabled = isEditMode || busy;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => setMode(value)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all min-h-[52px]",
                selected
                  ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent-bg)] ring-1 ring-[var(--kimi-accent)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70",
                disabled && !selected && "opacity-40 cursor-not-allowed",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px]",
                  selected ? "bg-[var(--kimi-accent)] text-white" : "bg-slate-100 text-slate-500",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      "text-[13px] font-bold truncate",
                      selected ? "text-[var(--kimi-accent)]" : "text-slate-800",
                    )}
                  >
                    {label}
                  </p>
                  {selected && (
                    <Check className="h-3.5 w-3.5 text-[var(--kimi-accent)] shrink-0 ml-1" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Compact 2-Column Desktop Grid ─────────────────────────────── */}
      <div className="grid gap-3.5 lg:grid-cols-[1fr_320px] items-start">
        {/* Left Column: Form Cards */}
        <div className="space-y-3">
          {/* ── Seller Details (SELLER mode only) ────────────────────────── */}
          {mode === "SELLER" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  {isInvoiceLocked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                  Seller Information {isInvoiceLocked && "(Locked)"}
                </h2>
                {form.seller_id && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="h-3 w-3" /> Existing Seller Linked
                  </span>
                )}
              </div>

              {/* Seller search + 3-column details row */}
              <div className="grid gap-2.5 sm:grid-cols-3">
                {/* Search */}
                <div className="relative">
                  <label
                    htmlFor={`${uid}-seller-search`}
                    className="mb-1 block text-[12px] font-semibold text-slate-700"
                  >
                    Find Seller <span className="font-normal text-slate-400">· Name/Phone</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                      id={`${uid}-seller-search`}
                      type="text"
                      disabled={isReadOnly || isInvoiceLocked || busy}
                      value={sellerSearch}
                      placeholder={isInvoiceLocked ? "Locked to invoice" : "Search existing…"}
                      onFocus={() => setShowSellerDropdown(true)}
                      onChange={(e) => {
                        setSellerSearch(e.target.value);
                        setShowSellerDropdown(true);
                      }}
                      onBlur={() => setTimeout(() => setShowSellerDropdown(false), 150)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-[13px] disabled:bg-slate-50 disabled:text-slate-500 focus:border-[var(--kimi-accent)] focus:outline-none"
                    />
                    {form.seller_id && !isInvoiceLocked && (
                      <button
                        type="button"
                        onClick={handleClearSeller}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {showSellerDropdown && !isInvoiceLocked && sellerMatches.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {sellerMatches.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={() => handleSelectSeller(s)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] hover:bg-blue-50"
                        >
                          <span className="font-semibold text-slate-800">{s.name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{s.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seller Name */}
                <div>
                  <label
                    htmlFor={`${uid}-seller-name`}
                    className="mb-1 block text-[12px] font-semibold text-slate-700"
                  >
                    Seller Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={sellerNameRef}
                    id={`${uid}-seller-name`}
                    type="text"
                    required
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.seller_name}
                    placeholder="Full name"
                    aria-invalid={Boolean(errors.seller_name)}
                    aria-describedby={errors.seller_name ? `${uid}-seller-name-err` : undefined}
                    onChange={(e) => update("seller_name", e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-white px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none",
                      errors.seller_name
                        ? "border-red-400 bg-red-50/20"
                        : "border-slate-200 focus:border-[var(--kimi-accent)]",
                    )}
                  />
                  {errors.seller_name && (
                    <InlineError id={`${uid}-seller-name-err`} message={errors.seller_name} />
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor={`${uid}-seller-phone`}
                    className="mb-1 block text-[12px] font-semibold text-slate-700"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={sellerPhoneRef}
                    id={`${uid}-seller-phone`}
                    type="tel"
                    required
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.seller_phone}
                    placeholder="e.g. 07700 900123"
                    aria-invalid={Boolean(errors.seller_phone)}
                    aria-describedby={errors.seller_phone ? `${uid}-seller-phone-err` : undefined}
                    onChange={(e) => update("seller_phone", e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-white px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none",
                      errors.seller_phone
                        ? "border-red-400 bg-red-50/20"
                        : "border-slate-200 focus:border-[var(--kimi-accent)]",
                    )}
                  />
                  {errors.seller_phone && (
                    <InlineError id={`${uid}-seller-phone-err`} message={errors.seller_phone} />
                  )}
                </div>
              </div>

              {/* Second Row: Date, Email/Address, Payment */}
              <div className="grid gap-2.5 sm:grid-cols-3 pt-1">
                <div>
                  <label
                    htmlFor={`${uid}-purchase-date`}
                    className="mb-1 block text-[12px] font-semibold text-slate-700"
                  >
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${uid}-purchase-date`}
                    type="date"
                    required
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.purchase_date}
                    aria-invalid={Boolean(errors.purchase_date)}
                    aria-describedby={errors.purchase_date ? `${uid}-purchase-date-err` : undefined}
                    onChange={(e) => update("purchase_date", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-600 focus:border-[var(--kimi-accent)] focus:outline-none"
                  />
                  {errors.purchase_date && (
                    <InlineError id={`${uid}-purchase-date-err`} message={errors.purchase_date} />
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-seller-email`}
                    className="mb-1 block text-[12px] font-semibold text-slate-700"
                  >
                    Email <span className="font-normal text-slate-400">· Optional</span>
                  </label>
                  <input
                    id={`${uid}-seller-email`}
                    type="email"
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.seller_email}
                    placeholder="seller@example.com"
                    onChange={(e) => update("seller_email", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-600 focus:border-[var(--kimi-accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-payment-method`}
                    className="mb-1 block text-[12px] font-semibold text-slate-700"
                  >
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${uid}-payment-method`}
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.payment_method}
                    onChange={(e) => update("payment_method", e.target.value as PayMethod)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:border-[var(--kimi-accent)] focus:outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Essential Phone Details (Compact 3-Column Rows) ────────────── */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                {isInvoiceLocked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                Phone Details &amp; Pricing
              </h2>
              <div className="flex items-center gap-2">
                {/* Device Checks button with live badge */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setTempDeviceChecks({ ...deviceChecks });
                    setChecksModalError(null);
                    setChecksModalOpen(true);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-bold transition-all",
                    checkStatusSummary.color,
                  )}
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  <span>Checks: {checkStatusSummary.label}</span>
                </button>

                {/* Additional Details button */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setOptionalModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <SlidersHorizontal className="h-3 w-3 text-slate-500" />
                  <span>Details {optionalCount > 0 && `(${optionalCount})`}</span>
                </button>
              </div>
            </div>

            {/* Row 1 (3-col): Brand, Model, Storage */}
            <div className="grid gap-2.5 sm:grid-cols-3">
              {/* Brand Selector */}
              <div>
                <label
                  htmlFor={`${uid}-brand`}
                  className="mb-1 block text-[12px] font-semibold text-slate-700"
                >
                  Brand <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1 overflow-x-auto pb-0.5">
                  <select
                    ref={brandRef}
                    id={`${uid}-brand`}
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.brand}
                    aria-invalid={Boolean(errors.brand)}
                    aria-describedby={errors.brand ? `${uid}-brand-err` : undefined}
                    onChange={(e) => {
                      update("brand", e.target.value);
                      if (e.target.value !== "Other") update("customBrand", "");
                    }}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-white px-2.5 text-[13px] font-semibold disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none",
                      errors.brand
                        ? "border-red-400 bg-red-50/20"
                        : "border-slate-200 focus:border-[var(--kimi-accent)]",
                    )}
                  >
                    <option value="">Select Brand…</option>
                    {POPULAR_BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                {form.brand === "Other" && (
                  <input
                    type="text"
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.customBrand}
                    placeholder="Enter brand"
                    onChange={(e) => update("customBrand", e.target.value)}
                    className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[12px] disabled:bg-slate-50"
                  />
                )}
                {errors.brand && <InlineError id={`${uid}-brand-err`} message={errors.brand} />}
              </div>

              {/* Model Input */}
              <div className="relative">
                <label
                  htmlFor={`${uid}-model`}
                  className="mb-1 block text-[12px] font-semibold text-slate-700"
                >
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  ref={modelRef}
                  id={`${uid}-model`}
                  type="text"
                  disabled={isReadOnly || isInvoiceLocked || busy}
                  value={form.model}
                  placeholder="e.g. iPhone 15 Pro…"
                  aria-invalid={Boolean(errors.model)}
                  aria-describedby={errors.model ? `${uid}-model-err` : undefined}
                  onFocus={() => setShowModelDropdown(true)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModelSearch(val);
                    const inferred = inferBrand(val, form.brand);
                    setForm((prev) => ({ ...prev, model: val, brand: inferred }));
                    setShowModelDropdown(true);
                    setErrors((prev) => ({ ...prev, model: undefined }));
                  }}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-white px-3 text-[13px] font-semibold disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none",
                    errors.model
                      ? "border-red-400 bg-red-50/20"
                      : "border-slate-200 focus:border-[var(--kimi-accent)]",
                  )}
                />
                {showModelDropdown && !isInvoiceLocked && filteredModels.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                    {filteredModels.map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => handleSelectModel(m)}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[12px] font-medium hover:bg-blue-50"
                      >
                        <span>{m}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {inferBrand(m)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {errors.model && <InlineError id={`${uid}-model-err`} message={errors.model} />}
              </div>

              {/* Storage */}
              <div>
                <label
                  htmlFor={`${uid}-storage`}
                  className="mb-1 block text-[12px] font-semibold text-slate-700"
                >
                  Storage <span className="text-red-500">*</span>
                </label>
                <select
                  id={`${uid}-storage`}
                  disabled={isReadOnly || isInvoiceLocked || busy}
                  value={form.storage}
                  onChange={(e) => update("storage", e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-semibold disabled:bg-slate-50 disabled:text-slate-600 focus:border-[var(--kimi-accent)] focus:outline-none"
                >
                  {STORAGE_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {form.storage === "Other" && (
                  <input
                    type="text"
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.customStorage}
                    placeholder="e.g. 128GB"
                    onChange={(e) => update("customStorage", e.target.value)}
                    className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[12px] disabled:bg-slate-50"
                  />
                )}
              </div>
            </div>

            {/* Row 2 (3-col): Colour, IMEI 1, Condition */}
            <div className="grid gap-2.5 sm:grid-cols-3">
              {/* Colour */}
              <div>
                <label
                  htmlFor={`${uid}-colour`}
                  className="mb-1 block text-[12px] font-semibold text-slate-700"
                >
                  Colour <span className="text-red-500">*</span>
                </label>
                <input
                  ref={colourRef}
                  id={`${uid}-colour`}
                  type="text"
                  disabled={isReadOnly || isInvoiceLocked || busy}
                  value={form.colour}
                  placeholder="e.g. Black, Titanium…"
                  aria-invalid={Boolean(errors.colour)}
                  aria-describedby={errors.colour ? `${uid}-colour-err` : undefined}
                  onChange={(e) => update("colour", e.target.value)}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-white px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none",
                    errors.colour
                      ? "border-red-400 bg-red-50/20"
                      : "border-slate-200 focus:border-[var(--kimi-accent)]",
                  )}
                />
                {errors.colour && <InlineError id={`${uid}-colour-err`} message={errors.colour} />}
              </div>

              {/* IMEI 1 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor={`${uid}-imei1`}
                    className="text-[12px] font-semibold text-slate-700"
                  >
                    IMEI 1 <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={cn(
                      "text-[11px] font-mono font-semibold",
                      imei1Complete
                        ? "text-emerald-600"
                        : imei1Digits > 0
                          ? "text-slate-500"
                          : "text-slate-400",
                    )}
                  >
                    {imei1Digits > 0
                      ? imei1Complete
                        ? "15 / 15 ✓"
                        : `${imei1Digits} / 15`
                      : "0 / 15"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    ref={imei1Ref}
                    id={`${uid}-imei1`}
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    disabled={isReadOnly || isInvoiceLocked || busy}
                    value={form.imei1}
                    placeholder="15-digit IMEI"
                    aria-invalid={Boolean(duplicateImei1 || errors.imei1 || errors.imei1_length)}
                    aria-describedby={
                      duplicateImei1 || errors.imei1 || errors.imei1_length
                        ? `${uid}-imei1-err`
                        : undefined
                    }
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[\s-]/g, "").replace(/\D/g, "");
                      update("imei1", cleaned.slice(0, 15));
                      setErrors((prev) => ({
                        ...prev,
                        imei1: undefined,
                        imei1_length: undefined,
                      }));
                    }}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-white px-3 pr-8 font-mono text-[13px] tracking-wider disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none",
                      duplicateImei1 || errors.imei1 || errors.imei1_length
                        ? "border-red-500 text-red-900 bg-red-50/20"
                        : imei1Complete
                          ? "border-emerald-400 focus:border-emerald-500"
                          : "border-slate-200 focus:border-[var(--kimi-accent)]",
                    )}
                  />
                  <Barcode className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                {duplicateImei1 && (
                  <p
                    id={`${uid}-imei1-err`}
                    className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" /> This IMEI already belongs to another stock
                    item.
                  </p>
                )}
                {!duplicateImei1 && (errors.imei1 || errors.imei1_length) && (
                  <InlineError
                    id={`${uid}-imei1-err`}
                    message={errors.imei1 || errors.imei1_length || ""}
                  />
                )}
              </div>

              {/* Condition (Editable for both Direct & Seller) */}
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-slate-700">
                  Condition <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {CONDITION_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      disabled={isReadOnly || busy}
                      onClick={() => update("condition", c.value)}
                      aria-pressed={form.condition === c.value}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border py-1 px-1 text-center transition-all h-10",
                        form.condition === c.value
                          ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent)] text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        (isReadOnly || busy) && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <span className="text-[11px] font-bold leading-tight">{c.label}</span>
                      <span
                        className={cn(
                          "text-[9px] leading-none",
                          form.condition === c.value ? "text-white/80" : "text-slate-400",
                        )}
                      >
                        {c.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3 (3-col): Purchase Cost, Selling Price, Expected Profit */}
            <div className="grid gap-2.5 sm:grid-cols-3 pt-1 border-t border-slate-100">
              <div>
                <MoneyInput
                  id={`${uid}-cost`}
                  label="Purchase Cost"
                  value={form.cost_price}
                  disabled={isReadOnly || isInvoiceLocked || busy}
                  onChange={(v) => update("cost_price", v)}
                  required
                  placeholder="0.00"
                  error={errors.cost_price}
                />
              </div>

              <div>
                <MoneyInput
                  id={`${uid}-sell`}
                  label="Selling Price"
                  value={form.selling_price}
                  disabled={isReadOnly || busy}
                  onChange={(v) => update("selling_price", v)}
                  required
                  placeholder="0.00"
                  error={errors.selling_price}
                />
                {isLoss && !errors.selling_price && (
                  <p className="mt-1 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-600" /> Selling price is below the
                    purchase cost.
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1 text-[12px] font-semibold text-slate-700">Expected Profit</p>
                <div
                  className={cn(
                    "flex h-10 items-center rounded-lg border px-3",
                    profitPence > 0
                      ? "border-emerald-200 bg-emerald-50/70"
                      : profitPence < 0
                        ? "border-red-200 bg-red-50/70"
                        : "border-slate-200 bg-slate-50",
                  )}
                >
                  <span className={cn("text-[15px] tabular-nums", profitColor)}>
                    {form.cost_price && form.selling_price ? formatPence(profitPence) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Phone Summary & Save Buttons */}
        <div className="space-y-3 lg:sticky lg:top-18">
          {/* Summary Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Phone Summary
            </h3>

            {hasPhoneDetails ? (
              <>
                <div>
                  <p className="text-[15px] font-black text-slate-900 leading-tight">
                    {effectiveBrand} {form.model}
                  </p>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {[effectiveStorage, form.colour, form.condition].filter(Boolean).join(" · ")}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                    IMEI: {cleanImei1 ? `••••${cleanImei1.slice(-5)}` : "Not entered"}
                  </p>
                </div>

                {/* Biometrics & Identified Faults Summary */}
                <div className="border-t border-slate-100 pt-2 space-y-1 text-[12px]">
                  {deviceChecks.biometrics !== "NOT_TESTED" && deviceChecks.biometrics !== "NA" && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{biometricLabel}:</span>
                      <span
                        className={cn(
                          "font-bold",
                          deviceChecks.biometrics === "WORKING"
                            ? "text-emerald-700"
                            : "text-red-600",
                        )}
                      >
                        {deviceChecks.biometrics === "WORKING" ? "Working" : "Faulty"}
                      </span>
                    </div>
                  )}

                  {faultNames.length > 0 && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-1.5 text-[11px] text-red-800">
                      <span className="font-bold">Faults: </span>
                      <span>{faultNames.join(", ")}</span>
                    </div>
                  )}

                  {deviceChecks.batteryHealth && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Battery Health:</span>
                      <span className="font-semibold text-slate-800">
                        {deviceChecks.batteryHealth}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Financials breakdown */}
                <div className="border-t border-slate-100 pt-2 space-y-1 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost:</span>
                    <span className="font-semibold text-slate-900">
                      {form.cost_price ? formatPence(costPence) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selling Price:</span>
                    <span className="font-bold text-emerald-700">
                      {form.selling_price ? formatPence(sellingPence) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-100 pt-1">
                    <span className="text-slate-700">Expected Profit:</span>
                    <span className={profitColor}>
                      {form.cost_price && form.selling_price ? formatPence(profitPence) : "—"}
                    </span>
                  </div>
                </div>

                {mode === "SELLER" && form.seller_name && (
                  <div className="border-t border-slate-100 pt-2 space-y-1 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seller:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                        {form.seller_name}
                      </span>
                    </div>
                    {form.seller_phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-mono text-[11px] text-slate-700">
                          {form.seller_phone}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment:</span>
                      <span className="font-semibold text-slate-800">
                        {form.payment_method.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[12px] text-slate-400 italic py-2">
                Enter phone details to preview summary.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {isReadOnly ? (
              <button
                type="button"
                onClick={() => navigate({ to: "/admin/stock" })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-slate-800 transition-colors min-h-[44px]"
              >
                Return to Phone Stock
              </button>
            ) : isEditMode ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSave("save")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--kimi-accent)] px-4 py-2.5 text-[13px] font-bold text-white shadow-xs hover:bg-[var(--kimi-accent-hover)] transition-all disabled:opacity-50 min-h-[44px]"
                >
                  {busy ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving Changes…</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCancelOrNavigate}
                  className="inline-flex w-full items-center justify-center text-[12px] font-semibold text-slate-500 hover:text-slate-800 py-1 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : mode === "DIRECT" ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSave("save")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--kimi-accent)] px-4 py-2.5 text-[13px] font-bold text-white shadow-xs hover:bg-[var(--kimi-accent-hover)] transition-all disabled:opacity-50 min-h-[44px]"
                >
                  {busy && busyAction === "save" ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving Phone…</span>
                    </>
                  ) : (
                    "Save Phone"
                  )}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSave("add_another")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 min-h-[40px]"
                >
                  {busy && busyAction === "add_another" ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <PackagePlus className="h-3.5 w-3.5" />
                      Save &amp; Add Another
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCancelOrNavigate}
                  className="inline-flex w-full items-center justify-center text-[12px] font-semibold text-slate-400 hover:text-slate-700 py-1 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSave("print")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--kimi-accent)] px-4 py-2.5 text-[13px] font-bold text-white shadow-xs hover:bg-[var(--kimi-accent-hover)] transition-all disabled:opacity-50 min-h-[44px]"
                >
                  {busy && busyAction === "print" ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Creating Invoice…</span>
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4" />
                      Save &amp; Print Purchase Invoice
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSave("save")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 min-h-[40px]"
                >
                  {busy && busyAction === "save" ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                      <span>Saving Purchase…</span>
                    </>
                  ) : (
                    "Save Purchase"
                  )}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCancelOrNavigate}
                  className="inline-flex w-full items-center justify-center text-[12px] font-semibold text-slate-400 hover:text-slate-700 py-1 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Device Checks Modal ────────────────────────────────────────────── */}
      {checksModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-checks-title`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3
                  id={`${uid}-checks-title`}
                  className="text-[16px] font-black text-slate-900 flex items-center gap-2"
                >
                  <ClipboardCheck className="h-5 w-5 text-[var(--kimi-accent)]" />
                  Device Inspection &amp; Component Checks
                </h3>
                <p className="text-[12px] text-slate-500">
                  Select component status (Working, Not Working, Not Tested, N/A).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChecksModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {checksModalError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-2.5 text-[12px] font-semibold text-red-800 border border-red-200 flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{checksModalError}</span>
              </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2.5">
              {(
                [
                  { key: "biometrics", label: biometricLabel },
                  { key: "screen", label: "Screen & Touch" },
                  { key: "cameras", label: "Cameras" },
                  { key: "audio", label: "Speaker & Microphone" },
                  { key: "charging", label: "Charging Port" },
                  { key: "buttons", label: "Physical Buttons" },
                  { key: "connectivity", label: "Wi-Fi & Bluetooth" },
                  { key: "network", label: "SIM & Network" },
                ] as const
              ).map(({ key, label }) => {
                const current = tempDeviceChecks[key];
                return (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <span className="text-[13px] font-bold text-slate-800 sm:w-48 shrink-0">
                      {label}
                    </span>

                    {/* Radio Group Buttons */}
                    <div className="flex flex-wrap gap-1">
                      {(
                        [
                          { value: "WORKING", label: "Working" },
                          { value: "NOT_WORKING", label: "Not Working" },
                          { value: "NOT_TESTED", label: "Not Tested" },
                          { value: "NA", label: "N/A" },
                        ] as const
                      ).map((opt) => {
                        const isSelected = current === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={cn(
                              "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-semibold cursor-pointer select-none transition-all",
                              isSelected && opt.value === "WORKING"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : isSelected && opt.value === "NOT_WORKING"
                                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                                  : isSelected
                                    ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100",
                              isReadOnly && "opacity-60 cursor-not-allowed",
                            )}
                          >
                            <input
                              type="radio"
                              disabled={isReadOnly}
                              name={`check-${key}`}
                              value={opt.value}
                              checked={isSelected}
                              onChange={() =>
                                setTempDeviceChecks((prev) => ({ ...prev, [key]: opt.value }))
                              }
                              className="sr-only"
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Battery & Notes inside Modal */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <div>
                <label
                  htmlFor={`${uid}-modal-battery`}
                  className="mb-1 block text-[12px] font-semibold text-slate-700"
                >
                  Battery Health (%) <span className="font-normal text-slate-400">· Optional</span>
                </label>
                <input
                  id={`${uid}-modal-battery`}
                  type="text"
                  disabled={isReadOnly}
                  inputMode="numeric"
                  placeholder="e.g. 94"
                  value={tempDeviceChecks.batteryHealth}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setTempDeviceChecks((prev) => ({
                      ...prev,
                      batteryHealth: cleaned,
                    }));
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[13px] disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor={`${uid}-modal-faults`}
                  className="mb-1 block text-[12px] font-semibold text-slate-700"
                >
                  Other Faults or Condition Notes{" "}
                  <span className="font-normal text-slate-400">· Optional</span>
                </label>
                <textarea
                  id={`${uid}-modal-faults`}
                  rows={2}
                  disabled={isReadOnly}
                  value={tempDeviceChecks.faultNotes}
                  placeholder="Enter scratches, replaced parts, faults or other condition details."
                  onChange={(e) =>
                    setTempDeviceChecks((prev) => ({ ...prev, faultNotes: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 p-2 text-[12px] placeholder:text-slate-400 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setChecksModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => {
                    if (tempDeviceChecks.batteryHealth) {
                      const num = Number(tempDeviceChecks.batteryHealth);
                      if (Number.isNaN(num) || num < 0 || num > 100) {
                        setChecksModalError("Battery health must be between 0 and 100.");
                        return;
                      }
                    }
                    setDeviceChecks(tempDeviceChecks);
                    setChecksModalOpen(false);
                    setChecksModalError(null);
                    toast.success("Device checks saved", {
                      description: "Inspection results updated in phone summary.",
                    });
                  }}
                  className="rounded-lg bg-[var(--kimi-accent)] px-5 py-2 text-[13px] font-bold text-white hover:bg-[var(--kimi-accent-hover)]"
                >
                  Save Device Checks
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Additional Details Modal ───────────────────────────────────────── */}
      {optionalModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-details-title`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3
                  id={`${uid}-details-title`}
                  className="text-[16px] font-black text-slate-900 flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-5 w-5 text-[var(--kimi-accent)]" />
                  Additional Device Details
                </h3>
                <p className="text-[12px] text-slate-500">
                  Optional specs, dual-SIM IMEI 2, serial number, and accessories.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOptionalModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`${uid}-modal-imei2`}
                      className="text-[12px] font-semibold text-slate-700"
                    >
                      IMEI 2 <span className="font-normal text-slate-400">· Optional</span>
                    </label>
                    {cleanImei2.length > 0 && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {cleanImei2.length === 15 ? "15 / 15 ✓" : `${cleanImei2.length}/15`}
                      </span>
                    )}
                  </div>
                  <input
                    id={`${uid}-modal-imei2`}
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    disabled={isReadOnly || isInvoiceLocked}
                    value={form.imei2}
                    placeholder="Second IMEI (dual SIM)"
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[\s-]/g, "").replace(/\D/g, "");
                      update("imei2", cleaned.slice(0, 15));
                    }}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 font-mono text-[13px] disabled:bg-slate-50"
                  />
                  {duplicateImei2 && (
                    <p className="mt-1 text-[11px] font-bold text-red-600">
                      This IMEI already belongs to another stock item.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-modal-serial`}
                    className="mb-1 block text-[12px] font-semibold text-slate-700"
                  >
                    Serial Number <span className="font-normal text-slate-400">· Optional</span>
                  </label>
                  <input
                    id={`${uid}-modal-serial`}
                    type="text"
                    disabled={isReadOnly || isInvoiceLocked}
                    value={form.serial}
                    placeholder="Device serial number"
                    onChange={(e) => update("serial", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 font-mono text-[13px] disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${uid}-modal-network`}
                  className="mb-1 block text-[12px] font-semibold text-slate-700"
                >
                  Network Status
                </label>
                <select
                  id={`${uid}-modal-network`}
                  disabled={isReadOnly}
                  value={form.network_status}
                  onChange={(e) => update("network_status", e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] disabled:bg-slate-50"
                >
                  {NETWORK_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-slate-700">
                  Included Accessories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ACCESSORIES_LIST.map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => toggleAccessory(acc)}
                      aria-pressed={form.accessories.includes(acc)}
                      className={cn(
                        "rounded-lg border px-3 py-1 text-[12px] font-semibold transition-all",
                        form.accessories.includes(acc)
                          ? "border-[var(--kimi-accent)] bg-[var(--kimi-accent-bg)] text-[var(--kimi-accent)] ring-1 ring-[var(--kimi-accent)]"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        isReadOnly && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "DIRECT" && (
                <div>
                  <label
                    htmlFor={`${uid}-modal-source`}
                    className="mb-1 block text-[12px] font-semibold text-slate-700"
                  >
                    Source / Supplier Note{" "}
                    <span className="font-normal text-slate-400">· Optional</span>
                  </label>
                  <input
                    id={`${uid}-modal-source`}
                    type="text"
                    disabled={isReadOnly}
                    value={form.source_note}
                    placeholder="e.g. Existing stock, auction purchase…"
                    onChange={(e) => update("source_note", e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[13px] disabled:bg-slate-50"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor={`${uid}-modal-general-notes`}
                  className="mb-1 block text-[12px] font-semibold text-slate-700"
                >
                  General Notes <span className="font-normal text-slate-400">· Optional</span>
                </label>
                <textarea
                  id={`${uid}-modal-general-notes`}
                  rows={2}
                  disabled={isReadOnly}
                  value={form.general_notes}
                  placeholder="Additional notes about this device…"
                  onChange={(e) => update("general_notes", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-[12px] disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOptionalModalOpen(false)}
                className="rounded-lg bg-[var(--kimi-accent)] px-5 py-2 text-[13px] font-bold text-white hover:bg-[var(--kimi-accent-hover)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Discard Unsaved Changes Confirmation Modal ────────────────────── */}
      {showDiscardConfirm && (
        <CompactConfirmModal
          open={true}
          title="Discard unsaved changes?"
          description="Your changes will be lost if you leave this page."
          confirmLabel="Discard Changes"
          cancelLabel="Keep Editing"
          danger
          isBusy={false}
          onConfirm={() => {
            setShowDiscardConfirm(false);
            navigate({ to: isEditMode ? "/admin/stock" : "/admin" });
          }}
          onCancel={() => setShowDiscardConfirm(false)}
        />
      )}

      {/* ── Print Preview Modal ────────────────────────────────────────────── */}
      {preview && (
        <PrintPreviewModal
          open
          onClose={() => setPreview(null)}
          kind="PURCHASE"
          invoiceNumber={preview.invoiceNumber}
          html80mm={preview.html80mm}
          htmlA4={preview.htmlA4}
        />
      )}
    </div>
  );
}
