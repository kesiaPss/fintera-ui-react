## 1. API client

- [x] 1.1 Update `notificationsApi.list` to accept params, build a query string, and omit `?` when there are no params
- [x] 1.2 Add an API client test covering params and the empty-query case

## 2. Notifications bell

- [x] 2.1 Track `nextCursor`, `hasMore`, `total`, and `unreadCount` from the list response
- [x] 2.2 Append results when loading more and replace results on initial load or filter change
- [x] 2.3 Render a "Load more" button only while `has_more` is true and disable it while loading
- [x] 2.4 Reset the cursor and request `status=unread` when the unread filter is selected
- [x] 2.5 Use the server `unread_count` for the badge and tab labels, and update it after mark-one/mark-all
- [x] 2.6 Add `notifications.loadMore` and `notifications.loadingMore` to `en.json` and `es.json`

## 3. Tests and verification

- [x] 3.1 Add a bell test that loads the first page, clicks "Load more", and asserts the cursor request and appended row
- [x] 3.2 Add a bell test that renders the server unread count above the loaded row count
- [x] 3.3 Add a test that switching to "No leídas" requests `status=unread`
- [x] 3.4 Run `npm run verify`
