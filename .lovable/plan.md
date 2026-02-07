

# Smart Inputs, Leaderboards & Admin Monitoring

## Overview

This update adds a section field to student data with fuzzy-match auto-correction, dual leaderboards on the landing page, and two new admin dashboard widgets (live scan feed + section rankings).

---

## Database Changes

### 1. Add `section` column to `student_points`

```sql
ALTER TABLE public.student_points ADD COLUMN section TEXT;
```

### 2. Add `section` column to `scan_logs`

```sql
ALTER TABLE public.scan_logs ADD COLUMN section TEXT;
ALTER TABLE public.scan_logs ADD COLUMN points_added INTEGER DEFAULT 1;
```

### 3. Update `increment_points` function

Add a `student_section` parameter so section is stored/updated alongside points:

```sql
CREATE OR REPLACE FUNCTION public.increment_points(
  student_lrn text, student_name text, 
  points_to_add integer DEFAULT 1, student_section text DEFAULT NULL
) ...
```

### 4. Enable Realtime on `scan_logs`

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_logs;
```

---

## Task 1: Smart Section Input (AccountScreen)

### Changes to `src/components/screens/AccountScreen.tsx`

- Add a "SECTION (OPTIONAL)" input field below the LRN field
- Pass `section` through `onSubmit` callback (signature becomes `(name, lrn, section) => void`)

### New utility: `src/lib/fuzzyMatch.ts`

- Implement a Levenshtein distance function (pure JS, no external library)
- Export a `findClosestSection(input, validSections)` function
- Returns the closest match if similarity >= 80%, otherwise returns the raw input
- Predefined sections constant: `["Prowess", "Fortitude", "Integrity", "Resilience", "Valor", "Harmony"]`

### Behavior

- On blur or submit, normalize input to lowercase and run fuzzy match
- If auto-corrected, show a toast: "Did you mean 'Prowess'? Auto-selected."
- Store the corrected section value

### Cascade changes

- **`Index.tsx`**: Update `UserData` to include `section`, pass it to `CountingScreen`
- **`CountingScreen.tsx`**: Pass `section` to `increment_points` RPC and include `section` in `scan_logs` insert
- **`DepositScreen.tsx`**: No changes needed (section already captured before this screen)

---

## Task 2: Dual Leaderboards (StartScreen)

### Changes to `src/components/screens/StartScreen.tsx`

Add two leaderboard cards below the existing buttons:

**Leaderboard A -- "Top Students"**
- Query: `SELECT full_name, points_balance FROM student_points ORDER BY points_balance DESC LIMIT 10`
- Display: Ranked list 1-10 with name and score

**Leaderboard B -- "Top Sections"**
- Query: Aggregate `SUM(points_balance)` grouped by `section` from `student_points`, ordered descending, limit 10
- Handle null sections as "Unassigned"
- Display: Ranked list with section name and total points

**Layout**: Side-by-side cards on tablet/desktop, stacked or tabbed on mobile. Uses the existing kiosk-panel styling.

---

## Task 3: Admin Dashboard Enhancements

### New component: `src/components/admin/LiveFeedTable.tsx`

- Fetches last 10 rows from `scan_logs` ordered by `scanned_at DESC`
- Columns: Time (relative, e.g. "2 mins ago"), LRN, Section, Points Added
- Uses Supabase Realtime subscription on `scan_logs` to auto-update when new scans arrive
- Handles null section as "---"

### New component: `src/components/admin/SectionRankingsChart.tsx`

- Queries all sections with `SUM(points_balance)` from `student_points`
- Displays a full ranked list (not limited to top 10)
- Highlights #1 section in gold/yellow
- Handles null section as "Unassigned"

### Changes to `src/pages/AdminDashboard.tsx`

- Add the two new widgets to the chart grid (total 8 panels)
- Live Feed and Section Rankings added to the CHARTS array

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| Migration SQL | Create | Add `section` to `student_points`, add `section` + `points_added` to `scan_logs`, update `increment_points` function, enable realtime on `scan_logs` |
| `src/lib/fuzzyMatch.ts` | Create | Levenshtein distance + section matching utility |
| `src/components/screens/AccountScreen.tsx` | Modify | Add section input with fuzzy matching |
| `src/pages/Index.tsx` | Modify | Pass section through the flow |
| `src/components/screens/CountingScreen.tsx` | Modify | Include section in RPC call and scan_logs insert |
| `src/components/screens/StartScreen.tsx` | Modify | Add dual leaderboard cards |
| `src/components/admin/LiveFeedTable.tsx` | Create | Real-time last 10 scans table |
| `src/components/admin/SectionRankingsChart.tsx` | Create | Full section rankings with gold highlight |
| `src/pages/AdminDashboard.tsx` | Modify | Add 2 new widgets to grid |

## Implementation Sequence

1. Database migration (add columns, update function, enable realtime)
2. Create fuzzy match utility
3. Update AccountScreen with section input
4. Update Index.tsx and CountingScreen.tsx to pass section through
5. Add leaderboards to StartScreen
6. Build LiveFeedTable and SectionRankingsChart
7. Update AdminDashboard with new widgets

