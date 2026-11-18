import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../locales/en.json";
import Commissions from "./index";
import { commissionsApi } from "../api";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";

expect.extend(matchers);

const getValue = (object, path) =>
  path.split(".").reduce((current, key) => current?.[key], object);

const t = (key, params = {}) => {
  const value = getValue(en, key) ?? key;
  return Object.entries(params).reduce(
    (text, [name, replacement]) =>
      text.replaceAll(`{${name}}`, String(replacement)),
    value
  );
};

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock("../api", () => ({
  commissionsApi: {
    list: vi.fn(),
    markPaid: vi.fn(),
    applyCredit: vi.fn(),
    download: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", async () => {
  const { createContext } = await import("react");
  return { default: createContext({ user: { role: "admin" } }) };
});

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("@/shared/ui/ConfirmProvider", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, confirmDialog: vi.fn() };
});

const commissions = [
  {
    contract_id: 16,
    contract_guid: "contract-1",
    client_name: "Milton Perez",
    project: "Altos del Valle",
    lot: "Lote 011",
    seller: "Ana Vendedora",
    amount: 500000,
    commission: 25000,
    commission_paid_at: null,
    date: "2026-11-01T00:00:00Z",
  },
  {
    contract_id: 17,
    contract_guid: "contract-2",
    client_name: "Antonio Lopez",
    project: "Altos del Valle",
    lot: "Lote 012",
    seller: "Ana Vendedora",
    amount: 400000,
    commission: 20000,
    commission_paid_at: "2026-11-05T00:00:00Z",
    date: "2026-11-02T00:00:00Z",
  },
];

const credits = [
  {
    id: 9,
    seller: "Ana Vendedora",
    contract_id: 16,
    contract_guid: "contract-1",
    amount: 25000,
    status: "pending",
    created_at: "2026-11-10T00:00:00Z",
  },
];

beforeEach(() => {
  commissionsApi.list.mockReset();
  commissionsApi.markPaid.mockReset();
  commissionsApi.applyCredit.mockReset();
  commissionsApi.download.mockReset();
  confirmDialog.mockReset();
  showToast.mockReset();

  commissionsApi.list.mockResolvedValue({ commissions, credits });
  commissionsApi.applyCredit.mockResolvedValue({});
  confirmDialog.mockResolvedValue(true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Admin commissions credits", () => {
  it("shows the pending credit per seller and the net payable", async () => {
    render(<MemoryRouter><Commissions /></MemoryRouter>);

    expect(await screen.findByText("Commission credits")).toBeInTheDocument();
    expect(screen.getByText("Pending credit")).toBeInTheDocument();
    expect(screen.getByText("Recoverable from the seller")).toBeInTheDocument();
    expect(screen.getByText("Net payable")).toBeInTheDocument();
    expect(screen.getAllByText("Ana Vendedora").length).toBeGreaterThan(0);
    expect(screen.getAllByText("#16").length).toBeGreaterThan(0);
    expect(screen.getAllByText("L 25,000").length).toBeGreaterThan(0);
    expect(screen.getByText("L 0")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Apply credit" }).length
    ).toBeGreaterThan(0);
  });

  it("applies a credit and refreshes the report", async () => {
    render(<MemoryRouter><Commissions /></MemoryRouter>);

    fireEvent.click(
      (await screen.findAllByRole("button", { name: "Apply credit" }))[0]
    );

    await waitFor(() =>
      expect(commissionsApi.applyCredit).toHaveBeenCalledWith(9)
    );
    await waitFor(() => expect(commissionsApi.list).toHaveBeenCalledTimes(2));
    expect(showToast).toHaveBeenCalledWith("Commission credit applied.");
  });
});

describe("Commissions export formats", () => {
  const originalCreateObjectURL = window.URL.createObjectURL;
  const originalRevokeObjectURL = window.URL.revokeObjectURL;

  beforeEach(() => {
    window.URL.createObjectURL = vi.fn(() => "blob:commissions");
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it("offers the three formats and downloads the selected one", async () => {
    commissionsApi.download.mockResolvedValue(new Blob(["report"]));
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<MemoryRouter><Commissions /></MemoryRouter>);
    await screen.findAllByText("Ana Vendedora");

    expect(
      screen.getByRole("button", { name: "Download Commissions as CSV" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download Commissions as Excel" })
    ).toBeInTheDocument();
    const pdfButton = screen.getByRole("button", {
      name: "Download Commissions as PDF",
    });
    expect(pdfButton).toBeInTheDocument();

    fireEvent.click(pdfButton);

    await waitFor(() =>
      expect(commissionsApi.download).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "pdf"
      )
    );
    expect(showToast).toHaveBeenCalledWith("Download successful", "success");

    clickSpy.mockRestore();
  });
});
