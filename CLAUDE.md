# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev              # Start development server (Vite)
npm run build            # Build for production
npm run lint             # ESLint (flat config, TypeScript + React hooks + React Refresh)
npm run preview          # Preview production build
npm run generate:api     # Fetch swagger.json from backend + regenerate API client
npm run update:swagger   # Update swagger.json only (curl from backend)
npm run orval            # Regenerate API client from existing swagger.json
```

No test runner is configured in this project.

## Architecture Overview

React + TypeScript + Vite application for an employee testing/certification platform with tri-language support (Uzbek Latin, Uzbek Cyrillic, Russian).

### Tech Stack
- **React 19** with TypeScript, **Vite 7** for build
- **Tailwind CSS 3** with @tailwindcss/forms and @tailwindcss/typography
- **TanStack React Query 5** for server state
- **Zustand 5** for client state (persisted auth store)
- **React Router v7** (createBrowserRouter) for routing
- **Orval 7** for generating React Query hooks from OpenAPI spec
- **react-hook-form** for form handling
- **face-api.js** for face verification during tests

### Key Files & Patterns

**API Layer** (`src/api/`):
- `config.ts` — `BASE_URL` from `VITE_PUBLIC_API_URL` env var (defaults to `https://api.malaka.hududgaz.uz`)
- `generated/` — **DO NOT EDIT** — Orval auto-generates `respondentWebAPI.ts` and `models/` from `swagger.json`. Orval config in `orval.config.cjs` uses `react-query` client mode with `customInstance` mutator
- `mutator/custom-instance.ts` — Axios instance with request interceptor (adds JWT Bearer token + Accept-Language header) and response interceptor (automatic 401 → token refresh with queued retry, redirects to `/login` on refresh failure)
- `auth.ts` — Auth hooks (`useLogin`, `usePasswordLogin`, `useRegister`, `useSendOtp`, `useRefresh`, `useUpdateUserProfile`) and `tokenStorage` helper for JWT access/refresh in localStorage. Also exports `logout()` and `handleAuthError()`

**Authentication Flow**:
1. Login via OTP (`/login` → `/otp`) or password (`/login`)
2. Registration at `/register` → profile completion at `/profile-completion`
3. JWT tokens stored in localStorage (`accessToken`, `refreshToken`)
4. `ProtectedRoute` component checks token validity via `tokenStorage.isAccessValid()` (decodes JWT exp)
5. Custom axios instance auto-refreshes expired tokens and queues concurrent failing requests

**Routing** (defined in `src/main.tsx`):
- Main app routes under `<App>` → `<MainLayout>` (Header + Outlet): `/` (profile), `/test`, `/surveys/select`, `/session/:id`, `/rules`, `/guides`, `/admin/employees`, `/admin/create-candidate`
- Auth routes under `<AuthLayout>`: `/login`, `/register`, `/otp`, `/profile-completion`
- Certificate route under `<CertificateLayout>`: `/certificate/:id`
- All main app routes are wrapped with `<ProtectedRoute>`

**i18n** (`src/i18n.tsx`):
- Large inline dictionary object with keys like `'profile.title'`, `'test.submit'`
- `useI18n()` hook returns `{ t, lang, setLang }`. Language codes: `uz`, `uz-cyrl`, `ru`
- Language is detected from URL path segment, localStorage `lang` key, or defaults to `uz`
- All new user-facing strings must include all three language translations

**State Management**:
- Server state: TanStack Query (via Orval-generated hooks from `src/api/generated/`)
- Client state: `useAuthStore` (Zustand with `persist` middleware, stored as `auth-user` in localStorage)

**Components** (`src/components/`):
- Barrel export in `src/components/index.ts` for shared components (Header, BackgroundWrapper, animations, FaceVerificationModal, FaceMonitoring)
- `auth/` — form components (LoginForm, RegisterForm, OtpForm, ProfileCompletionForm, FieldForm, FormButton, FormContainer)
- `test/` — test-taking UI (QuestionCard, QuestionNavigator, CachedTimer, ProgressBar)

### Environment Variables

- `VITE_PUBLIC_API_URL` — Backend API base URL (required for production, defaults to dev server for local development)
