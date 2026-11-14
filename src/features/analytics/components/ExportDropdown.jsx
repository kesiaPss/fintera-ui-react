import { memo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { reportsApi } from "@/shared/api/reports";
import { buildExportFilename } from "@/shared/export/formats";
import ExportFormatButtons from "@/shared/ui/ExportFormatButtons";

const OPERATIONS_REPORT = {
    id: "operations_export",
    titleKey: "reports.operationsReport",
    descriptionKey: "reports.operationsHint",
    requiresDates: true,
    supportsProject: true,
    icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 15l4-6 4 3 4-7" />
        </svg>
    ),
    color: "text-brand-strong",
    bgColor: "bg-brand-soft",
};

const REPORT_TYPES = [
    {
        id: "commissions_export",
        titleKey: "reports.commissions",
        descriptionKey: "reports.commissionsHint",
        requiresDates: true,
        supportsProject: false,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
            </svg>
        ),
        color: "text-brand",
        bgColor: "bg-brand-soft",
    },
    {
        id: "income_flow_export",
        titleKey: "reports.revenueFlow",
        descriptionKey: "reports.revenueFlowHint",
        requiresDates: true,
        supportsProject: true,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
        color: "text-info",
        bgColor: "bg-info-soft",
    },
    {
        id: "overdue_export",
        titleKey: "reports.overduePayments",
        descriptionKey: "reports.overdueSnapshot",
        requiresDates: false,
        supportsProject: false,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        ),
        color: "text-danger",
        bgColor: "bg-danger-soft",
    }
];

const ReportCard = ({ report, title, description, busyFormat, disabled, onSelect }) => (
    <div className="rounded-control border border-line bg-surface p-2.5">
        <div className="flex items-start gap-2.5">
            <div className={`rounded-control p-2 ${report.bgColor} ${report.color}`}>
                {report.icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-label font-semibold text-ink-2">{title}</p>
                <p className="text-micro leading-snug text-ink-3">{description}</p>
            </div>
        </div>
        <ExportFormatButtons
            className="mt-2"
            reportLabel={title}
            busyFormat={busyFormat}
            disabled={disabled}
            onSelect={onSelect}
        />
    </div>
);

const ExportDropdown = memo(function ExportDropdown({ startDate, endDate, projectId, onExportBase }) {
    const { t } = useLocale();
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [busy, setBusy] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const saveBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleBaseDownload = async (format) => {
        setBusy({ reportId: OPERATIONS_REPORT.id, format });
        try {
            await onExportBase?.(format);
            setIsOpen(false);
        } finally {
            setBusy(null);
        }
    };

    const handleReportDownload = async (report, format) => {
        if (report.requiresDates && (!startDate || !endDate)) {
            showToast(t("reports.selectBothDates"), "error");
            return;
        }

        setBusy({ reportId: report.id, format });
        try {
            const params = {};
            if (report.requiresDates) {
                params.start_date = startDate;
                params.end_date = endDate;
            }
            if (report.supportsProject && projectId) {
                params.project_id = projectId;
            }

            const blob = await reportsApi.downloadReport(report.id, params, format);
            const today = new Date().toISOString().split("T")[0];

            saveBlob(blob, buildExportFilename(`${report.id}-${today}`, format));
            showToast(t("common.downloadSuccess"), "success");
            setIsOpen(false);
        } catch {
            showToast(t("reports.downloadError"), "error");
        } finally {
            setBusy(null);
        }
    };

    const isBusy = (reportId) => busy !== null && busy.reportId === reportId;

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-[38px] items-center gap-2 rounded-control border px-3.5 text-label font-semibold transition-colors ${
                    isOpen
                        ? "border-brand bg-brand-soft text-brand-strong"
                        : "border-line bg-surface text-ink-2 hover:bg-surface-2"
                }`}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t("common.export") || "Export"}
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1"
                >
                    <polyline points="6 9 12 15 18 9" />
                </motion.svg>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 z-[100] mt-2 w-[22rem] overflow-hidden rounded-card border border-line bg-surface shadow-pop"
                    >
                        <div className="max-h-[min(70vh,34rem)] overflow-y-auto p-3">
                            <div className="mb-2 px-2 text-micro font-bold uppercase tracking-wide text-ink-3">
                                {t("reports.dataExport") || "Data Export"}
                            </div>
                            <ReportCard
                                report={OPERATIONS_REPORT}
                                title={t(OPERATIONS_REPORT.titleKey)}
                                description={t(OPERATIONS_REPORT.descriptionKey)}
                                busyFormat={isBusy(OPERATIONS_REPORT.id) ? busy.format : null}
                                disabled={busy !== null && !isBusy(OPERATIONS_REPORT.id)}
                                onSelect={handleBaseDownload}
                            />

                            <div className="my-3 h-px bg-line" />

                            <div className="mb-1 px-2 text-micro font-bold uppercase tracking-wide text-ink-3">
                                {t("reports.financialReports") || "Financial Reports"}
                            </div>
                            <p className="mb-2 px-2 text-micro leading-snug text-ink-3">
                                {t("reports.availableInAllFormats")}
                            </p>
                            <div className="space-y-2">
                                {REPORT_TYPES.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        title={t(report.titleKey)}
                                        description={t(report.descriptionKey)}
                                        busyFormat={isBusy(report.id) ? busy.format : null}
                                        disabled={busy !== null && !isBusy(report.id)}
                                        onSelect={(format) => handleReportDownload(report, format)}
                                    />
                                ))}
                            </div>
                        </div>

                        {(!startDate || !endDate) && (
                            <div className="flex items-center gap-2 bg-warning-soft p-3">
                                <svg className="shrink-0 text-warning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className="text-micro font-semibold leading-tight text-warning">
                                    {t("reports.selectDates") || "Select a date range for reports"}
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default ExportDropdown;
