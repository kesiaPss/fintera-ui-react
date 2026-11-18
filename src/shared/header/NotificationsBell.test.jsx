import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../locales/en.json";
import NotificationsBell from "./NotificationsBell";
import { notificationsApi } from "@/shared/api/notifications";
import { sellerApi } from "@/features/seller/api";

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

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/AuthContext", async () => {
  const { createContext } = await import("react");
  return {
    default: createContext({
      user: { role: "seller", id: 2 },
      token: "token",
      loading: false,
    }),
  };
});

vi.mock("@/shared/api/notifications", () => ({
  notificationsApi: {
    list: vi.fn(),
    markAllAsRead: vi.fn(),
    markAsRead: vi.fn(),
  },
}));

vi.mock("@/features/seller/api", () => ({
  sellerApi: {
    listPendingAssignments: vi.fn(),
    acceptAssignment: vi.fn(),
  },
}));

const deadline = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const assignedAt = new Date().toISOString();

const pendingAssignment = {
  id: 4,
  status: "pending",
  accept_deadline_at: deadline,
  assigned_at: assignedAt,
  contract: {
    lot_name: "Lote 5",
    project_name: "Condominios Omega",
    amount: 300000,
    applicant_name: "Karla Mejía",
  },
};

const openBell = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
};

beforeEach(() => {
  notificationsApi.list.mockResolvedValue({ notifications: [] });
  notificationsApi.markAllAsRead.mockResolvedValue({});
  notificationsApi.markAsRead.mockResolvedValue({});
  sellerApi.listPendingAssignments.mockResolvedValue({
    assignments: [pendingAssignment],
  });
  sellerApi.acceptAssignment.mockResolvedValue({ status: "accepted" });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NotificationsBell assignments", () => {
  it("shows a pending assignment with its countdown and actions", async () => {
    render(<NotificationsBell />);

    await waitFor(() => expect(sellerApi.listPendingAssignments).toHaveBeenCalled());
    await openBell();

    expect(
      await screen.findByText("New reservation assigned")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lote 5 · L 300,000 · Client: Karla Mejía")
    ).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:\d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.getByText("TIME TO ACCEPT")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
  });

  it("accepts an assignment and shows the accepted state", async () => {
    render(<NotificationsBell />);
    await waitFor(() => expect(sellerApi.listPendingAssignments).toHaveBeenCalled());
    await openBell();

    fireEvent.click(await screen.findByRole("button", { name: "Accept" }));

    await waitFor(() =>
      expect(sellerApi.acceptAssignment).toHaveBeenCalledWith(4)
    );
    expect(await screen.findByText("ACCEPTED")).toBeInTheDocument();
    expect(
      screen.getByText("You can now follow up with the client from My clients.")
    ).toBeInTheDocument();
  });

  it("keeps the assignment visible and surfaces the error when accept fails", async () => {
    sellerApi.acceptAssignment.mockRejectedValueOnce(new Error("boom"));

    render(<NotificationsBell />);
    await waitFor(() => expect(sellerApi.listPendingAssignments).toHaveBeenCalled());
    await openBell();

    fireEvent.click(await screen.findByRole("button", { name: "Accept" }));

    expect(
      await screen.findByText("We couldn't accept the assignment.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
  });

  it("renders expired assignments and payment notifications", async () => {
    sellerApi.listPendingAssignments.mockResolvedValue({ assignments: [] });
    notificationsApi.list.mockResolvedValue({
      notifications: [
        {
          id: 11,
          title: "Assignment expired",
          message: "Lote 8 · Ciudad Coral. You didn't accept in time.",
          notification_type: "assignment_expired",
          created_at: assignedAt,
          read_at: null,
        },
        {
          id: 12,
          title: "Cobro registrado",
          message: "Milton Perez · cuota 1 de 12 · L 54,583",
          notification_type: "payment_approved",
          created_at: assignedAt,
          read_at: assignedAt,
        },
      ],
    });

    render(<NotificationsBell />);
    await waitFor(() => expect(notificationsApi.list).toHaveBeenCalled());
    await openBell();

    expect(await screen.findByText("Assignment expired")).toBeInTheDocument();
    expect(screen.getByText("TIME'S UP")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
    expect(screen.getByText("Cobro registrado")).toBeInTheDocument();
  });
});

describe("NotificationsBell pagination", () => {
  const notification = (id, title) => ({
    id,
    title,
    message: `${title} detail`,
    notification_type: "payment_overdue",
    created_at: assignedAt,
    read_at: null,
  });

  it("appends older notifications when loading more", async () => {
    sellerApi.listPendingAssignments.mockResolvedValue({ assignments: [] });
    notificationsApi.list
      .mockResolvedValueOnce({
        notifications: [notification(30, "Newest")],
        next_cursor: 30,
        has_more: true,
        unread_count: 1,
        pagination: { total: 2 },
      })
      .mockResolvedValueOnce({
        notifications: [notification(29, "Older")],
        next_cursor: null,
        has_more: false,
        unread_count: 2,
        pagination: { total: 2 },
      });

    render(<NotificationsBell />);
    await waitFor(() => expect(notificationsApi.list).toHaveBeenCalled());
    await openBell();

    fireEvent.click(await screen.findByRole("button", { name: "Load more" }));

    expect(await screen.findByText("Older")).toBeInTheDocument();
    expect(screen.getByText("Newest")).toBeInTheDocument();
    expect(notificationsApi.list).toHaveBeenLastCalledWith({
      limit: 20,
      cursor: 30,
    });
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("hides load more when the first page is the last page", async () => {
    sellerApi.listPendingAssignments.mockResolvedValue({ assignments: [] });
    notificationsApi.list.mockResolvedValue({
      notifications: [notification(1, "Only")],
      next_cursor: null,
      has_more: false,
      unread_count: 1,
      pagination: { total: 1 },
    });

    render(<NotificationsBell />);
    await waitFor(() => expect(notificationsApi.list).toHaveBeenCalled());

    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("shows the server unread count above the loaded row count", async () => {
    sellerApi.listPendingAssignments.mockResolvedValue({ assignments: [] });
    notificationsApi.list.mockResolvedValue({
      notifications: [notification(1, "Only loaded row")],
      next_cursor: 1,
      has_more: true,
      unread_count: 40,
      pagination: { total: 40 },
    });

    render(<NotificationsBell />);

    expect(await screen.findByText("40")).toBeInTheDocument();
  });

  it("requests unread notifications when the unread tab is selected", async () => {
    sellerApi.listPendingAssignments.mockResolvedValue({ assignments: [] });
    notificationsApi.list.mockResolvedValue({
      notifications: [],
      next_cursor: null,
      has_more: false,
      unread_count: 0,
      pagination: { total: 0 },
    });

    render(<NotificationsBell />);
    await waitFor(() => expect(notificationsApi.list).toHaveBeenCalled());
    await openBell();

    fireEvent.click(screen.getByRole("button", { name: "Unread 0" }));

    await waitFor(() =>
      expect(notificationsApi.list).toHaveBeenLastCalledWith({
        limit: 20,
        status: "unread",
      })
    );
  });
});
