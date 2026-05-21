# Application Feature Flow

This document explains how the main features of the application work end to end, from the React frontend to the NestJS backend.

The codebase is split into two parts:

- Frontend: `Blacklist-main/` uses React, Vite, React Router, Axios, and local UI state.
- Backend: `pfe/` uses NestJS, TypeORM, PostgreSQL, JWT guards, event emitters, Elasticsearch, and supporting services such as webhooks and notifications.

## 1. High-Level Architecture

The frontend is responsible for:

- Rendering the user interface.
- Managing page state, filters, modals, and tables.
- Sending API requests through a shared Axios client.
- Storing the session token and user profile in `localStorage`.

The backend is responsible for:

- Authenticating and authorizing requests.
- Reading and writing data in PostgreSQL through TypeORM.
- Handling blacklist ingestion, archived records, audit logs, users, webhooks, and system settings.
- Exposing REST controllers that the frontend calls directly.

The communication pattern is simple:

1. The user interacts with a page in the React app.
2. The page calls a service in `src/services/`.
3. That service uses the shared Axios instance in `src/services/api.js`.
4. Axios attaches the JWT access token from `localStorage` when present.
5. NestJS receives the request in the matching controller.
6. The controller delegates to a service and repository layer.
7. The backend returns JSON, and the frontend updates the page state.

## 2. Cross-Cutting Pieces

### Authentication state

The frontend keeps the session in `src/context/AuthContext.jsx`.

- `login(token, userData)` stores both values in `localStorage`.
- `logout()` removes them.
- On page load, the provider reads the stored token and user object back into React state.

The protected layout in `src/components/layout/ProtectedRoute.jsx` checks whether the user is authenticated before rendering the app shell.

### Shared API client

`src/services/api.js` creates one Axios instance for all requests.

- The base URL comes from `VITE_API_URL` when it is set.
- If it is not set, the client falls back to the deployed backend URL.
- Every request includes `Authorization: Bearer <token>` when a token exists.
- If the backend returns `401`, the token is removed from `localStorage`.

This keeps session handling centralized instead of repeating it in every feature.

### App shell and navigation

`src/App.jsx` renders the shared layout:

- `Sidebar` on the left.
- `Navbar` at the top.
- An `Outlet` in the main area for routed pages.

The current router in `src/main.jsx` exposes these routes:

- `/login`
- `/confirm-account`
- `/forgot-password`
- `/app/blacklists`
- `/app/archives`
- `/app/distribution`
- `/app/logs`
- `/app/users`
- `/app/settings`

There is also an `Entries` page stub in the frontend, but it is not currently wired into the router.

## 3. Feature Breakdown

### A. Authentication

#### Frontend behavior

The login flow lives in `src/pages/auth/Login.jsx`.

1. The user enters a work email.
2. The frontend calls `authService.login(email)`.
3. If the backend accepts the request, an OTP modal opens.
4. The user verifies the OTP through the auth service.
5. After verification, the app stores the token and user profile and enters the protected area.

The confirm-account screen in `src/pages/auth/ConfirmAccount.jsx` handles account activation through a token in the URL query string.

#### Backend behavior

The auth controller in `pfe/src/auth/auth.controller.ts` exposes:

- `POST /auth/login`
- `POST /auth/otp/verify`
- `POST /auth/otp/send`

The user controller in `pfe/src/user/user.controller.ts` also exposes:

- `POST /user/confirm/:token`

The backend is built around JWT-protected requests after login. Most business routes are guarded by `JwtAuthGuard`, and some user-admin routes also use `RolesGuard`.

#### What this means in practice

Authentication is not just a page transition. It is the gate that enables every protected feature:

- Without a token, the frontend redirects to `/login`.
- With a token, Axios automatically sends it to the backend.
- The backend validates the token before allowing access to protected data.

### B. Blacklists

This is the main operational feature of the application.

#### Frontend behavior

The blacklist page is `src/pages/blacklists/Blacklists.jsx`.

It does four main things:

- Loads batches from the backend on page mount.
- Filters results by search text and status.
- Opens modals to create, edit, or inspect a batch.
- Deletes a batch by archiving it instead of hard-deleting it.

The page supports several ingestion paths:

- Manual creation.
- File upload.
- URL import.
- Bulk creation from an array of entries.

The frontend decides which creation path to use based on the payload returned by the modal layer:

- `payload.file` goes to file upload.
- `payload.url` goes to URL import.
- `payload.manualData` goes to bulk create.
- Otherwise, it falls back to direct create.

The visible counters at the top of the page are calculated in the browser from the loaded data.

#### Backend behavior

The matching backend controller is `pfe/src/sanctioned-entity/sanctioned-entity.controller.ts`.

Important endpoints include:

- `GET /sanctioned-entity`
- `POST /sanctioned-entity`
- `PATCH /sanctioned-entity/:id`
- `DELETE /sanctioned-entity/:id`
- `POST /sanctioned-entity/bulk`
- `POST /sanctioned-entity/upload`
- `POST /sanctioned-entity/import-url`
- `GET /sanctioned-entity/archived`
- `PATCH /sanctioned-entity/:id/restore`
- `DELETE /sanctioned-entity/:id/permanent`
- `GET /sanctioned-entity/stats`
- `POST /sanctioned-entity/extract`

The controller delegates to `SanctionedEntityService`, which is where the actual persistence and transformation logic lives.

#### How the flow works end to end

When the user adds a blacklist batch:

1. The modal collects metadata and the selected ingestion method.
2. The page calls `blacklistService`.
3. The Axios client sends the request with the JWT token.
4. The backend stores the batch and its entries.
5. The frontend refreshes the list and updates the table.

When the user deletes a blacklist batch:

1. The frontend confirms the action.
2. It calls `DELETE /sanctioned-entity/:id`.
3. The backend archives the batch rather than removing it immediately.
4. The UI refreshes and the item disappears from the active list.

### C. Archives

The archive page is `src/pages/archives/Archives.jsx`.

#### Frontend behavior

This page is the recovery view for soft-deleted blacklists.

It:

- Loads archived batches through `blacklistService.getArchivedBlacklists()`.
- Displays the deleted date, source, and entry count.
- Lets the user restore a batch.
- Lets the user permanently delete a batch.

#### Backend behavior

The archive flow is backed by the same sanctioned-entity controller:

- `GET /sanctioned-entity/archived`
- `PATCH /sanctioned-entity/:id/restore`
- `DELETE /sanctioned-entity/:id/permanent`

#### Flow summary

Soft deletion is the default safety mechanism:

- The active list removes the batch.
- The archive keeps the batch recoverable.
- Restore moves the batch back to the active set.
- Permanent delete removes it fully.

### D. Distribution and Webhooks

The distribution page is `src/pages/distribution/Distribution.jsx`.

#### Frontend behavior

This screen combines three concerns:

- Webhook target management.
- Delivery history.
- Distribution settings.

The page loads these datasets in parallel:

- Webhook targets.
- Webhook deliveries.
- Blacklists.
- System settings.

It uses the `AUTO_DISTRIBUTION_ENABLED` setting to control automatic distribution.

Users can also:

- Create or edit a destination.
- Test a target connection.
- Manually trigger delivery for a selected batch and target.
- Inspect a delivery payload, response, and headers in a large JSON viewer.

#### Backend behavior

The backend webhook controller is `pfe/src/webhook/webhook.controller.ts`.

It exposes:

- `GET /webhooks/targets`
- `POST /webhooks/targets`
- `PUT /webhooks/targets/:id`
- `DELETE /webhooks/targets/:id`
- `GET /webhooks/deliveries`
- `POST /webhooks/test-delivery`

The system setting controller is `pfe/src/system-setting/system-setting.controller.ts`.

It exposes:

- `GET /system-settings`
- `GET /system-settings/:key`
- `PATCH /system-settings/:key`

#### Flow summary

Distribution works like this:

1. The frontend loads the list of active blacklists and webhook destinations.
2. The backend returns saved delivery records and the current toggle state.
3. The operator creates or updates a webhook target.
4. A manual test dispatch sends a batch to the chosen target.
5. Delivery results appear back in the table.

This feature is the bridge between blacklist data and downstream systems.

### E. Audit Logs

The audit page is `src/pages/audit/Audit.jsx`.

#### Frontend behavior

This page displays historical system events.

It:

- Fetches the audit log list when the page loads.
- Shows loading and error states.
- Filters the list through the table component.
- Lets the user request deletion of a row in the UI.

The current UI delete action is only partially wired. The component removes the row locally, but the backend delete call is commented out.

#### Backend behavior

The audit controller is `pfe/src/audit-log/audit-log.controller.ts`.

It supports full CRUD:

- `POST /audit-log`
- `GET /audit-log`
- `GET /audit-log/:id`
- `PATCH /audit-log/:id`
- `DELETE /audit-log/:id`

The service in `pfe/src/audit-log/audit-log.service.ts` reads audit logs with the related user entity and orders them newest first.

#### Flow summary

The audit feature is mainly read-oriented in the frontend, but the backend is ready for full persistence and maintenance of log rows.

### F. Users

The users page is `src/pages/users/Users.jsx`.

#### Frontend behavior

This screen manages team accounts.

It:

- Loads the user list.
- Opens a modal to invite a new user.
- Opens a modal to edit an existing user.
- Confirms deletion before removing a user.

The page uses `src/services/userService.js` for the API calls.

#### Backend behavior

The backend user controller is `pfe/src/user/user.controller.ts`.

It exposes:

- `POST /user`
- `GET /user`
- `GET /user/:id`
- `PATCH /user/:id`
- `DELETE /user/:id`
- `POST /user/confirm/:token`

Authorization rules matter here:

- Listing users requires a valid JWT.
- Creating, updating, and deleting users require both a valid JWT and an allowed role.
- The controller uses `RolesGuard` and `RoleEnum.SUPER_ADMIN` or `RoleEnum.ADMIN` for privileged operations.

#### Flow summary

User administration is enforced on the backend, but rendered with simple table and modal interactions on the frontend.

### G. Account Confirmation and OTP Verification

These are supporting auth flows, but they are user-visible and important.

#### Account confirmation

`src/pages/auth/ConfirmAccount.jsx` reads a `token` from the URL and calls `userService.confirmAccount(token)`.

That maps to `POST /user/confirm/:token` on the backend.

This flow is meant to activate an account before the user logs in.

#### OTP verification

`src/pages/auth/Login.jsx` opens an OTP modal after the initial login request succeeds.

The auth service supports:

- `POST /auth/login`
- `POST /auth/otp/verify`
- `POST /auth/otp/send`

This makes the login flow two-step instead of a single password-based form.

### H. Settings and System Settings

The routed settings page exists in `src/pages/Settings.jsx`, but the component is currently empty.

That said, system settings are already used by the distribution page through `webhookService.getSettings()` and `webhookService.updateSetting()`.

So there are effectively two layers here:

- A visible settings route in the frontend.
- A working backend system-settings API powering distribution behavior.

### I. Entries

`src/pages/entries/Entries.jsx` currently renders a placeholder message.

At the backend level, the sanctioned-entity module already exposes entry-level operations:

- `GET /sanctioned-entity/:id/entries`
- `POST /sanctioned-entity/:id/entries`
- `PATCH /sanctioned-entity/entries/:entryId`
- `DELETE /sanctioned-entity/entries/:entryId`

This means the data model for per-entry management exists, even though the active frontend route does not yet use it.

## 4. Backend Support Modules

The backend contains several modules that support the platform even when they are not directly exposed in the current navigation.

These include:

- `notification` for user notifications.
- `requisition` for requests and approvals.
- `review` for review workflows.
- `export-job` and `export-row` for export generation.
- `sync-run` and `synced-entity` for synchronization tracking.
- `evidence-document` for document storage and retrieval.
- `entity-profile`, `individual-profile`, `organization-profile`, `vessel-profile`, `entity-name`, `entity-address`, `entity-status`, `entity-date-of-birth`, and `entity-bank-account` for structured entity data.
- `external-source` for upstream source tracking.
- `aggregate-snapshot` for derived state.
- `database` and `system-setting` for platform-level management.

These modules show that the API is broader than the current React navigation. Some are already used indirectly by existing features, and others look ready for future screens.

## 5. Important Implementation Notes

- The frontend uses local storage for session persistence, so a browser refresh does not log the user out immediately.
- The blacklist delete action is designed as archive-first behavior.
- The archive page is the recovery point for soft-deleted batches.
- The distribution page is where webhook delivery, test dispatch, and system settings meet.
- The audit page currently behaves like a read-only viewer in the UI.
- The `Entries` and `Settings` routes are placeholders or partial screens right now.

## 6. In One Sentence Per Feature

- Authentication: the frontend obtains and stores a token, and the backend verifies it before allowing access.
- Blacklists: the frontend creates and manages batches, while the backend stores, imports, validates, and archives them.
- Archives: soft-deleted batches can be restored or permanently removed.
- Distribution: saved webhook targets receive blacklist data through test or manual delivery flows.
- Audit Logs: the frontend displays activity history backed by the audit-log module.
- Users: admins can invite, update, and remove accounts through a role-protected API.
- Settings: system settings are stored centrally in the backend and used by distribution behavior.

If you want, I can also turn this into a more polished architecture doc with a diagram and a feature-by-feature sequence flow.