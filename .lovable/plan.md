

# Secure Admin Portal and Analytics Dashboard

## Overview

This plan adds a PIN-protected admin dashboard with 6 analytical charts. It requires two new database tables to track scan and redemption history, a backend function for secure PIN validation, and new frontend pages for the login gate and dashboard.

## What Will Be Built

### 1. New Database Tables
Two logging tables are needed since the current `student_points` table only stores balances, not history:

- **scan_logs**: Records every individual barcode scan with a timestamp (powers Daily Velocity, Peak Hours, and Semester Goal charts)
- **redemption_logs**: Records every reward redemption (powers Points Economy chart)

### 2. Secure PIN Validation
- A backend function validates the admin PIN against a stored secret -- no hardcoded credentials in frontend code
- PIN is stored as a backend secret (you will be prompted to enter it)
- On success, a session flag allows access to the dashboard

### 3. New Pages and Routes
- **/admin-login**: Clean PIN entry page with error feedback
- **/admin-dashboard**: Protected page with 6 charts in a responsive grid

### 4. Updated Existing Code
- **Landing Page**: Small "Admin Access" link in the footer
- **CountingScreen**: Also inserts a row into `scan_logs` on each scan
- **RedeemModal**: Also inserts a row into `redemption_logs` on each redemption

### 5. The 6 Dashboard Charts (using Recharts)

1. **Daily Scan Velocity** (Line Chart) -- scans per day, last 7 days
2. **Top 5 Contributors** (Horizontal Bar) -- top students by points, gold/silver/bronze colors
3. **Registration Status** (Doughnut) -- active vs inactive students, total count in center
4. **Points Economy** (Grouped Bar) -- total earned vs total redeemed
5. **Peak Hours** (Bar Chart) -- scan frequency by hour of day
6. **Semester Goal** (Progress/Gauge) -- total scans vs configurable target (default 10,000)

---

## Technical Details

### Database Schema

```sql
-- Scan history for analytics
CREATE TABLE public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lrn TEXT NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

-- Redemption history for analytics
CREATE TABLE public.redemption_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lrn TEXT NOT NULL,
  reward_name TEXT NOT NULL,
  points_redeemed INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: public read/insert (kiosk, no auth)
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.scan_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.scan_logs FOR INSERT WITH CHECK (true);

ALTER TABLE public.redemption_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.redemption_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.redemption_logs FOR INSERT WITH CHECK (true);
```

### Backend Function: `verify-admin-pin`

An edge function that compares the submitted PIN against the `ADMIN_PIN` secret. Returns `{ valid: true }` or `{ valid: false }`. This keeps the PIN out of frontend code entirely.

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/verify-admin-pin/index.ts` | PIN validation edge function |
| `src/pages/AdminLogin.tsx` | PIN entry page |
| `src/pages/AdminDashboard.tsx` | Dashboard with 6 charts |
| `src/components/admin/DailyScanChart.tsx` | Line chart component |
| `src/components/admin/TopContributorsChart.tsx` | Horizontal bar chart |
| `src/components/admin/RegistrationStatusChart.tsx` | Doughnut chart |
| `src/components/admin/PointsEconomyChart.tsx` | Grouped bar chart |
| `src/components/admin/PeakHoursChart.tsx` | Bar chart |
| `src/components/admin/SemesterGoalChart.tsx` | Progress/gauge component |

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/admin-login` and `/admin-dashboard` routes |
| `src/pages/Index.tsx` | Add discreet "Admin Access" link at bottom |
| `src/components/screens/CountingScreen.tsx` | Insert into `scan_logs` on each scan |
| `src/components/screens/RedeemModal.tsx` | Insert into `redemption_logs` on each redemption |

### Data Queries for Charts

1. **Daily Scan Velocity**: `SELECT DATE(scanned_at) as day, COUNT(*) FROM scan_logs WHERE scanned_at > now() - interval '7 days' GROUP BY day ORDER BY day`
2. **Top 5 Contributors**: `SELECT * FROM student_points ORDER BY points_balance DESC LIMIT 5`
3. **Registration Status**: `SELECT COUNT(*) FILTER (WHERE points_balance > 0) as active, COUNT(*) FILTER (WHERE points_balance = 0) as inactive FROM student_points`
4. **Points Economy**: Total earned from `scan_logs` count, total redeemed from `SUM(points_redeemed)` in `redemption_logs`
5. **Peak Hours**: `SELECT EXTRACT(HOUR FROM scanned_at) as hour, COUNT(*) FROM scan_logs GROUP BY hour ORDER BY hour`
6. **Semester Goal**: `SELECT COUNT(*) FROM scan_logs` vs hardcoded target

### Security Approach

- Admin PIN stored as a backend secret (never in frontend code)
- Edge function validates PIN server-side
- `sessionStorage` flag grants access for the current browser tab only (cleared on tab close)
- Dashboard route checks the flag and redirects to login if missing

### Styling

- Dashboard uses a different layout than the kiosk screens -- clean grid with dark cards matching the existing retro green/amber theme
- Charts use amber/gold primary color with green accents to stay on-brand
- Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop

## Implementation Sequence

1. Create `scan_logs` and `redemption_logs` tables (migration)
2. Add `ADMIN_PIN` secret (user will be prompted)
3. Create `verify-admin-pin` edge function
4. Update `CountingScreen` and `RedeemModal` to log events
5. Build `AdminLogin` page
6. Build `AdminDashboard` with all 6 chart components
7. Update `App.tsx` routes and add admin link to landing page

