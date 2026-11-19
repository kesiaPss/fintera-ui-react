import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { projectsApi } from "../api";
import {
  analyzeCsv,
  downloadProjectRowErrors,
  downloadProjectTemplate,
  isCsvFile,
  normalizeCsvFile,
  readCsvText,
} from "../csvImport";
import { Banner, Button, Dialog, FileUpload, Toggle } from "@/shared/ui";

const EMPTY_RESULT = null;
const MAX_PREVIEW_ISSUES = 20;

function CsvImportModal({ open, onClose, onImported }) {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const [files, setFiles] = useState([]);
  const [preparedFile, setPreparedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [normalized, setNormalized] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [result, setResult] = useState(EMPTY_RESULT);
  const analysisRef = useRef(0);

  const resetFileState = () => {
    analysisRef.current += 1;
    setFiles([]);
    setPreparedFile(null);
    setAnalysis(null);
    setParseError(null);
    setNormalized(false);
    setShowIssues(false);
    setResult(EMPTY_RESULT);
    setUploadKey((key) => key + 1);
  };

  const close = () => {
    if (importing) return;
    resetFileState();
    onClose();
  };

  const analyzeFile = async (file) => {
    const analysisId = analysisRef.current + 1;
    analysisRef.current = analysisId;
    setPreparedFile(null);
    setAnalysis(null);
    setParseError(null);
    setNormalized(false);
    setShowIssues(false);
    setResult(EMPTY_RESULT);

    if (!isCsvFile(file)) {
      setFiles([]);
      setUploadKey((key) => key + 1);
      setParseError("invalidFile");
      return;
    }

    try {
      const { text, encoding } = await readCsvText(file);
      if (analysisId !== analysisRef.current) return;

      const nextAnalysis = analyzeCsv(text);
      const shouldNormalize =
        encoding !== "utf-8" || nextAnalysis.delimiter !== ",";
      const uploadFile = shouldNormalize
        ? normalizeCsvFile(file, text, nextAnalysis.delimiter)
        : file;

      setAnalysis(nextAnalysis);
      setPreparedFile(uploadFile);
      setNormalized(shouldNormalize);
    } catch (err) {
      if (analysisId !== analysisRef.current) return;
      setAnalysis(null);
      setPreparedFile(null);
      setParseError(err?.message === "empty-csv" ? "emptyFile" : "importError");
    }
  };

  const handleFilesChange = (nextFiles) => {
    setFiles(nextFiles);
    const [nextFile] = nextFiles;

    if (nextFile) {
      analyzeFile(nextFile);
      return;
    }

    resetFileState();
  };

  const handleDownloadTemplate = () => {
    try {
      downloadProjectTemplate(locale);
    } catch {
      showToast(t("projectsPage.templateDownloadError"), "error");
    }
  };

  const handleSubmit = async () => {
    if (
      !preparedFile ||
      !analysis ||
      parseError ||
      analysis.missingRequired.length > 0 ||
      analysis.rowCount === 0 ||
      analysis.validRowCount === 0
    ) {
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", preparedFile);
      formData.append("update_existing", updateExisting ? "1" : "0");
      formData.append("skip_duplicates", skipDuplicates ? "1" : "0");

      const summary = await projectsApi.import(formData);
      const normalizedResult = {
        imported: Number(summary?.imported) || 0,
        updated: Number(summary?.updated) || 0,
        skipped: Number(summary?.skipped) || 0,
        errors: Array.isArray(summary?.errors) ? summary.errors : [],
      };
      setResult(normalizedResult);

      const changed = normalizedResult.imported + normalizedResult.updated;
      if (normalizedResult.errors.length === 0) {
        showToast(t("projectsPage.importCompleted"), "success");
      } else if (changed > 0) {
        showToast(
          t("projectsPage.importPartial", {
            imported: changed,
            errors: normalizedResult.errors.length,
          }),
          "warning"
        );
      } else {
        showToast(
          t("projectsPage.importFailed", {
            errors: normalizedResult.errors.length,
          }),
          "error"
        );
      }

      if (changed > 0) onImported?.();
    } catch (err) {
      showToast(`${t("projectsPage.importErrorPrefix")} ${err.message}`, "error");
    } finally {
      setImporting(false);
    }
  };

  const hasDuplicateKey = Boolean(
    analysis?.mapping.some(
      ({ field }) => field?.key === "code" || field?.key === "guid"
    )
  );
  const hasRequiredColumns = Boolean(analysis && analysis.missingRequired.length === 0);
  const canImport =
    Boolean(preparedFile && analysis) &&
    !parseError &&
    hasRequiredColumns &&
    analysis.rowCount > 0 &&
    analysis.validRowCount > 0;

  const importLabel = analysis
    ? analysis.rowIssues.length > 0
      ? t("projectsPage.importValidCount", { count: analysis.validRowCount })
      : t("projectsPage.importCount", { count: analysis.rowCount })
    : t("projectsPage.importCSV");
  const missingLabels =
    analysis?.missingRequired
      .map((field) => t(`projects.${field.labelKey}`))
      .join(", ") ?? "";
  const visibleIssues = analysis?.rowIssues.slice(0, MAX_PREVIEW_ISSUES) ?? [];
  const hiddenIssueCount = (analysis?.rowIssues.length ?? 0) - visibleIssues.length;
  const resultChanged = result ? result.imported + result.updated : 0;
  const resultTone =
    result?.errors.length === 0
      ? "success"
      : resultChanged > 0
        ? "warning"
        : "danger";

  return (
    <Dialog
      open={open}
      onClose={close}
      title={t("projectsPage.importCSV")}
      side="right"
      footer={
        result ? (
          <>
            <Button
              variant="secondary"
              onClick={resetFileState}
              disabled={importing}
            >
              {t("projectsPage.importAnother")}
            </Button>
            <Button onClick={close}>{t("common.close")}</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={close} disabled={importing}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              loading={importing}
              disabled={!canImport}
            >
              {importLabel}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <FileUpload
            key={uploadKey}
            label={t("projectsPage.csvFileLabel")}
            accept=".csv,text/csv"
            multiple={false}
            files={files}
            onChange={handleFilesChange}
            hint={t("projectsPage.csvFileHint")}
            disabled={importing}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={importing}
            >
              <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
              <span>{t("projectsPage.downloadTemplate")}</span>
            </Button>
            <p className="text-micro font-medium text-ink-3">
              {t("projectsPage.requiredColumnsHint")}
            </p>
          </div>
          <p className="text-micro text-ink-3">
            {t("projectsPage.templateHint")}
          </p>
          <p className="text-micro text-ink-3">
            {t("projectsPage.valueHints")}
          </p>
        </div>

        {parseError && (
          <Banner
            tone="danger"
            action={
              <Button variant="secondary" size="sm" onClick={resetFileState}>
                {t("common.retry")}
              </Button>
            }
          >
            {t(`projectsPage.${parseError}`)}
          </Banner>
        )}

        {analysis && !parseError && analysis.missingRequired.length > 0 && (
          <Banner tone="danger">
            {t("projectsPage.missingRequiredColumns", { columns: missingLabels })}
          </Banner>
        )}

        {analysis &&
          !parseError &&
          analysis.missingRequired.length === 0 &&
          analysis.rowCount === 0 && (
            <Banner tone="warning">{t("projectsPage.noDataRows")}</Banner>
          )}

        {analysis &&
          !parseError &&
          hasRequiredColumns &&
          analysis.rowCount > 0 &&
          analysis.validRowCount === 0 && (
            <Banner tone="danger">{t("projectsPage.noValidRows")}</Banner>
          )}

        {normalized && !parseError && (
          <Banner tone="info">{t("projectsPage.normalizedFile")}</Banner>
        )}

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">
            {t("projectsPage.importOptions")}
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-body font-medium text-ink-2">
              {t("projectsPage.updateExisting")}
            </span>
            <Toggle
              checked={updateExisting}
              onChange={(next) => {
                setUpdateExisting(next);
                if (next) setSkipDuplicates(false);
              }}
              label={t("projectsPage.updateExisting")}
              disabled={importing}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-body font-medium text-ink-2">
              {t("projectsPage.skipDuplicates")}
            </span>
            <Toggle
              checked={skipDuplicates}
              onChange={(next) => {
                setSkipDuplicates(next);
                if (next) setUpdateExisting(false);
              }}
              label={t("projectsPage.skipDuplicates")}
              disabled={importing}
            />
          </div>
          <p className="text-micro text-ink-3">
            {t("projectsPage.duplicateKeyHint")}
          </p>
          {analysis &&
            (updateExisting || skipDuplicates) &&
            !hasDuplicateKey && (
              <Banner tone="warning">
                {t("projectsPage.duplicateKeyMissing")}
              </Banner>
            )}
        </div>

        <div className="h-px bg-line" />

        {analysis && analysis.mapping.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">
              {t("projectsPage.columnMapping")}
            </p>
            <ul className="space-y-1.5">
              {analysis.mapping.map(({ header, field }, index) => (
                <li
                  key={`${header}-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span
                    className={`min-w-0 truncate text-body ${
                      field ? "font-medium text-ink-2" : "text-ink-3"
                    }`}
                  >
                    {header}
                  </span>
                  <span
                    className={`shrink-0 text-right text-body ${
                      field ? "font-semibold text-ink" : "font-medium text-warning"
                    }`}
                  >
                    {field ? t(`projects.${field.labelKey}`) : t("projectsPage.notUsed")}
                    {field?.required && (
                      <span className="ml-1 text-micro font-medium text-ink-3">
                        · {t("projectsPage.requiredColumn")}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis && hasRequiredColumns && analysis.rowCount > 0 && (
          <div className="space-y-1.5">
            <p className="text-micro font-medium text-ink-3" role="status">
              {analysis.rowIssues.length > 0
                ? t("projectsPage.rowValidationSummary", {
                    valid: analysis.validRowCount,
                    errors: analysis.rowIssues.length,
                  })
                : t("projectsPage.rowValidationReady", {
                    count: analysis.validRowCount,
                  })}
            </p>
            {analysis.rowIssues.length > 0 && (
              <button
                type="button"
                onClick={() => setShowIssues((value) => !value)}
                className="text-label font-semibold text-brand hover:underline"
              >
                {showIssues
                  ? t("projectsPage.hideRowIssues")
                  : t("projectsPage.viewRowIssues", {
                      count: analysis.rowIssues.length,
                    })}
              </button>
            )}
            {showIssues && visibleIssues.length > 0 && (
              <ul className="max-h-40 space-y-1 overflow-y-auto rounded-control border border-line bg-canvas p-3">
                {visibleIssues.map((item) => (
                  <li key={item.row} className="text-micro text-ink-2">
                    {t("projectsPage.rowIssueLine", {
                      row: item.row,
                      reasons: item.issues
                        .map((rowIssue) =>
                          t(rowIssue.reasonKey, {
                            field: t(`projects.${rowIssue.field.labelKey}`),
                          })
                        )
                        .join(", "),
                    })}
                  </li>
                ))}
                {hiddenIssueCount > 0 && (
                  <li className="text-micro font-medium text-ink-3">
                    {t("projectsPage.moreRowIssues", { count: hiddenIssueCount })}
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <Banner tone={resultTone}>{t("projectsPage.importSummary")}</Banner>
            <dl className="grid grid-cols-3 gap-2 rounded-control border border-line bg-canvas p-3 text-center">
              <div>
                <dt className="text-micro font-medium text-ink-3">
                  {t("projectsPage.importedCount")}
                </dt>
                <dd className="text-title font-bold text-ink">{result.imported}</dd>
              </div>
              <div>
                <dt className="text-micro font-medium text-ink-3">
                  {t("projectsPage.updatedCount")}
                </dt>
                <dd className="text-title font-bold text-ink">{result.updated}</dd>
              </div>
              <div>
                <dt className="text-micro font-medium text-ink-3">
                  {t("projectsPage.skippedCount")}
                </dt>
                <dd className="text-title font-bold text-ink">{result.skipped}</dd>
              </div>
            </dl>
            {result.errors.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-label font-semibold text-danger">
                    {t("projectsPage.rowErrors")}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadProjectRowErrors(result.errors, locale)}
                  >
                    <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
                    <span>{t("projectsPage.downloadErrors")}</span>
                  </Button>
                </div>
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-control border border-line bg-canvas p-3">
                  {result.errors.map((error, index) => (
                    <li
                      key={`${error.row}-${index}`}
                      className="text-micro text-ink-2"
                    >
                      {t("projectsPage.rowError", {
                        row: error.row,
                        message: error.message,
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}

CsvImportModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onImported: PropTypes.func,
};

export default CsvImportModal;
