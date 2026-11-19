## Context

See `proposal.md`. The current sheet calls
`GET /api/v1/projects/import/template` for a canonical English template and
mirrors the API's field aliases in `src/features/projects/csvImport.js`. The API
parses comma-delimited UTF-8 CSV, matches duplicates by `guid` or `code`, and
gives `skip_duplicates` precedence over `update_existing`.

The historical-client importer already uses a local template and a two-layer
preview (`parseCsv` + field mapping). This change reuses that pattern for
projects so both importers behave the same way.

## Goals / Non-Goals

**Goals:**

- Remove the runtime dependency on the template endpoint.
- Keep the UI template, preview and API contract aligned through shared field
  definitions.
- Make the preview a faithful estimate of what the API will import.
- Accept the CSV variants produced by Excel in Spanish locales.

**Non-Goals:**

- Changing the API import contract or duplicate-matching rules.
- Supporting `.xlsx`, PDF or other spreadsheet formats.
- Renaming the backend template endpoint (it remains available to API clients).
- Changing the admin-only access rule for project import.

## Decisions

### Generate the template in the UI

`src/features/projects/csvImport.js` owns the template headers, example row,
CSV escaping and the browser download. Spanish is the default header set; the
English locale uses the canonical English headers. Both sets are made only of
aliases the API already accepts, so the template stays importable without a
backend change.

Alternative: keep the API template and add a local fallback. Rejected because
the UI already needs the header list for the mapping preview, and two sources
would drift silently.

### One parser for both the preview and the upload

Generalize `parseCsvRows(text, delimiter)` so the same rows feed the mapping
preview, row validation and the normalized upload. Delimiter detection tries
comma and semicolon and keeps the candidate with the most recognized headers.

### Normalize encoding and delimiter before upload

The API accepts UTF-8 with commas only. The sheet reads the file as an
`ArrayBuffer`, decodes as UTF-8 and falls back to Windows-1252 when replacement
characters appear. When the decoded file is not comma-delimited UTF-8, the sheet
re-serializes it to UTF-8 comma-delimited CSV and uploads that `File`, keeping
the original name. The preview and the uploaded bytes therefore describe the
same data.

Alternative: extend the API parser. Rejected for this UI change because it
requires a coordinated backend release.

### Mirror the API validation rules in the preview

Row validation checks the same inputs the API's `BuildProject` checks: required
name, address and price; numeric price; integer lot count; `YYYY-MM-DD` dates;
`m2`/`ft2`/`vara2` units; non-negative rates. The API remains authoritative;
the preview only avoids promising rows that will fail.

### Duplicate options are exclusive

The UI disables the opposite toggle instead of mirroring the API's silent
"skip wins" precedence. The sheet explains that matching uses `codigo` and warns
when the CSV has no `code` or `guid` column, because without a key the options
have no effect.

### Side sheet and warning-level results

Use the shared `Dialog` with `side="right"` (05f). Add a `warning` Toast tone and
use a warning banner when some rows import and others fail. Only a result with
zero imported/updated rows uses the danger tone.

## Risks / Trade-offs

- **Header drift with the API** → Keep the existing "keep in sync" comment in
  `csvImport.js`; tests assert every template header maps to a field and the
  preview accepts the template.
- **Encoding heuristic false positives** → Only switch to Windows-1252 when
  decoding as UTF-8 produces replacement characters; keep the original file
  otherwise.
- **Validation drift** → Validate only rules already enforced by the API and
  keep the API result authoritative for final success.
- **Re-serialization changes the uploaded bytes** → Re-escape every field with
  standard CSV quoting and keep the original file name so users can recognize
  the upload.
- **Large files** → Cap preview error rendering to the first 20 issues while
  keeping the total count; accept the API's full error list after import.
