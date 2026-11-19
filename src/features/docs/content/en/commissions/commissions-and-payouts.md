# Commissions and payouts

A **commission** is the amount a seller earns when a contract is approved. The rate depends on the project and on the contract's financing type.

## Commission rates

Each project stores three rates:

- **Direct** — direct financing.
- **Bank** — bank financing.
- **Cash** — cash financing.

The commission is calculated when the contract is approved and stored on the contract. Later rate changes only apply to new contracts.

Admins open **Configure rates** from the Commissions page. The rules sheet sets the global default and the unassigned rate, and adds per-seller exceptions. A per-seller exception overrides the project/global rate for that seller. Historical records use the seller exception when present, otherwise the global default.

## Admin commissions page

Open **Commissions** from the admin menu. The page has:

- **Date range** filters and a **seller** filter.
- Summary cards: commission in the period, amount still to pay, and paid amount, with captions for the average rate and paid count.
- A detail table with contract, seller, client, sale value, commission and rate, status, date, and an action.
- **Export** to download the period as CSV.

For a pending commission, **Pay** asks for confirmation and marks the commission as paid. It writes an audit entry and does **not** change the contract balance. Paid commissions show **View**, which opens a read-only detail dialog.

## Historical clients to validate

The Commissions page has a **Pending validation** tab with the number of historical records waiting for review. It shows pending, validated and rejected totals; filters by seller, status and text; and a table with the client, seller, sale date, price, rate, commission, evidence and status.

From each pending row an admin can:

- **Validate** the record. It leaves the pending list and stays a historical sale; it creates no reservation and blocks no lot.
- **Reject** the record after confirmation.
- **Edit** the client, sale, rate or commission amount before validating.

Sellers can edit their own pending records from **My clients**; validated records are read-only for them.

## Seller commissions

Sellers see **Commissions** in their workspace, read-only:

- Commission this month.
- Pending commission to be paid.
- Paid commission in the period.
- A table with contract, client, sale value, commission and rate, status, and date.

Sellers cannot mark a commission as paid or change rates.

## Commission credit on cancellation

If you cancel a contract whose commission was already paid, a **commission credit** is generated in Fintera's favor for that seller. It appears in Commissions as a pending credit. The admin can **apply it** (mark it settled) when appropriate. If the commission was not paid, no credit is created: the commission simply stops appearing.

## Related

- [Financing types: direct, bank, and cash](/docs/financing-types)
- [Projects, pricing, and measurement units](/docs/projects-and-pricing)
- [Audit log](/docs/audits)
