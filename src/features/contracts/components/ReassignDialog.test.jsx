import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

import ReassignDialog from "./ReassignDialog";
import { sellerApi } from "@/features/seller/api";

expect.extend(matchers);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "es" }),
}));

vi.mock("@/features/seller/api", () => ({
  sellerApi: { listSellers: vi.fn() },
}));

const pendingContract = {
  guid: "c1",
  status: "pending",
  seller: "Ana",
  commission_paid_at: null,
};

beforeEach(() => {
  sellerApi.listSellers.mockResolvedValue({
    sellers: [
      { id: 12, full_name: "Cristofer Mejía", phone: "+504 9999-0000" },
      { id: 13, full_name: "Juan Pérez", phone: "+504 8888-1111" },
    ],
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ReassignDialog", () => {
  it("submits a manual assignment to the selected seller", async () => {
    const onSubmit = vi.fn();
    render(
      <ReassignDialog
        open
        contract={pendingContract}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "contracts.assignment.modeSeller" })
    );

    const seller = await screen.findByRole("radio", {
      name: /Cristofer Mejía/,
    });
    fireEvent.click(seller);
    fireEvent.click(
      screen.getByRole("button", { name: "contracts.assignment.confirm" })
    );

    expect(onSubmit).toHaveBeenCalledWith({
      mode: "seller",
      seller_id: 12,
      accept: false,
      exclude_current: false,
    });
  });

  it("uses automatic assignment by default", () => {
    const onSubmit = vi.fn();
    render(
      <ReassignDialog
        open
        contract={pendingContract}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(
      screen.getByText("contracts.assignment.automaticHint")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "contracts.assignment.confirm" })
    );
    expect(onSubmit).toHaveBeenCalledWith({
      mode: "automatic",
      seller_id: undefined,
      accept: false,
      exclude_current: true,
    });
  });

  it("warns when the commission was paid", async () => {
    const onSubmit = vi.fn();
    render(
      <ReassignDialog
        open
        contract={{ ...pendingContract, commission_paid_at: "2026-11-01" }}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(
      screen.getByText("contracts.assignment.paidWarning")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "contracts.assignment.confirm" })
    );

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ mode: "automatic" })
      )
    );
  });

  it("forces direct assignment for approved contracts", () => {
    render(
      <ReassignDialog
        open
        contract={{ ...pendingContract, status: "approved" }}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(
      screen.getByText("contracts.assignment.directRequired")
    ).toBeInTheDocument();
  });
});
