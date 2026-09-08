# Frontend Structure

## Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | React framework (App Router, Turbopack) |
| React | 19 | UI library |
| TypeScript | 5.7+ | Type safety |
| react-pdf | 10.5 | PDF rendering |
| react-konva / konva | 19.2 / 10.3 | Canvas-based PDF annotation |
| lucide-react | 1.16 | Icons |

No UI framework (Tailwind, MUI, etc.). All styling via custom CSS in `globals.css`.

## Directory Layout

```
apps/web/
├── src/
│   ├── app/                    # Pages (App Router file-based routing)
│   │   ├── layout.tsx          # Root layout (html/body/metadata)
│   │   ├── page.tsx            # Dashboard (/)
│   │   ├── globals.css         # All project styles (3100+ lines)
│   │   ├── login/              # /login
│   │   ├── groups/             # /groups and sub-routes
│   │   ├── reviews/            # /reviews and sub-routes
│   │   ├── submissions/        # /submissions
│   │   ├── notifications/      # /notifications
│   │   ├── profile/            # /profile
│   │   └── settings/           # /settings
│   ├── components/
│   │   ├── aegis/              # Core UI components
│   │   │   ├── AppShell.tsx    # Sidebar + topbar layout
│   │   │   ├── Avatar.tsx      # Initials avatar
│   │   │   ├── Brand.tsx       # Logo + brand
│   │   │   ├── GroupTabs.tsx   # Group sub-navigation
│   │   │   ├── NavigationPage.tsx  # Reusable card-grid page
│   │   │   ├── ReviewWorkspace.tsx # Full review workspace
│   │   │   └── StatusPill.tsx  # Status badge
│   │   └── pdf-annotator/      # PDF annotation tool
│   │       ├── PdfAnnotator.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Toolbar.tsx
│   │       ├── annotations/    # Shape components
│   │       └── previews/       # Preview thumbnails
│   └── lib/
│       ├── api.ts              # API client (fetch wrapper)
│       └── mock-data.ts        # Mock data for development
├── public/                     # Static assets (logos, favicons)
├── next.config.ts              # output: "standalone"
├── tsconfig.json               # Path alias: @/* -> ./src/*
└── package.json
```

## Routing

File-based routing under `src/app/`. Each `page.tsx` is a route.

| Route | Description |
|---|---|
| `/` | Dashboard with metrics |
| `/login` | Sign-in form |
| `/groups` | Research groups directory |
| `/groups/[group]` | Group overview |
| `/groups/[group]/documents` | Group documents |
| `/groups/[group]/reviews` | Group reviews |
| `/groups/[group]/members` | Group members |
| `/groups/[group]/discussion` | Group discussion |
| `/reviews` | Review queue |
| `/reviews/[review]` | Review overview |
| `/reviews/[review]/workspace` | Full review workspace (Client Component) |
| `/submissions` | User submissions |
| `/submissions/new` | New submission form |
| `/notifications` | Notification list |
| `/profile` | User profile |
| `/settings` | Preferences |

## Component Types

- **Server Components** (default) -- Pages that render on the server, no interactivity
- **Client Components** (`"use client"`) -- Interactive components: `AppShell`, `ReviewWorkspace`, `PdfAnnotator`

## API Client

`src/lib/api.ts` resolves the base URL from `NEXT_PUBLIC_API_URL` (browser) or `API_URL` (server) and exports typed fetch helpers.

## Styling

Single `globals.css` file with CSS custom properties for theming:
- Colors: green/amber/blue palette
- Layout: fixed sidebar (264px), sticky topbar (68px), fluid content (max 1240px)
- Naming: BEM-like (`.button--primary`, `.status-pill--open`)
