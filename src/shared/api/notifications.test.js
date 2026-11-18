import { beforeEach, describe, expect, it, vi } from "vitest";
import { notificationsApi } from "./notifications";
import { apiClient } from "../../lib/apiClient";

vi.mock("../../lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  apiClient.get.mockResolvedValue({});
});

describe("notificationsApi.list", () => {
  it("omits the query string when there are no params", () => {
    notificationsApi.list();

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/notifications");
  });

  it("serializes pagination and status params", () => {
    notificationsApi.list({ limit: 20, cursor: 30, status: "unread" });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/notifications?limit=20&cursor=30&status=unread"
    );
  });
});
