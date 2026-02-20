# E-KIOSK

## Overview

E-KIOSK is a recycling deposit kiosk application designed for a school environment. Students scan barcodes of plastic bottles and other recyclable items to earn points, which they can later redeem for rewards. The app features a student-facing kiosk interface (deposit flow, point checking, QR code scanning) and an admin dashboard with analytics charts, product whitelist management, and a live scan feed.

The frontend is a React SPA with a retro arcade/green-themed design. The backend uses Supabase as a hosted BaaS (database, edge functions, real-time subscriptions). There is also a `server/db.ts` file with Drizzle ORM + node-postgres setup, though the primary data access currently goes through the Supabase JS client on the frontend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build tool**: Vite (dev server on port 8080, SWC for fast compilation)
- **Routing**: React Router v6 with three main routes: `/` (kiosk), `/admin-login`, `/admin-dashboard`
- **Styling**: Tailwind CSS with CSS custom properties for theming. Uses a dark forest-green + amber/gold color scheme defined in `src/index.css`. The design system uses HSL-based CSS variables following shadcn/ui conventions.
- **UI Components**: shadcn/ui component library (located in `src/components/ui/`). Components are configured via `components.json` with path aliases (`@/components`, `@/lib`, etc.).
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Charts**: Recharts for admin dashboard visualizations (line charts, bar charts, pie charts)
- **State Management**: React Query (`@tanstack/react-query`) for server state; local component state via `useState`
- **Path aliases**: `@/` maps to `./src/` (configured in both tsconfig and vite)

### Screen Flow (Kiosk)
1. **StartScreen** – Leaderboards, eco facts, entry point
2. **AccountScreen** – Student enters name, LRN, section (with fuzzy matching for section names)
3. **DepositScreen** – Prepare for scanning
4. **CountingScreen** – Barcode scanning via hidden input (hardware scanner) or camera; validates against `allowed_products` whitelist; increments points via Supabase RPC `increment_points`
5. **SuccessScreen** – Confirmation with auto-redirect
6. **CheckPointsScreen** – Look up student balance, generate QR code, redeem rewards

### Admin Dashboard
- PIN-protected login (verified via Supabase Edge Function `verify-admin-pin`)
- Session stored in `sessionStorage` (simple "valid" flag, not token-based)
- Dashboard panels: Live Feed, Section Rankings, Daily Scan Velocity, Top Contributors, Registration Status, Points Economy, Peak Hours, Semester Goal, Product Whitelist, Add Product Form

### Backend / Data Layer
- **Primary**: Supabase (hosted Postgres + JS client at `src/integrations/supabase/client`)
- **Database tables**:
  - `student_points` – stores student LRN, name, section, points_balance
  - `scan_logs` – records each scan event with timestamp, LRN, section, points_added
  - `redemption_logs` – tracks point redemptions with points_redeemed
  - `allowed_products` – barcode whitelist with name, category, points_value (RLS enabled with public read/insert/delete)
- **RPC functions**: `increment_points` – atomic point increment stored procedure
- **Edge Functions**: `verify-admin-pin` – validates admin PIN
- **Real-time**: Supabase real-time subscriptions for live feed updates and product list changes
- **Drizzle ORM**: A `server/db.ts` exists using Drizzle with node-postgres (`DATABASE_URL` env var). This suggests a planned or partial server-side API layer but the app currently relies on direct Supabase client calls from the frontend.

### QR Code / Barcode Scanning
- **Hardware barcode scanner**: Captured via hidden input field that stays focused (CountingScreen)
- **Camera-based QR scanning**: `html5-qrcode` library in a modal (`QrScannerModal`)
- **QR code generation**: `react-qr-code` for displaying student QR codes

### Key Libraries
- `html-to-image` – Screenshot/export of QR cards
- `date-fns` – Date formatting
- `zod` + `@hookform/resolvers` – Form validation
- `vaul` – Drawer component
- `embla-carousel-react` – Carousel

### Testing
- **Framework**: Vitest with jsdom environment
- **Setup**: `src/test/setup.ts` with jest-dom matchers and matchMedia polyfill
- **Run**: `npm test` (single run) or `npm run test:watch`

## External Dependencies

### Supabase
- **Role**: Primary backend — database, authentication (edge functions), real-time subscriptions
- **Client**: `@supabase/supabase-js` initialized in `src/integrations/supabase/client`
- **Edge Functions**: `verify-admin-pin` for admin authentication
- **Real-time**: Used for live scan feed and product whitelist updates
- **Environment**: Requires Supabase project URL and anon key (configured in the client file)

### Database
- **Supabase Postgres**: Main data store with RLS policies
- **Drizzle ORM + node-postgres**: Present in `server/db.ts`, requires `DATABASE_URL` environment variable. If adding a server-side API, provision a Postgres database and set this variable.

### External Fonts
- Google Fonts: Space Grotesk (loaded via CSS import in `src/index.css`)

## Recent Changes
- **2026-02-20**: Master Rework of Admin Dashboard Analytics & Logic.
  - Centralized data fetching in `AdminAnalytics` with `fetchAllAnalytics` for `suggestions`, `trivia_logs`, and `sentiment_logs`.
  - Implemented precise data transformation:
    - Sentiment: Aggregates 'Happy', 'Proud', and 'Neutral' counts for Recharts.
    - Trivia: Aggregates 'Correct' vs 'Incorrect' counts based on `is_correct` boolean.
  - Enhanced Suggestion Management:
    - Added newest-first sorting and manual delete functionality with auto-refresh.
  - Added robust Supabase error reporting to identify RLS or connection issues.