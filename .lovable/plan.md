

# Barcode Whitelisting & Validation

## Overview

Restrict the deposit scanner to only accept registered plastic bottles. Unknown barcodes and non-bottle items are rejected with clear feedback. An admin form allows adding new products without touching code.

---

## 1. Database Changes

### New table: `allowed_products`

```sql
CREATE TABLE public.allowed_products (
  barcode TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'bottle',
  points_value INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.allowed_products ENABLE ROW LEVEL SECURITY;

-- Public read so the kiosk can look up barcodes
CREATE POLICY "Allow public read on allowed_products"
  ON public.allowed_products FOR SELECT USING (true);

-- Public insert so admin form can add items (protected by admin session in UI)
CREATE POLICY "Allow public insert on allowed_products"
  ON public.allowed_products FOR INSERT WITH CHECK (true);

-- Public delete for admin management
CREATE POLICY "Allow public delete on allowed_products"
  ON public.allowed_products FOR DELETE USING (true);
```

### Seed data

```sql
INSERT INTO public.allowed_products (barcode, name, category) VALUES
  ('4801981126012', 'Nature''s Spring Water', 'bottle'),
  ('4800016055308', 'Coke Mismo', 'bottle'),
  ('4800016644830', 'Sprite 500ml', 'bottle'),
  ('8992760223011', 'Piattos Chips', 'snack');
```

---

## 2. Update Counting Screen Logic

### File: `src/components/screens/CountingScreen.tsx`

Replace the current "scan and count" logic with a validation flow:

1. On Enter key, read the scanned barcode string.
2. Query `allowed_products` by barcode using `.maybeSingle()`.
3. **Not found** -- show a red/destructive toast: "Unknown Item: This barcode is not in our system." Do NOT increment count.
4. **Found but wrong category** (category !== 'bottle') -- show a yellow/warning toast: "Rejected: [Name] is not a bottle." Do NOT increment count.
5. **Found and category === 'bottle'** -- increment count, show a green/default toast: "Accepted: [Name] (+1 Point)", then sync points and log scan as before.

The lookup is async, so the scan becomes non-optimistic: the count only increments after the DB confirms the barcode is valid. A brief loading state is not needed since the query is fast, but we add a `scanningRef` guard to prevent double-processing while a lookup is in flight.

---

## 3. Admin "Register New Item" Form

### New file: `src/components/admin/AddProductForm.tsx`

A compact form with four fields:
- **Barcode** (text input, required)
- **Name** (text input, required)
- **Category** (select: 'bottle', 'can', 'snack', 'other')
- **Points Value** (number input, default 1)

On submit, inserts into `allowed_products`. Shows success/error toast. Resets form on success.

### New file: `src/components/admin/ProductListTable.tsx`

A simple table listing all items in `allowed_products` with columns: Barcode, Name, Category, Points. Each row has a delete button. Uses realtime or manual refresh.

### File: `src/pages/AdminDashboard.tsx`

Add two new panels to the CHARTS array:
- "Product Whitelist" -- renders `ProductListTable`
- "Register New Item" -- renders `AddProductForm`

---

## 4. Update `scan_logs` insert

In the updated CountingScreen, when a valid bottle is scanned, also store the product name in the scan log. Since `scan_logs` doesn't have a product column currently, we will add a `product_name` column:

```sql
ALTER TABLE public.scan_logs ADD COLUMN product_name TEXT;
```

This is optional enrichment -- the scan log will now show what product was scanned.

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| Migration SQL | Create | `allowed_products` table + seed data + `product_name` column on `scan_logs` |
| `src/components/screens/CountingScreen.tsx` | Modify | Add barcode lookup and validation before counting |
| `src/components/admin/AddProductForm.tsx` | Create | Admin form to register new products |
| `src/components/admin/ProductListTable.tsx` | Create | Admin table showing all whitelisted products |
| `src/pages/AdminDashboard.tsx` | Modify | Add 2 new panels for product management |

## Implementation Sequence

1. Run database migration (create table, seed data, add column)
2. Update CountingScreen with validation logic
3. Build AddProductForm and ProductListTable
4. Add new panels to AdminDashboard
