import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../locales/en.json";
import Analytics from "./index";
import { analyticsApi } from "../api";
import { projectsApi } from "@/features/projects/api";

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

vi.mock("../api", () => ({
  analyticsApi: {
    getOverview: vi.fn(),
    getDistribution: vi.fn(),
    getPerformance: vi.fn(),
    getSellers: vi.fn(),
  },
}));

vi.mock("../../payments/api", () => ({
  paymentsApi: { getStats: vi.fn() },
}));

vi.mock("@/features/projects/api", () => ({
  projectsApi: { list: vi.fn(), get: vi.fn() },
}));

vi.mock("react-chartjs-2", () => ({
  Line: () => null,
  Bar: () => null,
  Doughnut: () => null,
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

beforeEach(() => {
  analyticsApi.getOverview.mockResolvedValue({ revenue_trend: [] });
  analyticsApi.getDistribution.mockResolvedValue({});
  analyticsApi.getPerformance.mockResolvedValue([]);
  analyticsApi.getSellers.mockResolvedValue([]);
  projectsApi.list.mockResolvedValue({
    projects: [{ id: 1, name: "Altos del Valle" }],
    pagination: { total: 1 },
  });
  projectsApi.get.mockResolvedValue({ project: { id: 1, name: "Altos del Valle" } });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Analytics project filter", () => {
  it("does not request 100 projects on load", async () => {
    render(<MemoryRouter><Analytics /></MemoryRouter>);

    await waitFor(() => expect(analyticsApi.getOverview).toHaveBeenCalled());

    const requested = projectsApi.list.mock.calls.map(([params]) => params);
    expect(requested.some((params) => params.per_page === 100)).toBe(false);
  });

  it("loads projects on demand in pages of 20 when the filter opens", async () => {
    render(<MemoryRouter><Analytics /></MemoryRouter>);

    await waitFor(() => expect(analyticsApi.getOverview).toHaveBeenCalled());
    expect(projectsApi.list).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getAllByRole("button", { name: t("analytics.allProjects") })[0]
    );

    expect(
      await screen.findByRole("option", { name: "Altos del Valle" })
    ).toBeInTheDocument();
    expect(projectsApi.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 20,
      search_term: "",
    });
  });
});
