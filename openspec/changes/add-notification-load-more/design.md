## Context

`NotificationsBell` calls `notificationsApi.list({})` once on mount and stores
the returned `notifications` array. The backend returns only the first page and
the bell has no pagination state. The "Unread" tab filters the loaded array in
memory, and the badge is derived from those rows.

## Goals / Non-Goals

**Goals:**

- Load older notifications on demand with the backend cursor.
- Keep the unread badge and tab count accurate across pages.
- Keep the existing assignment-notification merge behavior.

**Non-Goals:**

- Infinite scroll or virtualization inside the dropdown.
- Polling for new notifications.
- Changing the full notifications page outside the bell.

## Decisions

### Explicit "Load more" button

The dropdown already scrolls; a button at the bottom is simple, accessible, and
works on mobile. The button renders only while `has_more` is true and is
disabled while a request is in flight.

Alternative: IntersectionObserver infinite scroll. Rejected because the
dropdown is small and an explicit button avoids surprise fetches.

### Server-side unread filter

When the user selects "No leídas", the bell resets its list and requests
`status=unread`. This makes the tab complete even when unread items span
multiple pages.

Alternative: keep filtering loaded rows in memory. Rejected because it only
shows unread items from the pages already loaded.

### Server unread count

The badge uses `unread_count` from the API instead of counting loaded rows.
`markOne` and `markAll` still update the count optimistically after a successful
request. Assignment entries are still merged for display, but the server count
already includes their unread notifications, so the badge is not double-counted.

### Page size

The bell requests `limit=20`, matching the API default.

## Risks / Trade-offs

- [New notifications arriving while paging are not shown until reload] → Cursor
  pagination prevents duplicates; a later refresh picks up new rows.
- [Filter change triggers a network request] → It is user-initiated and replaces
  the previous in-memory filtering.
- [Server unread count can drift after local mark-read] → The bell updates the
  count on success and reloads on filter changes.

## Migration Plan

Deploy the backend cursor endpoints first. The UI sends `limit`; older backends
ignore it and the bell still renders the first page, but "Load more" stays
hidden because `has_more` is absent.

## Open Questions

None.
