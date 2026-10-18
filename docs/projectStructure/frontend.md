# Frontend Structure

## Stack

| Technology          | Version     | Purpose                                        |
| ------------------- | ----------- | ---------------------------------------------- |
| Next.js             | 16          | React framework (App Router, Turbopack)        |
| React               | 19          | UI library                                     |
| TypeScript          | 5.7         | Type safety                                    |
| Tailwind CSS        | 4           | Utility-first CSS (via `@tailwindcss/postcss`) |
| shadcn/ui           | latest      | Accessible component primitives on `radix-ui`  |
| react-pdf           | 10.5        | PDF rendering                                  |
| react-konva / konva | 19.2 / 10.3 | Canvas-based PDF annotation                    |
| lucide-react        | 1.16        | Icons                                          |

Styling is Tailwind CSS v4 with shadcn/ui primitives. There are no CSS modules — the
only stylesheet is `src/app/globals.css` (design tokens + base layer).

## Directory Layout

```
apps/web/
├── src/
│   ├── app/                          # Pages (App Router file-based routing)
│   │   ├── layout.tsx                # Root layout (html/body/metadata, Providers)
│   │   ├── globals.css               # Tailwind import + design tokens (only stylesheet)
│   │   ├── manifest.ts               # Web app manifest
│   │   ├── (auth)/                   # Authenticated route group (AuthGuard + AppShell)
│   │   │   ├── layout.tsx            # AuthGuard + AppShell wrapper
│   │   │   ├── page.tsx              # Dashboard (/)
│   │   │   ├── groups/               # /groups, /groups/[id]
│   │   │   │   ├── page.tsx          # Groups directory
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Group overview
│   │   │   │       ├── documents/new/page.tsx   # New document / new version
│   │   │   │       └── reviews/[reviewId]/workspace/page.tsx  # Review workspace
│   │   │   ├── submissions/page.tsx  # /submissions
│   │   │   └── admin/                # /admin/users, /admin/faculties
│   │   └── login/                    # /login (public) + forgot-password/
│   ├── components/
│   │   ├── aegis/                    # App UI components
│   │   │   ├── AppShell.tsx          # Sidebar + topbar layout
│   │   │   ├── AuthGuard.tsx         # Redirects to /login if unauthenticated
│   │   │   ├── Brand.tsx             # Logo + brand
│   │   │   ├── DocumentTree.tsx      # Version tree (builder + list)
│   │   │   ├── MemberAutocomplete.tsx# Popover + Command combobox
│   │   │   ├── NavigationPage.tsx    # Reusable card-grid page
│   │   │   ├── NewGroupDialog.tsx    # Create-group dialog
│   │   │   ├── PageContainer.tsx     # Centered content column
│   │   │   ├── Providers.tsx         # Client providers (TooltipProvider)
│   │   │   ├── ReviewWorkspace.tsx   # Full review workspace
│   │   │   ├── SessionWarning.tsx    # Session expiry warning dialog
│   │   │   ├── StatusPill.tsx        # Review status badge
│   │   │   ├── TokenSync.tsx         # Bridges React auth state to apiFetch
│   │   │   ├── TypeBadge.tsx         # Document type badge
│   │   │   └── VersionChain.tsx      # Version lineage chips
│   │   ├── pdf-annotator/            # PDF annotation subsystem (konva)
│   │   │   ├── PdfAnnotator.tsx      # Main annotator component
│   │   │   ├── Toolbar.tsx           # Annotation toolbar
│   │   │   ├── types.ts              # Shared types
│   │   │   ├── text-layer-helpers.ts # PDF text layer utilities
│   │   │   ├── annotations/          # Shape components (Highlight, Rectangle, Circle, Ellipse)
│   │   │   └── previews/             # Preview thumbnails (same shapes)
│   │   └── ui/                       # shadcn/ui primitives (generated)
│   ├── hooks/                        # Custom React hooks
│   │   ├── useFetch.ts               # Base fetch hook
│   │   ├── useGroups.ts              # Groups list
│   │   ├── useGroup.ts               # Single group
│   │   ├── useDocuments.ts           # Documents list
│   │   ├── useReviews.ts             # Reviews list
│   │   └── useReview.ts              # Single review
│   └── lib/
│       ├── auth-context.tsx          # Auth provider (JWT, refresh, proactive renewal)
│       └── api-config.ts             # Injects the API base URL into @aegis/api-client
├── public/                           # Static assets (logos, favicons)
├── next.config.ts                    # output: "standalone", transpilePackages
├── postcss.config.mjs                # @tailwindcss/postcss
├── components.json                   # shadcn/ui config (aliases, style)
├── tsconfig.json                     # Path alias: @/* -> ./src/*
└── package.json
```

## Routing

File-based routing under `src/app/`. The `(auth)` route group wraps all protected pages with `AuthGuard` + `AppShell` via its `layout.tsx`.

| Route                                       | Description                                  | Auth                |
| ------------------------------------------- | -------------------------------------------- | ------------------- |
| `/`                                         | Dashboard with metrics                       | Yes                 |
| `/login`                                    | Sign-in form                                 | No                  |
| `/login/forgot-password`                    | Password recovery                            | No                  |
| `/groups`                                   | Research groups directory                    | Yes                 |
| `/groups/[id]`                              | Group overview (documents, members, reviews) | Yes                 |
| `/groups/[id]/documents/new`                | New document / new version form              | Yes                 |
| `/groups/[id]/reviews/[reviewId]/workspace` | Full review workspace (Client Component)     | Yes (own AuthGuard) |
| `/submissions`                              | User submissions                             | Yes                 |
| `/admin/users`                              | User administration                          | Yes (admin only)    |
| `/admin/faculties`                          | Faculty administration                       | Yes (admin only)    |

## Component Types

- **Server Components** (default) -- Pages that render on the server, no interactivity
- **Client Components** (`"use client"`) -- Interactive components: `AppShell`, `ReviewWorkspace`, `PdfAnnotator`, `AuthGuard`, `SessionWarning`, `TokenSync`

## API Client

The API layer lives in the shared `@aegis/api-client` package (`packages/node/api-client/`):

- `src/client.ts` -- `apiFetch<T>()` wrapper with Bearer token injection, 401 interceptor, coalesced token refresh, and automatic retry
- `src/api/auth.ts` -- `login()`, `refreshAccessToken()`, `logoutUser()`, `getMe()`
- `src/api/users.ts`, `groups.ts`, `reviews.ts`, `documents.ts`, `annotations.ts`, `faculties.ts` -- Domain-specific API calls
- Shared TypeScript types, the review state machine and display utils live in `@aegis/domain` (`packages/node/domain/`)

All HTTP calls go through `@aegis/api-client`; components never call `fetch` directly (the one
exception is the workspace, which fetches the PDF blob with the auth token).

## Authentication

JWT-based with refresh token rotation. See [docs/auth.md](../auth.md) for full details.

Key components:

- `auth-context.tsx` -- React Context provider with proactive refresh (5 min before expiry)
- `TokenSync.tsx` -- Bridges React auth state to the module-level `apiFetch`
- `AuthGuard.tsx` -- Route protection (used in `(auth)/layout.tsx` and the workspace page)
- `SessionWarning.tsx` -- Dialog warning when session is about to expire

## Hooks

Custom hooks in `src/hooks/` encapsulate data fetching:

| Hook           | Purpose                                  |
| -------------- | ---------------------------------------- |
| `useFetch`     | Base fetch hook with loading/error state |
| `useGroups`    | Fetches paginated groups list            |
| `useGroup`     | Fetches a single group by ID             |
| `useDocuments` | Fetches paginated documents list         |
| `useReviews`   | Fetches paginated reviews list           |
| `useReview`    | Fetches a single review by ID            |

## Styling

Tailwind CSS v4 + shadcn/ui. There are no CSS module files; all styling lives in
`src/app/globals.css` (tokens) plus utility classes in the JSX.

- **Tokens:** `globals.css` defines the green academic palette as CSS variables (`--primary: #005134`,
  `--background`, `--card`, `--border`, `--success/--warning/--info`, ...), exposes them to Tailwind via
  `@theme inline`, and sets `--radius`. Dark mode tokens exist under `.dark`, but the app has no toggle.
- **Base layer:** body typography (Aptos/Inter/Segoe UI stack), headings, `code`, `.eyebrow`.
- **Primitives:** `src/components/ui/` holds the generated shadcn/ui components (Button, Input, Label,
  Select, Dialog, AlertDialog, DropdownMenu, Sheet, Badge, Card, Separator, Table, Tooltip, Popover,
  Command, Skeleton, Avatar, Textarea). They import `cn` from the `cn` package.
- **Layout:** `PageContainer` provides the centered content column; pages compose plain Tailwind utilities.
- **Numeric enums:** serialized as numbers by the API; normalize with `normalizeReviewStatus` /
  `normalizeDocumentType` from `@aegis/domain` before display.
