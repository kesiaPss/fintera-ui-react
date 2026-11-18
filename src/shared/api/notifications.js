import { apiClient } from "../../lib/apiClient";

export const notificationsApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const suffix = query ? `?${query}` : "";
        return apiClient.get(`/api/v1/notifications${suffix}`);
    },
    markAllAsRead: () => apiClient.post("/api/v1/notifications/mark_all_as_read"),
    markAsRead: (id) => apiClient.post(`/api/v1/notifications/${id}/mark_as_read`),
};
