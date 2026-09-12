# Frontend Structure

## Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | React framework (App Router, Turbopack) |
| React | 19 | UI library |
| TypeScript | 5.9 | Type safety |
| react-pdf | 10.5 | PDF rendering |
| react-konva / konva | 19.2 / 10.3 | Canvas-based PDF annotation |
| lucide-react | 1.16 | Icons |

No UI framework (Tailwind, MUI, etc.). All styling via modular CSS in `src/styles/`.

## Directory Layout

```
apps/web/
├── src/
│   ├── app/                          # Pages (App Router file-based routing)
│   │   ├── layout.tsx                # Root layout (html/body/metadata, Providers)
│   │   ├── globals.css               # CSS imports for all style modules
│   │   ├── (auth)/                   # Authenticated route group
│   │   │   ├── layout.tsx            # AuthGuard + AppShell wrapper
│   │   │   ├── page.tsx              # Dashboard (/)
│   │   │   ├── profile/              # /profile
│   │   │   ├── settings/             # /settings
│   │   │   ├── notifications/        # /notifications
│   │   │   ├── submissions/          # /submissions, /submissions/new
│   │   │   ├── reviews/              # /reviews, /reviews/[id]
│   │   │   └── groups/               # /groups, /groups/[id]/* (documents, members, reviews, activity, discussion)
│   │   ├── login/                    # /login (public)
│   │   │   └── forgot-password/      # /login/forgot-password
│   │   └── reviews/
│   │       └── [id]/workspace/       # /reviews/[id]/workspace (outside auth group, has its own AuthGuard)
│   ├── components/
│   │   ├── aegis/                    # Core UI components
│   │   │   ├── AppShell.tsx          # Sidebar + topbar layout
│   │   │   ├── AuthGuard.tsx         # Redirects to /login if unauthenticated
│   │   │   ├── Avatar.tsx            # Initials avatar
│   │   │   ├── Brand.tsx             # Logo + brand
│   │   │   ├── GroupTabs.tsx         # Group sub-navigation
│   │   │   ├── NavigationPage.tsx    # Reusable card-grid page
│   │   │   ├── Providers.tsx         # React context providers
│   │   │   ├── ReviewWorkspace.tsx   # Full review workspace
│   │   │   ├── SessionWarning.tsx    # Session expiry warning modal
│   │   │   ├── StatusPill.tsx        # Status badge
│   │   │   └── TokenSync.tsx         # Bridges React auth state to apiFetch
│   │   └── pdf-annotator/            # PDF annotation subsystem
│   │       ├── PdfAnnotator.tsx      # Main annotator component
│   │       ├── Toolbar.tsx           # Annotation toolbar
│   │       ├── Sidebar.tsx           # Annotation sidebar
│   │       ├── types.ts              # Shared types
│   │       ├── text-layer-helpers.ts # PDF text layer utilities
│   │       ├── annotator.css
│   │       ├── sidebar.css
│   │       ├── toolbar.css
│   │       ├── annotations/          # Shape components (Highlight, Rectangle, Circle, Ellipse)
│   │       └── previews/             # Preview thumbnails (same shapes)
│   ├── hooks/                        # Custom React hooks
│   │   ├── useFetch.ts               # Base fetch hook
│   │   ├── useGroups.ts              # Groups list
│   │   ├── useGroup.ts               # Single group
│   │   ├── useDocuments.ts           # Documents list
│   │   ├── useReviews.ts             # Reviews list
│   │   └── useReview.ts              # Single review
│   ├── lib/
│   │   ├── auth-context.tsx           # Auth provider (JWT, refresh, proactive renewal)
│   │   ├── utils.ts                   # UI helper functions
│   │   └── api/                       # API client modules
│   │       ├── index.ts               # Re-exports all modules
│   │       ├── client.ts              # apiFetch() with 401 interceptor + auto-refresh
│   │       ├── types.ts               # Shared API types
│   │       ├── auth.ts                # login(), refreshAccessToken(), logoutUser(), getMe()
│   │       ├── users.ts               # User CRUD
│   │       ├── groups.ts              # Groups API
│   │       ├── reviews.ts             # Reviews API
│   │       ├── documents.ts           # Documents API
│   │       └── annotations.ts         # Annotations API
│   └── styles/                        # CSS modules (imported via globals.css)
│       ├── variables.css              # CSS custom properties (colors, spacing)
│       ├── reset.css                  # CSS reset
│       ├── layout.css                 # Page layout
│       ├── shell.css                  # Sidebar + topbar
│       ├── navigation.css             # Navigation components
│       ├── components.css             # Shared UI components
│       ├── buttons.css                # Button variants
│       ├── login.css                  # Login page
│       ├── groups.css                 # Groups pages
│       ├── documents.css              # Documents pages
│       ├── reviews.css                # Reviews pages
│       ├── annotations.css            # Annotation workspace
│       ├── settings.css               # Settings page
│       ├── session-warning.css        # Session expiry modal
│       ├── responsive.css             # Responsive breakpoints
│       └── compact.css                # Compact/dense layout variant
├── public/                           # Static assets (logos, favicons)
├── next.config.ts                    # output: "standalone"
├── tsconfig.json                     # Path alias: @/* -> ./src/*
└── package.json
```

## Routing

File-based routing under `src/app/`. The `(auth)` route group wraps all protected pages with `AuthGuard` + `AppShell` via its `layout.tsx`.

| Route | Description | Auth |
|---|---|---|
| `/` | Dashboard with metrics | Yes |
| `/login` | Sign-in form | No |
| `/login/forgot-password` | Password recovery | No |
| `/groups` | Research groups directory | Yes |
| `/groups/[id]` | Group overview | Yes |
| `/groups/[id]/documents` | Group documents | Yes |
| `/groups/[id]/reviews` | Group reviews | Yes |
| `/groups/[id]/members` | Group members | Yes |
| `/groups/[id]/activity` | Group activity feed | Yes |
| `/groups/[id]/discussion` | Group discussion | Yes |
| `/reviews` | Review queue | Yes |
| `/reviews/[id]` | Review overview | Yes |
| `/reviews/[id]/workspace` | Full review workspace (Client Component) | Yes (own AuthGuard) |
| `/submissions` | User submissions | Yes |
| `/submissions/new` | New submission form | Yes |
| `/notifications` | Notification list | Yes |
| `/profile` | User profile | Yes |
| `/settings` | Preferences | Yes |

## Component Types

- **Server Components** (default) -- Pages that render on the server, no interactivity
- **Client Components** (`"use client"`) -- Interactive components: `AppShell`, `ReviewWorkspace`, `PdfAnnotator`, `AuthGuard`, `SessionWarning`, `TokenSync`

## API Client

The API layer is split into domain modules under `src/lib/api/`:

- `client.ts` -- `apiFetch<T>()` wrapper with Bearer token injection, 401 interceptor, coalesced token refresh, and automatic retry
- `auth.ts` -- `login()`, `refreshAccessToken()`, `logoutUser()`, `getMe()`
- `users.ts`, `groups.ts`, `reviews.ts`, `documents.ts`, `annotations.ts` -- Domain-specific API calls
- `types.ts` -- Shared TypeScript types
- `index.ts` -- Barrel re-export

## Authentication

JWT-based with refresh token rotation. See [docs/auth.md](../../docs/auth.md) for full details.

Key components:
- `auth-context.tsx` -- React Context provider with proactive refresh (5 min before expiry)
- `TokenSync.tsx` -- Bridges React auth state to the module-level `apiFetch`
- `AuthGuard.tsx` -- Route protection (used in `(auth)/layout.tsx` and workspace page)
- `SessionWarning.tsx` -- Modal warning when session is about to expire

## Hooks

Custom hooks in `src/hooks/` encapsulate data fetching:

| Hook | Purpose |
|---|---|
| `useFetch` | Base fetch hook with loading/error state |
| `useGroups` | Fetches paginated groups list |
| `useGroup` | Fetches a single group by ID |
| `useDocuments` | Fetches paginated documents list |
| `useReviews` | Fetches paginated reviews list |
| `useReview` | Fetches a single review by ID |

## Styling

Pure CSS architecture (no Tailwind/PostCSS). Styles are split into modules under `src/styles/` and imported via `globals.css`:

- **Foundation:** `variables.css` (custom properties), `reset.css`, `layout.css`
- **Shell:** `shell.css` (sidebar + topbar), `navigation.css`
- **Components:** `components.css`, `buttons.css`, `status-pill` (in components.css)
- **Feature:** `groups.css`, `documents.css`, `reviews.css`, `annotations.css`, `login.css`, `settings.css`, `session-warning.css`
- **Variants:** `responsive.css` (breakpoints), `compact.css` (dense layout)

CSS custom properties for theming:
- Colors: green/amber/blue palette
- Layout: fixed sidebar (264px), sticky topbar (68px), fluid content (max 1240px)
- Naming: BEM-like (`.button--primary`, `.status-pill--open`)
