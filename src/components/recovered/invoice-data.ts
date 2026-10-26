export type InvoiceRow = (string | number | null)[];

export type InvoiceMetadata = {
  exchangeDate?: string;
  liveRate?: number;
  bankFee?: number;
  ftxFee?: number;
  itemOverrides?: Record<string, { qtyTotal: number }>;
};

export type InvoiceBackup = {
  rows: InvoiceRow[];
  invoiceMeta: Record<string, InvoiceMetadata>;
};

export const rowsStorageKey = "usfw_invoicing_data_v1";
export const metadataStorageKey = "usfw_invoice_meta_v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseInvoiceBackup(value: unknown): InvoiceBackup {
  const rows = Array.isArray(value) ? value : isRecord(value) ? value.rows : undefined;
  const invoiceMeta = Array.isArray(value) ? {} : isRecord(value) ? value.invoiceMeta ?? {} : {};
  if (!Array.isArray(rows) || !rows.every(row =>
    Array.isArray(row) && row.length === 21 &&
    row.every(cell => cell === null || typeof cell === "string" || (typeof cell === "number" && Number.isFinite(cell))) &&
    typeof row[0] === "string" && row[0].trim() !== "" &&
    [13, 17].every(index => Number.isFinite(Number(row[index])))
  )) {
    throw new Error("The backup must contain invoice rows with 21 valid columns.");
  }
  if (!isRecord(invoiceMeta) || !Object.values(invoiceMeta).every(meta => {
    if (!isRecord(meta)) return false;
    if (meta.exchangeDate !== undefined && typeof meta.exchangeDate !== "string") return false;
    if (!["liveRate", "bankFee", "ftxFee"].every(key => meta[key] === undefined || (typeof meta[key] === "number" && Number.isFinite(meta[key])))) return false;
    if (meta.itemOverrides === undefined) return true;
    return isRecord(meta.itemOverrides) && Object.entries(meta.itemOverrides).every(([key, override]) =>
      /^\d+$/.test(key) && Number(key) < 13 && isRecord(override) && typeof override.qtyTotal === "number" && Number.isFinite(override.qtyTotal)
    );
  })) {
    throw new Error("The backup contains invalid invoice metadata.");
  }
  return { rows: rows as InvoiceRow[], invoiceMeta: invoiceMeta as Record<string, InvoiceMetadata> };
}

export function readStoredInvoiceBackup(): InvoiceBackup {
  const rows = localStorage.getItem(rowsStorageKey);
  const meta = localStorage.getItem(metadataStorageKey);
  return parseInvoiceBackup({
    rows: rows === null ? [] : JSON.parse(rows),
    invoiceMeta: meta === null ? {} : JSON.parse(meta),
  });
}

export function escapeInvoiceTitle(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}
