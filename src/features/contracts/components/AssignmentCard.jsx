import { memo } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, Chip, EmptyState, Skeleton } from "@/shared/ui";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/shared/utils/formatters";

const STATUS_TONES = {
  accepted: "success",
  pending: "warning",
  expired: "danger",
  superseded: "neutral",
  none: "neutral",
};

const money = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return `L ${Number(value || 0).toLocaleString("es-HN", {
    maximumFractionDigits: 2,
  })}`;
};

function AssignmentCard({
  contract,
  history = [],
  loading = false,
  isAdmin = false,
  onReassign,
}) {
  const { t } = useLocale();
  if (!contract) return null;

  const status = String(contract.assignment_status || "none").toLowerCase();
  const origin = String(contract.assignment_origin || "none").toLowerCase();
  const seller = contract.seller || contract.seller_user?.full_name || "";
  const contact = contract.seller_contact || null;
  const commissionPaid = Boolean(contract.commission_paid_at);

  return (
    <Card
      title={t("contracts.assignment.title")}
      action={
        isAdmin ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onReassign?.()}
          >
            <FontAwesomeIcon icon={faArrowsRotate} />
            {t("contracts.assignment.reassign")}
          </Button>
        ) : null
      }
      bodyClassName="px-5 pb-5 pt-3"
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : seller ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <FontAwesomeIcon icon={faUserTie} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-lg font-bold text-ink">{seller}</p>
              <p className="truncate text-micro text-ink-3">
                {[contact?.phone, contact?.email].filter(Boolean).join(" · ") ||
                  contract.referral_guid ||
                  "—"}
              </p>
            </div>
          </div>

          <dl className="space-y-1.5 border-t border-line pt-3 text-label">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-3">{t("contracts.assignment.status")}</dt>
              <dd>
                <Chip tone={STATUS_TONES[status] || "neutral"}>
                  {t(`contracts.assignment.statusValue.${status}`, status)}
                </Chip>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-3">{t("contracts.assignment.origin")}</dt>
              <dd className="font-semibold text-ink">
                {t(`contracts.assignment.originValue.${origin}`, origin)}
              </dd>
            </div>
            {contract.assigned_at && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-3">
                  {t("contracts.assignment.assignedAt")}
                </dt>
                <dd className="font-semibold text-ink">
                  {formatDate(contract.assigned_at)}
                </dd>
              </div>
            )}
            {status === "pending" && contract.accept_deadline_at && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-3">
                  {t("contracts.assignment.deadline")}
                </dt>
                <dd className="font-semibold text-warning">
                  {formatDate(contract.accept_deadline_at)}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-3">
                {t("contracts.assignment.commission")}
              </dt>
              <dd className="text-right font-semibold text-ink">
                {money(contract.commission_amount)}
                <span className="ml-1.5 text-micro font-medium text-ink-3">
                  {commissionPaid
                    ? t("contracts.assignment.commissionPaid")
                    : t("contracts.assignment.commissionPending")}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <EmptyState
          icon={<FontAwesomeIcon icon={faUserTie} />}
          title={t("contracts.assignment.unassigned")}
          description={t("contracts.assignment.unassignedHint")}
        />
      )}

      {history.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-micro font-bold uppercase tracking-wider text-ink-3">
            {t("contracts.assignment.history")}
          </p>
          <ul className="mt-2 space-y-1.5">
            {history.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 text-label"
              >
                <span className="min-w-0 truncate text-ink-2">
                  {item.seller?.full_name || t("contracts.assignment.unknownSeller")}
                </span>
                <span className="shrink-0 text-micro text-ink-3">
                  {t(
                    `contracts.assignment.statusValue.${String(
                      item.status || "none"
                    ).toLowerCase()}`,
                    item.status
                  )}
                  {item.assigned_at ? ` · ${formatDate(item.assigned_at)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

AssignmentCard.propTypes = {
  contract: PropTypes.object,
  history: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onReassign: PropTypes.func,
};

export default memo(AssignmentCard);
