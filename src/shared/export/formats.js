// Single source of truth for the report export formats supported by the API.
// Keep the ids aligned with the backend `format` query parameter.
export const EXPORT_FORMATS = [
  {
    id: "csv",
    label: "CSV",
    extension: "csv",
    tone: "text-warning",
    soft: "bg-warning-soft",
  },
  {
    id: "xlsx",
    label: "Excel",
    extension: "xlsx",
    tone: "text-brand-strong",
    soft: "bg-brand-soft",
  },
  {
    id: "pdf",
    label: "PDF",
    extension: "pdf",
    tone: "text-danger",
    soft: "bg-danger-soft",
  },
];

export const DEFAULT_EXPORT_FORMAT = EXPORT_FORMATS[0].id;

export const findExportFormat = (formatId) =>
  EXPORT_FORMATS.find((format) => format.id === formatId) ?? EXPORT_FORMATS[0];

/**
 * Adds the right file extension to a report name.
 * `buildExportFilename("comisiones-2026-11-01", "pdf")` → `comisiones-2026-11-01.pdf`
 */
export const buildExportFilename = (baseName, formatId) => {
  const { extension } = findExportFormat(formatId);
  return `${baseName}.${extension}`;
};
