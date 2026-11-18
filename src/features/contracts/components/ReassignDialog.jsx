import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Dialog, Field, Input, Toggle } from "@/shared/ui";
import { useLocale } from "@/contexts/LocaleContext";
import { sellerApi } from "@/features/seller/api";
import {
  normalizeSellerList,
  sellerName,
  sellerZone,
} from "@/features/seller/utils/assignment";

function ReassignDialog({ open, contract, onClose, onSubmit, loading = false }) {
  const { t } = useLocale();
  const [mode, setMode] = useState("automatic");
  const [sellerId, setSellerId] = useState("");
  const [accept, setAccept] = useState(false);
  const [excludeCurrent, setExcludeCurrent] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [sellersError, setSellersError] = useState(false);
  const [search, setSearch] = useState("");

  const status = String(contract?.status || "").toLowerCase();
  const canOffer = status === "pending" || status === "submitted";
  const requiresDirect = !canOffer;
  const commissionPaid = Boolean(contract?.commission_paid_at);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setMode("automatic");
    setSellerId("");
    setAccept(false);
    setExcludeCurrent(true);
    setSearch("");
    setSellersError(false);
    setSellersLoading(true);
    sellerApi
      .listSellers()
      .then((data) => {
        if (active) setSellers(normalizeSellerList(data));
      })
      .catch(() => {
        if (active) setSellersError(true);
      })
      .finally(() => {
        if (active) setSellersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (requiresDirect) setAccept(true);
  }, [requiresDirect]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sellers;
    return sellers.filter((seller) =>
      [sellerName(seller), sellerZone(seller), seller.email, seller.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [search, sellers]);

  const submitDisabled = loading || (mode === "seller" && !sellerId);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitDisabled) return;
    onSubmit({
      mode,
      seller_id: mode === "seller" ? Number(sellerId) : undefined,
      accept: requiresDirect ? true : accept,
      exclude_current: mode === "automatic" ? excludeCurrent : false,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      title={t("contracts.assignment.dialogTitle")}
      description={t("contracts.assignment.dialogDescription")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {commissionPaid && (
          <p className="rounded-control border border-warning/40 bg-warning-soft p-3 text-label text-warning">
            {t("contracts.assignment.paidWarning")}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("automatic")}
            aria-pressed={mode === "automatic"}
            className={`rounded-control border px-3 py-2.5 text-left text-label font-semibold transition-colors ${
              mode === "automatic"
                ? "border-brand bg-brand-soft text-brand-strong"
                : "border-line bg-surface text-ink-2 hover:bg-surface-2"
            }`}
          >
            {t("contracts.assignment.modeAutomatic")}
          </button>
          <button
            type="button"
            onClick={() => setMode("seller")}
            aria-pressed={mode === "seller"}
            className={`rounded-control border px-3 py-2.5 text-left text-label font-semibold transition-colors ${
              mode === "seller"
                ? "border-brand bg-brand-soft text-brand-strong"
                : "border-line bg-surface text-ink-2 hover:bg-surface-2"
            }`}
          >
            {t("contracts.assignment.modeSeller")}
          </button>
        </div>

        {mode === "automatic" ? (
          <div className="space-y-3">
            <p className="text-label text-ink-3">
              {t("contracts.assignment.automaticHint")}
            </p>
            <div className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface-2 px-3 py-2.5">
              <span className="text-label font-semibold text-ink-2">
                {t("contracts.assignment.excludeCurrent")}
              </span>
              <Toggle
                checked={excludeCurrent}
                onChange={setExcludeCurrent}
                label={t("contracts.assignment.excludeCurrent")}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Field label={t("contracts.assignment.searchSeller")}>
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("contracts.assignment.searchPlaceholder")}
              />
            </Field>

            {sellersLoading && (
              <p className="text-label text-ink-3">
                {t("sellerAssignments.loadingSellers")}
              </p>
            )}
            {!sellersLoading && sellersError && (
              <p role="alert" className="text-label text-danger">
                {t("sellerAssignments.sellersError")}
              </p>
            )}
            {!sellersLoading && !sellersError && filtered.length === 0 && (
              <p className="text-label text-ink-3">
                {sellers.length === 0
                  ? t("sellerAssignments.noSellers")
                  : t("sellerAssignments.searchEmpty")}
              </p>
            )}

            {!sellersLoading && filtered.length > 0 && (
              <div
                role="radiogroup"
                aria-label={t("contracts.assignment.searchSeller")}
                className="max-h-64 space-y-2 overflow-y-auto pr-1"
              >
                {filtered.map((seller) => (
                  <button
                    key={seller.id}
                    type="button"
                    role="radio"
                    aria-checked={String(sellerId) === String(seller.id)}
                    onClick={() => setSellerId(seller.id)}
                    className={`flex w-full items-center gap-3 rounded-control border px-3 py-2.5 text-left transition-colors ${
                      String(sellerId) === String(seller.id)
                        ? "border-brand bg-brand-soft"
                        : "border-line bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        String(sellerId) === String(seller.id)
                          ? "border-brand bg-brand"
                          : "border-line-strong bg-surface"
                      }`}
                    >
                      {String(sellerId) === String(seller.id) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-label font-semibold text-ink">
                        {sellerName(seller)}
                      </span>
                      <span className="block truncate text-micro text-ink-3">
                        {[sellerZone(seller), seller.phone, seller.email]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface-2 px-3 py-2.5">
          <div>
            <p className="text-label font-semibold text-ink-2">
              {t("contracts.assignment.direct")}
            </p>
            <p className="text-micro text-ink-3">
              {requiresDirect
                ? t("contracts.assignment.directRequired")
                : t("contracts.assignment.directHint")}
            </p>
          </div>
          <Toggle
            checked={requiresDirect || accept}
            onChange={setAccept}
            disabled={requiresDirect}
            label={t("contracts.assignment.direct")}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={loading} disabled={submitDisabled}>
            {t("contracts.assignment.confirm")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

ReassignDialog.propTypes = {
  open: PropTypes.bool,
  contract: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  loading: PropTypes.bool,
};

export default ReassignDialog;
