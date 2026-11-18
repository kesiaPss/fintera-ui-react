import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

import AssignmentCard from "./AssignmentCard";

expect.extend(matchers);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "es" }),
}));

afterEach(cleanup);
const contract = {
  guid: "c1",
  seller: "Cristofer Mejía",
  seller_contact: {
    name: "Cristofer Mejía",
    phone: "+504 9999-0000",
    email: "cristofer@example.com",
  },
  assignment_status: "accepted",
  assignment_origin: "referral",
  assigned_at: "2026-11-01T10:00:00Z",
  commission_amount: 1500,
  commission_paid_at: null,
};

describe("AssignmentCard", () => {
  it("shows the assigned seller, origin, status and commission", () => {
    render(
      <AssignmentCard
        contract={contract}
        history={[
          {
            id: 1,
            status: "accepted",
            assigned_at: "2026-11-01T10:00:00Z",
            seller: { full_name: "Cristofer Mejía" },
          },
        ]}
      />
    );

    expect(screen.getByText("contracts.assignment.title")).toBeInTheDocument();
    expect(screen.getAllByText("Cristofer Mejía").length).toBeGreaterThan(0);
    expect(
      screen.getByText("contracts.assignment.statusValue.accepted")
    ).toBeInTheDocument();
    expect(
      screen.getByText("contracts.assignment.originValue.referral")
    ).toBeInTheDocument();
    expect(screen.getByText(/L 1,500/)).toBeInTheDocument();
    expect(screen.getByText("contracts.assignment.history")).toBeInTheDocument();
  });

  it("shows the unassigned state", () => {
    render(
      <AssignmentCard
        contract={{ guid: "c1", assignment_status: "none", assignment_origin: "none" }}
      />
    );

    expect(
      screen.getByText("contracts.assignment.unassigned")
    ).toBeInTheDocument();
  });

  it("lets admins open the reassignment dialog", () => {
    const onReassign = vi.fn();
    render(
      <AssignmentCard
        contract={contract}
        isAdmin
        onReassign={onReassign}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /contracts.assignment.reassign/ })
    );
    expect(onReassign).toHaveBeenCalledTimes(1);
  });
});
