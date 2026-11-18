## Why

The notifications bell loads a single page and has no way to reach older
notifications. The backend now exposes cursor pagination
(`cursor`, `limit`, `next_cursor`, `has_more`), so the bell should append older
items on demand instead of silently dropping them.

The bell also derives its unread badge from the loaded rows. Once notifications
exceed one page, that badge undercounts.

## What Changes

- Extend `notificationsApi.list` to accept pagination and status params and to
  omit an empty query string.
- Track `nextCursor`, `hasMore`, `total`, and the server `unread_count` in
  `NotificationsBell`.
- Add a "Load more" button that requests the next cursor, appends results, and
  hides when `has_more` is false.
- Reset the list and cursor when switching between "Todas" and "No leídas", and
  request `status=unread` from the server for the unread tab.
- Use the server unread count for the bell badge and tab counts.
- Add English and Spanish strings for the load-more states.
- Add tests for loading more and for the server-provided unread count.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `notifications`: the bell gains cursor-based load more, server-side unread
  filtering, and an accurate unread count from the API.

## Impact

- `src/shared/api/notifications.js`
- `src/shared/header/NotificationsBell.jsx`
- `src/shared/header/NotificationsBell.test.jsx`
- `src/locales/en.json`, `src/locales/es.json`
