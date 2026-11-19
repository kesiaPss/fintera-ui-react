# Project CSV import

The projects page lets admins create or update several projects from a CSV file.
The import sheet lives in `src/features/projects/components/CsvImportModal.jsx`
and the parsing, template and validation helpers live in
`src/features/projects/csvImport.js`.

> **Nota en español:** la plantilla se genera en el navegador con encabezados en
> español. El campo `codigo` es la clave para actualizar u omitir duplicados.

## Template

The sheet downloads the template locally; it does not call the API. The Spanish
template uses these headers (the English locale uses the canonical English
headers):

| Header | API field | Required |
| --- | --- | --- |
| `nombre` | `name` | yes |
| `codigo` | `code` | no (duplicate key) |
| `direccion` | `address` | yes |
| `ciudad` | `city` | no |
| `precio_m2` | `price_per_square_unit` | yes |
| `lotes` | `lot_count` | no |
| `unidad` | `measurement_unit` | no |
| `tipo` | `project_type` | no |
| `fecha_entrega` | `delivery_date` | no |
| `descripcion` | `description` | no |
| `tasa_interes` | `interest_rate` | no |
| `comision_directa` | `commission_rate_direct` | no |
| `comision_banco` | `commission_rate_bank` | no |
| `comision_contado` | `commission_rate_cash` | no |

The template includes one example row. Values:

- `unidad`: `m2`, `ft2` or `vara2`.
- `tipo`: `residential`, `commercial`, `industrial` or `mixed_use`.
- `fecha_entrega`: `YYYY-MM-DD`.
- Numeric fields use a plain decimal point (`1200`, not `1,200`).

Every header is an alias accepted by FinteraAPI. Keep `TARGET_FIELDS` and
`TEMPLATE_HEADERS` in `csvImport.js` aligned with `ProjectCSVCanonicalHeaders`
and `projectCSVFields` in the API.

## Import flow

1. The file is read as bytes and decoded as UTF-8; if replacement characters
   appear, it is decoded as Windows-1252.
2. The UI detects comma or semicolon delimiters by trying both and keeping the
   one that maps more known headers.
3. Rows are mapped to project fields and validated in the preview.
4. When the delimiter or encoding is not the API default, the file is
   re-serialized as UTF-8 comma-delimited CSV and that normalized file is
   uploaded. The original file name is preserved.
5. The sheet sends `file`, `update_existing` and `skip_duplicates` to
   `POST /api/v1/projects/import`.
6. The result shows imported, updated, skipped and failed rows. Partial results
   use a warning tone; row errors can be downloaded as CSV.

## Duplicate handling

The API matches duplicates by `guid` first and then by `code`. The template
does not include `guid`, so `codigo` is the practical key. Without `codigo` (or
a manually added `guid` column), the duplicate options have no effect and the
sheet warns about it.

"Actualizar existentes" and "Omitir duplicados" are mutually exclusive in the
UI. The API still gives `skip_duplicates` precedence if a caller sends both.

## Validation

The preview mirrors the API rules:

- `nombre`, `direccion` and `precio_m2` are required.
- Prices and rates must be non-negative numbers.
- `lotes` must be a non-negative integer.
- `fecha_entrega` must be a valid `YYYY-MM-DD` date.
- `unidad` must be `m2`, `ft2` or `vara2`.

The CTA counts only valid rows. The API remains authoritative and reports the
final row errors.

## Limitations

- `.xlsx`, `.xls` and other spreadsheet formats are not accepted.
- PDFs and other non-CSV files are rejected before reading.
- The API contract still expects UTF-8 comma-delimited CSV; the normalization
  happens in the browser.

## Related files

- `src/features/projects/components/CsvImportModal.jsx`
- `src/features/projects/csvImport.js`
- `src/features/projects/pages/index.jsx`
- `src/shared/ui/FileUpload.jsx`
- `openspec/specs/projects/spec.md`
