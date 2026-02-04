
# Loyalty Points System & LRN Integration

## Overview

This plan implements a complete loyalty points tracking ecosystem with Supabase backend integration. Students can check their points balance, redeem rewards, and automatically earn points when depositing items via barcode scanner.

## Architecture

```text
+-------------------+     +--------------------+     +------------------+
|   Start Screen    |---->| Account Screen     |---->| Deposit Screen   |
|   + Check Points  |     | (Name + LRN)       |     |                  |
+-------------------+     +--------------------+     +------------------+
         |                                                    |
         v                                                    v
+-------------------+                             +------------------+
| Check Points      |                             | Counting Screen  |
| Screen (LRN Input)|                             | + DB Point Sync  |
+-------------------+                             +------------------+
         |                                                    |
         v                                                    v
+-------------------+                             +------------------+
| Points Display    |                             | Success Screen   |
| + Redeem Modal    |                             | (Shows Points)   |
+-------------------+                             +------------------+
```

## What Will Be Built

### 1. Database Setup
- **Table**: `student_points` with columns for LRN (primary key), full name, points balance, and timestamp
- **RLS Policies**: Allow public read/write for kiosk use (no authentication required)

### 2. New Screens
- **CheckPointsScreen**: LRN input, student lookup, points display, and redeem button
- **RedeemModal**: Overlay with dummy rewards and redemption logic

### 3. Updated Screens
- **StartScreen**: Add "CHECK POINTS" button alongside existing "START" button
- **CountingScreen**: Sync each scanned item to database, incrementing points
- **SuccessScreen**: Display points earned during session

### 4. Navigation Flow Updates
- Add new screen type "checkPoints" to the screen state machine
- Pass LRN through the deposit flow for database sync

---

## Technical Details

### Database Schema

```sql
CREATE TABLE public.student_points (
  lrn TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  points_balance INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;

-- Public access policies (kiosk operates without auth)
CREATE POLICY "Allow public read" ON public.student_points
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.student_points
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.student_points
  FOR UPDATE USING (true);
```

### File Changes

**New Files:**
1. `src/components/screens/CheckPointsScreen.tsx` - LRN lookup and points display
2. `src/components/screens/RedeemModal.tsx` - Rewards redemption overlay

**Modified Files:**
1. `src/pages/Index.tsx` - Add new screen states and navigation handlers
2. `src/components/screens/StartScreen.tsx` - Add "CHECK POINTS" button
3. `src/components/screens/CountingScreen.tsx` - Add LRN prop and database sync
4. `src/components/screens/SuccessScreen.tsx` - Show points earned
5. `src/integrations/supabase/client.ts` - Supabase client setup
6. `src/integrations/supabase/types.ts` - TypeScript types for database

### Component Details

**CheckPointsScreen.tsx**
- Large centered LRN numeric input
- "SEARCH" button triggers database query
- Displays student name and points balance on success
- Shows "Student not found" error if LRN doesn't exist
- "REDEEM POINTS" button (disabled if balance is 0)
- "BACK" button to return to start

**RedeemModal.tsx**
- Modal overlay with "REDEEM REWARDS" title
- Three dummy rewards:
  - School Supplies Pack - 50 pts
  - Canteen Voucher - 100 pts
  - Premium Item - 200 pts
- Each reward shows required points
- Clicking a reward:
  - Validates sufficient balance
  - Deducts points from database
  - Shows success message with claim code
  - Updates displayed balance in real-time

**CountingScreen.tsx Updates**
- Accept `userLrn` prop from parent
- On each successful barcode scan:
  - Increment local count (existing behavior)
  - Call Supabase to increment `points_balance` by 1
- Use optimistic updates for instant UI feedback

**SuccessScreen.tsx Updates**
- Accept `pointsEarned` prop
- Display "POINTS EARNED: X" alongside deposit count

### Styling Approach
- "CHECK POINTS" button uses existing primary color (amber/gold)
- Slight visual distinction using secondary styling or icon
- Modal uses existing `kiosk-panel` styling with overlay backdrop
- All components maintain the retro arcade aesthetic

### Error Handling
- Network errors show toast notifications
- Graceful fallback if database is unreachable
- Input validation for LRN format (numeric only)

---

## Implementation Sequence

1. **Supabase Setup**: Enable Lovable Cloud, create database table and RLS policies
2. **Type Definitions**: Add Supabase client and TypeScript types
3. **CheckPointsScreen**: Build LRN lookup UI and database query logic
4. **RedeemModal**: Build rewards display and redemption logic
5. **StartScreen Update**: Add "CHECK POINTS" button with navigation
6. **Index.tsx Update**: Add new screen states and handlers
7. **CountingScreen Update**: Integrate database point sync on each scan
8. **SuccessScreen Update**: Display points earned
