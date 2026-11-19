## 1. Template and parser

- [x] 1.1 Add Spanish and English project template header sets, example rows and CSV escaping to `src/features/projects/csvImport.js`; verify unit tests prove every header maps to a field and the template previews with one valid row.
- [x] 1.2 Add a browser download helper with locale-based file names; verify the modal test downloads a template without calling the API.
- [x] 1.3 Generalize `parseCsvRows` to accept a delimiter and add delimiter detection based on recognized headers; verify comma and semicolon tests pass.
- [x] 1.4 Add UTF-8/Windows-1252 decoding and a CSV serializer for upload normalization; verify accented text and semicolon files are normalized to UTF-8 comma CSV.

## 2. Row validation

- [x] 2.1 Extend the CSV analysis to count only rows with mapped values and return row issues; verify unmapped-only rows are excluded.
- [x] 2.2 Mirror the API validation rules (required fields, numeric price, integer lot count, date format, units, non-negative rates); verify valid/invalid counts and issue codes in unit tests.

## 3. Import sheet UX

- [x] 3.1 Replace the backend template link with a prominent download button and a hint describing required columns, formats and units; verify the sheet renders the hint and downloads locally.
- [x] 3.2 Make update/skip toggles mutually exclusive and show the `codigo`/`guid` duplicate-key warning; verify toggle and warning tests.
- [x] 3.3 Add file validation, empty-file and zero-row messages, and normalized-file notice; verify each state renders the expected message.
- [x] 3.4 Show valid-row counts, preview issues and an all-invalid disabled state; verify the CTA label and disabled state.
- [x] 3.5 Present partial results as warnings, add "Importar otro archivo" and disable controls while importing; verify reset and warning tests.
- [x] 3.6 Add downloadable row errors and switch the dialog to a side sheet; verify the CSV download and sheet rendering.

## 4. Shared UI and i18n

- [x] 4.1 Localize the `FileUpload` dropzone text and add a `warning` Toast tone; verify English and Spanish tests.
- [x] 4.2 Add all new keys to `src/locales/en.json` and `src/locales/es.json`; verify no user-facing string is hardcoded.

## 5. Documentation and verification

- [x] 5.1 Add `documentation/features/project-import.md` and update the 05f section of `documentation/design/implementation-map.md`; verify the docs describe the template, duplicate keys, supported formats and error output.
- [x] 5.2 Run `npm install` and `npm run verify`; verify lint, tests and build pass.
