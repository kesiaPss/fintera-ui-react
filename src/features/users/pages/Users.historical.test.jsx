import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter } from "react-router-dom";

import Users from "./index";
import AuthContext from "../../../contexts/AuthContext";
import { usersApi } from "../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../api", () => ({
  usersApi: {
    list: vi.fn(),
    getStats: vi.fn(),
    toggleStatus: vi.fn(),
    resendConfirmation: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../contexts/LocaleContext", () => {
  const t = (key) => key;
  return { useLocale: () => ({ t, locale: "es" }) };
});

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../components/RightSidebar", () => ({
  default: () => <div data-testid="drawer" />,
}));

const historicalUser = {
  id: 10,
  full_name: "Cliente Histórico",
  email: "historico+0801@fintera.local",
  role: "user",
  status: "active",
  historical_client: true,
};

const renderUsers = () =>
  render(
    <MemoryRouter initialEntries={["/users"]}>
      <AuthContext.Provider value={{ user: { id: 99, role: "admin" } }}>
        <Users />
      </AuthContext.Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  usersApi.getStats.mockResolvedValue({
    total: 2,
    admin: 1,
    seller: 0,
    user: 1,
    historical: 1,
  });
  usersApi.list.mockResolvedValue({
    users: [historicalUser],
    pagination: { total: 1, pages: 1 },
  });
});

describe("Users historical clients", () => {
  it("shows the historical chip and hides the placeholder email", async () => {
    renderUsers();

    expect(
      (await screen.findAllByText("Cliente Histórico"))[0]
    ).toBeInTheDocument();
    expect(screen.getAllByText("users.historical")[0]).toBeInTheDocument();
    expect(screen.getAllByText("users.noEmail")[0]).toBeInTheDocument();
    expect(screen.queryByText("historico+0801@fintera.local")).toBeNull();
  });

  it("filters by historical clients and hides the invite action", async () => {
    renderUsers();

    await screen.findAllByText("Cliente Histórico");
    fireEvent.click(screen.getByRole("button", { name: /users\.filterHistorical/ }));

    await waitFor(() =>
      expect(usersApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ historical: "1" })
      )
    );

    fireEvent.click(screen.getAllByRole("button", { name: "common.actions" })[0]);
    expect(
      screen.queryByRole("menuitem", { name: "users.invite" })
    ).not.toBeInTheDocument();
  });
});
