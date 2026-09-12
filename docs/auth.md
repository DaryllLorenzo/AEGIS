# Authentication — AEGIS

## Overview

AEGIS uses JWT (JSON Web Tokens) with refresh tokens for authentication. The access token has a short lifetime (24 hours) and the refresh token has a long lifetime (7 days). When the access token expires, the frontend automatically refreshes it using the refresh token without the user needing to re-enter credentials.

---

## Backend (apps/api)

### Tokens

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token | 24 hours | localStorage (FE) | Authenticate each API request |
| Refresh Token | 7 days | localStorage (FE) + DB (BE) | Renew the access token |

### Authentication endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/users/login` | No | Login, returns access + refresh token |
| POST | `/api/users/refresh` | No | Renews tokens with a valid refresh token |
| POST | `/api/users/logout` | Yes | Revokes the refresh token |
| GET | `/api/users/me` | Yes | Validates that the token is valid |

### Login (`POST /api/users/login`)

**Request:**
```json
{
  "email": "admin@aegis.com",
  "password": "Admin1234!"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "email": "admin@aegis.com",
  "displayName": "Admin",
  "expiresAt": "2026-09-13T12:00:00Z"
}
```

**Response 401:** Invalid credentials.

### Refresh (`POST /api/users/refresh`)

Called when the access token is about to expire or has already expired.

**Request:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "nuevoRefreshToken...",
  "expiresAt": "2026-09-13T12:00:00Z"
}
```

**Response 401:** Refresh token invalid or expired.

**Note:** The refresh token is rotated on each use. The previous token is revoked and a new one is issued. This prevents a stolen token from being used multiple times.

### Logout (`POST /api/users/logout`)

**Request:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response 200:**
```json
{
  "success": true
}
```

The refresh token is marked as revoked in the database and cannot be used again.

### RefreshTokens table

```
Id          GUID (PK)
UserId      GUID (FK -> Users)
Token       VARCHAR(500) UNIQUE
ExpiresAt   TIMESTAMP
IsRevoked   BOOLEAN
CreatedAt   TIMESTAMP
```

### Backend flow

```
Login
  |-- Validate credentials (email + bcrypt)
  |-- Generate access token (JwtTokenService)
  |-- Generate refresh token (RefreshTokenService)
  |-- Save refresh token to DB
  |-- Return both tokens

Refresh
  |-- Look up refresh token in DB
  |-- Verify it is not revoked or expired
  |-- Revoke the previous refresh token (rotation)
  |-- Generate new access token
  |-- Generate new refresh token
  |-- Save new refresh token to DB
  |-- Return new tokens

Logout
  |-- Look up refresh token in DB
  |-- Mark as revoked
  |-- Return success
```

### Services

| Service | Responsibility |
|---------|----------------|
| `JwtTokenService` | Generates and validates JWT access tokens |
| `RefreshTokenService` | Generates, validates, and revokes refresh tokens |

### Feature slices

| Feature | Endpoint | Handler | Request | Notes |
|---------|----------|---------|---------|-------|
| Login | `LoginEndpoint.cs` | `LoginHandler.cs` | `LoginRequest.cs` | Returns `LoginResponse` with both tokens |
| Refresh | `RefreshEndpoint.cs` | `RefreshHandler.cs` | `RefreshRequest.cs` | Token rotation on each use |
| Logout | `LogoutEndpoint.cs` | `LogoutHandler.cs` | `LogoutRequest.cs` | Revokes the refresh token |
| WhoAmI | `WhoAmIEndpoint.cs` | — | — | `GET /api/users/me`, validates the token |

---

## Frontend (apps/web)

### Key files

| File | Responsibility |
|------|----------------|
| `lib/auth-context.tsx` | Auth provider, auth state, login/logout, server-side validation, proactive refresh |
| `lib/api/client.ts` | `apiFetch()` with 401 interceptor and auto-refresh |
| `lib/api/auth.ts` | `login()`, `refreshAccessToken()`, `logoutUser()`, `getMe()` functions |
| `components/aegis/TokenSync.tsx` | Syncs token from React to `apiFetch` module, registers handlers |
| `components/aegis/AuthGuard.tsx` | Redirects to `/login` if no authenticated user |
| `components/aegis/SessionWarning.tsx` | Modal warning 5 minutes before expiry |
| `app/login/page.tsx` | Login form |

### localStorage keys

| Key | Value |
|-----|-------|
| `aegis_token` | JWT access token |
| `aegis_refresh_token` | Refresh token |
| `aegis_expires_at` | Access token expiry date |

### Initialization flow

When the app loads (page reload):

```
1. Read tokens from localStorage
2. If no token -> user not authenticated
3. If token is expired locally:
   a. Attempt refresh with refresh token
   b. If success -> save new tokens, set user
   c. If failure -> clear tokens, user not authenticated
4. If token is not expired locally:
   a. Call GET /api/users/me to validate server-side
   b. If 200 -> set user
   c. If 401 -> clear tokens, user not authenticated
```

### 401 interceptor in `apiFetch`

Every `apiFetch()` call goes through this interceptor:

```
1. Make request with Bearer token
2. If response is 200 -> return data
3. If response is 401:
   a. If refresh already in progress -> wait for its result
   b. If not -> attempt silent refresh
   c. If refresh succeeds -> retry original request with new token
   d. If refresh fails -> redirect to /login
4. If response is other error -> throw exception
```

### Proactive refresh (early renewal)

The system schedules an automatic refresh **5 minutes before** the access token expires:

```
1. On login or refresh, calculate token expiry
2. Schedule timer: expiresAt - 5 minutes
3. When timer fires -> call POST /api/users/refresh
4. Save new tokens and re-schedule timer
```

This prevents the user from experiencing an unexpected 401 while working.

### Session Warning (modal)

- Shows when **less than 5 minutes** of session remain
- Warns the user to save their work
- Offers "Sign out now" or "Dismiss"
- Closes automatically when the token is renewed

### AuthGuard

Wraps all protected pages through the `(auth)` route group layout:

```
src/app/(auth)/layout.tsx
  |-- AuthGuard
       |-- AppShell
            |-- {children}
```

`AuthGuard` checks:
- If `loading` is `true` -> shows spinner
- If `user` is `null` -> redirects to `/login`
- If `user` exists -> renders children

### Workspace page

The `/reviews/[id]/workspace` page is **outside** the `(auth)` group because it uses `ReviewWorkspace` with its own complete layout. It has `AuthGuard` directly in the component:

```tsx
// src/app/reviews/[id]/workspace/page.tsx
export default function WorkspacePage() {
  return (
    <AuthGuard>
      <ReviewWorkspace reviewId={reviewId} />
    </AuthGuard>
  );
}
```

### JWT decoding

The JWT payload is decoded in `decodeJwtPayload()` (exported from `auth-context.tsx`). It extracts Microsoft identity claims:

| Claim | Field |
|-------|-------|
| `nameidentifier` | `userId` |
| `emailaddress` | `email` |
| `name` | `displayName` |
| `role` | `roles[]` |

### Complete flow diagram

```
                    +-------------+
                    |    User     |
                    +------+------+
                           |
                    +------v------+
                    |    Login    |
                    |   (FE form) |
                    +------+------+
                           | POST /api/users/login
                    +------v------+
                    |   Backend   |
                    |  Validates  |
                    | credentials |
                    +------+------+
                           |
              +------------v------------+
              |  Returns:               |
              |  - accessToken          |
              |  - refreshToken         |
              |  - expiresAt            |
              +------------+------------+
                           |
              +------------v------------+
              |  Frontend:              |
              |  - Save to localStorage |
              |  - Schedule refresh     |
              |  - Redirect to /        |
              +------------+------------+
                           |
                    +------v------+
                    |    App      |
                    |   (auth)    |
                    +------+------+
                           |
              +------------v------------+
              |  Each API request:      |
              |  apiFetch() adds        |
              |  Bearer token           |
              +------------+------------+
                           |
                    +------v------+
                    |  401?       |
                    +------+------+
                     Yes  |    No
              +----------+    +----------+
              |                     |
     +--------v--------+  +--------v--------+
     |  Auto-refresh   |  |  Return data    |
     |  POST /refresh  |  +-----------------+
     +--------+--------+
              |
         +----v----+
         | Success? |
         +----+----+
          Yes |   No
     +--------+    +--------+
     |                    |
+----v--------+          |
| Retry       |          |
| request     |          |
+-------------+          |
                         |
              +----------v---------+
              |  Redirect          |
              |  /login            |
              +-------------------+
              |
              +-------------------+
              |  Timer:           |
              |  expiresAt - 5m   |
              |  -> POST /refresh |
              |  (silent)         |
              +-------------------+
              |
              +-------------------+
              |  Session Warning  |
              |  (if < 5 min)     |
              +-------------------+
              |
              +-------------------+
              |  Logout           |
              |  POST /logout     |
              |  + clear          |
              |  localStorage     |
              +-------------------+
```

---

## Security

### What is implemented

- Access token with expiry (24h)
- Refresh token with rotation (7d)
- Server-side validation on app load
- Silent auto-refresh before expiry
- Refresh token revocation on logout
- Token validation on backend (issuer, audience, signing key, lifetime)
- `httpOnly` not used (localStorage) — see note below

### localStorage vs httpOnly cookies

This project stores tokens in `localStorage`. This is acceptable when:
- Backend and frontend are on the same domain
- There is no significant CSRF risk
- The app does not handle highly sensitive data (healthcare, finance)

For apps with stricter security requirements, the recommended approach is:
- Store the access token in memory (not persisted)
- Store the refresh token in an `httpOnly` cookie with `SameSite=Strict`
- Implement CSRF protection

### Tokens in URLs

Tokens are **never** passed via query parameters. They are always sent in the `Authorization: Bearer {token}` header.

### Revocation

The system supports refresh-token-level revocation:
- On logout: the specific refresh token is revoked
- For logout from all devices: all refresh tokens for a user can be revoked (the service supports it, the endpoint is not yet exposed)
