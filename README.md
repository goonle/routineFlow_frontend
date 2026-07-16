# RoutineFlow

A habit and routine-tracking app. Create goals, break them into tasks, mark tasks done day by day, log a daily emotion + diary entry, and see it all rolled up on a weekly/monthly calendar.

This is the Next.js (App Router, TypeScript) frontend. It talks to a separate ASP.NET Core 8 backend over a JWT-authenticated REST API.

## Architecture

The frontend is a **backend-for-frontend (BFF)** — the browser never talks to the backend API directly, and never sees a JWT.

- Two httpOnly, secure, `sameSite=lax` cookies (`access_token`, `refresh_token`) hold the session. They're set by Server Actions via `next/headers`, never by client-side JS.
- `lib/api.ts` exports `apiFetch()`, a server-only fetch wrapper that attaches the access token, calls the backend, and — on a `401` — transparently refreshes the session and retries the request once. If refresh also fails, it clears both cookies and throws `AuthError`, which every page catches and turns into a `redirect("/login")`.
- **Reads** happen in Server Components, calling `apiFetch()` directly during render. No client-side data-fetching library.
- **Mutations** are Server Actions (`"use server"`, under `lib/actions/`) that call `apiFetch()` and then `revalidatePath()` / `redirect()`.
- `middleware.ts` does a cheap cookie-presence check and redirects to `/login` if neither cookie exists. Actual token validity is `apiFetch`'s job, not middleware's.

Because the Next.js server is the only thing that ever calls the backend, the backend needs no CORS configuration.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) with a small hand-rolled primitive component set (`components/ui/`) styled against semantic CSS-variable design tokens (light/dark)
- [Zod](https://zod.dev/) for Server Action input validation
- [lucide-react](https://lucide.dev/) for icons

## Getting started

### Prerequisites

- Node.js 20+
- The [RoutineFlow backend](../routineFlow_backend) running locally (`dotnet run`, default `http://localhost:5080`) — or point at a deployed instance instead.

### Setup

```bash
npm install
cp .env.local.example .env.local
```

Set `BACKEND_URL` in `.env.local` to wherever the backend is running:

```
BACKEND_URL=http://localhost:5080
```

### Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login` — register a new account to get started (no email verification required).

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Project structure

```
app/
  login/, register/          — auth pages (public)
  (app)/                      — authenticated route group, gated by middleware.ts
    layout.tsx                — sidebar (desktop) / bottom nav (mobile) shell
    dashboard/                — today's goals, achieved status, inline mark-done
    goals/                    — active goals list + create form
    goals/deleted/            — soft-deleted goals + restore
    goals/[goalId]/           — goal detail: tasks, plan, edit/delete
    calendar/                 — weekly/monthly view + day emotion/diary editor
    notifications/            — list, unread filter, mark read
  error.tsx, (app)/loading.tsx

lib/
  session.ts                  — httpOnly cookie get/set/clear
  api.ts                       — apiFetch() with 401-refresh-retry
  types.ts                     — types + enums mirroring the backend API
  date.ts                      — date formatting helpers
  utils.ts                     — cn() classname helper
  actions/                     — Server Actions (auth, goals, tasks, plans, completions, daily-reports, notifications)

components/
  ui/                          — Button, Card, Input, Textarea, Select, Label, Badge, FieldError, FormError
  *Form.tsx, SidebarNav.tsx, CompletionStepper.tsx — feature components

middleware.ts                  — cookie-presence route guard
```

## Notes

- `middleware.ts` is Next's deprecated-but-functional convention as of Next 16 (superseded by `proxy.ts`, same behavior). Kept as-is; rename is a drop-in change if you want to clear the build warning.
- The `errors` field on validation failures from the backend maps 1:1 onto the field-level errors shown under each form input.
