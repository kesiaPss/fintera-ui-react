import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../locales/en.json";
import ExportDropdown from "./ExportDropdown";
import { reportsApi } from "@/shared/api/reports";

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

vi.mock("@/shared/api/reports", () => ({
  reportsApi: {
    downloadReport: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

const REPORTS = [
  "Operations report",
  "Commissions",
  "Revenue flow",
  "Overdue payments",
];

const FORMATS = ["CSV", "Excel", "PDF"];

const originalCreateObjectURL = window.URL.createObjectURL;
const originalRevokeObjectURL = window.URL.revokeObjectURL;

const renderDropdown = (props = {}) =>
  render(
    <ExportDropdown
      startDate="2026-11-01"
      endDate="2026-11-30"
      onExportBase={vi.fn()}
      {...props}
    />
  );

const openDropdown = () =>
  fireEvent.click(screen.getByRole("button", { name: "Export" }));

beforeEach(() => {
  reportsApi.downloadReport.mockReset();
  showToast.mockReset();
  window.URL.createObjectURL = vi.fn(() => "blob:report");
  window.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  window.URL.createObjectURL = originalCreateObjectURL;
  window.URL.revokeObjectURL = originalRevokeObjectURL;
  vi.restoreAllMocks();
});

describe("ExportDropdown formats", () => {
  it("shows the three download formats for every report", () => {
    renderDropdown();
    openDropdown();

    REPORTS.forEach((report) => {
      FORMATS.forEach((format) => {
        expect(
          screen.getByRole("button", {
            name: `Download ${report} as ${format}`,
          })
        ).toBeInTheDocument();
      });
    });
  });

  it("downloads a financial report in the selected format", async () => {
    reportsApi.downloadReport.mockResolvedValue(new Blob(["report"]));
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderDropdown();
    openDropdown();

    fireEvent.click(
      screen.getByRole("button", { name: "Download Commissions as PDF" })
    );

    await waitFor(() =>
      expect(reportsApi.downloadReport).toHaveBeenCalledWith(
        "commissions_export",
        { start_date: "2026-11-01", end_date: "2026-11-30" },
        "pdf"
      )
    );
    expect(showToast).toHaveBeenCalledWith("Download successful", "success");

    clickSpy.mockRestore();
  });

  it("downloads overdue payments without requiring a date range", async () => {
    reportsApi.downloadReport.mockResolvedValue(new Blob(["report"]));
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderDropdown({ startDate: undefined, endDate: undefined });
    openDropdown();

    fireEvent.click(
      screen.getByRole("button", { name: "Download Overdue payments as CSV" })
    );

    await waitFor(() =>
      expect(reportsApi.downloadReport).toHaveBeenCalledWith(
        "overdue_export",
        {},
        "csv"
      )
    );
    expect(showToast).not.toHaveBeenCalledWith(
      "Please select both start and end dates",
      "error"
    );

    clickSpy.mockRestore();
  });

  it("offers CSV, Excel and PDF for the operations report", async () => {
    const onExportBase = vi.fn().mockResolvedValue(undefined);

    renderDropdown({ onExportBase });
    openDropdown();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download Operations report as Excel",
      })
    );

    await waitFor(() => expect(onExportBase).toHaveBeenCalledWith("xlsx"));
  });
});
