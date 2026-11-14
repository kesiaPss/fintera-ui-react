import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { EXPORT_FORMATS } from "@/shared/export/formats";
import ExportFormatIcon from "@/shared/export/ExportFormatIcon";

const SIZES = {
  sm: "h-7 gap-1 px-2 text-micro",
  md: "h-[38px] gap-1.5 px-3 text-label",
};

/**
 * Three explicit format buttons (CSV / Excel / PDF) for a single report.
 * One click downloads, no intermediate format picker.
 */
function ExportFormatButtons({
  onSelect,
  busyFormat = null,
  disabled = false,
  size = "sm",
  reportLabel = "",
  className = "",
}) {
  const { t } = useLocale();

  const groupLabel = reportLabel
    ? t("reports.downloadOptionsFor", { report: reportLabel })
    : t("reports.downloadOptions");

  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
    >
      {EXPORT_FORMATS.map((format) => {
        const isBusy = busyFormat === format.id;
        const actionLabel = reportLabel
          ? t("reports.downloadAs", {
              report: reportLabel,
              format: format.label,
            })
          : t("reports.downloadFormat", { format: format.label });

        return (
          <button
            key={format.id}
            type="button"
            aria-label={actionLabel}
            title={actionLabel}
            aria-busy={isBusy || undefined}
            disabled={disabled || Boolean(busyFormat)}
            onClick={() => onSelect?.(format.id)}
            className={`inline-flex shrink-0 items-center justify-center rounded-chip border border-line bg-surface font-semibold text-ink-2 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]}`}
          >
            {isBusy ? (
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            ) : (
              <ExportFormatIcon format={format.id} className="h-3.5 w-3.5" />
            )}
            <span>{format.label}</span>
          </button>
        );
      })}
    </div>
  );
}

ExportFormatButtons.propTypes = {
  onSelect: PropTypes.func.isRequired,
  busyFormat: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md"]),
  reportLabel: PropTypes.string,
  className: PropTypes.string,
};

export default ExportFormatButtons;
