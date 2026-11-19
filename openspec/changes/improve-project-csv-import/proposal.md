## Why

Project CSV import already works, but the template is a small link that depends
on a backend endpoint, duplicate handling is ambiguous, and the preview can
promise more rows than the API will import. Admins need a reliable, bilingual
template and a preview that matches what will actually happen.

## What Changes

- Generate the CSV template in the UI with Spanish headers (canonical English
  headers for the `en` locale), the accepted columns and one example row, so it
  no longer depends on the API.
- Make "Update existing" and "Skip duplicates" mutually exclusive and explain
  that duplicate matching uses the project `code` (GUID is also supported by the
  API when the column is present).
- Validate rows in the preview: required values, numeric fields, integer lot
  count, `YYYY-MM-DD` delivery dates, measurement units and non-negative rates.
- Show the number of valid rows in the CTA and distinguish rows with errors.
- Accept comma- or semicolon-delimited CSV and legacy Windows-1252 files by
  normalizing them to UTF-8, comma-delimited CSV before upload.
- Present partial imports as a warning, allow importing another file without
  closing the sheet, and offer the row errors as a downloadable CSV.
- Turn the import dialog into a side sheet, matching the 05f design.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `projects`: the CSV import sheet gains a locally generated bilingual template,
  exclusive duplicate options, row validation, normalized file formats,
  warning-level partial results and downloadable row errors.

## Impact

- UI: `src/features/projects/csvImport.js`,
  `src/features/projects/components/CsvImportModal.jsx`,
  `src/features/projects/api.js`, `src/features/projects/pages/index.jsx`,
  `src/shared/ui/FileUpload.jsx`, `src/shared/ui/Toast.jsx`,
  `src/locales/en.json`, `src/locales/es.json`.
- Docs: `documentation/features/project-import.md` (new) and
  `documentation/design/implementation-map.md`.
- API: no backend changes. The existing `/projects/import` contract and its
  Spanish aliases are reused; the UI stops calling
  `/projects/import/template`.
