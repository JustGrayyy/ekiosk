import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const studentPoints = pgTable("student_points", {
  lrn: text("lrn").primaryKey(),
  fullName: text("full_name").notNull(),
  pointsBalance: integer("points_balance").default(0),
  section: text("section"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
});

export const scanLogs = pgTable("scan_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  lrn: text("lrn").notNull(),
  section: text("section"),
  pointsAdded: integer("points_added").default(1),
  productName: text("product_name"),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).defaultNow(),
});

export const redemptionLogs = pgTable("redemption_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  lrn: text("lrn").notNull(),
  rewardName: text("reward_name").notNull(),
  pointsRedeemed: integer("points_redeemed").notNull(),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }).defaultNow(),
});

export const allowedProducts = pgTable("allowed_products", {
  barcode: text("barcode").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("bottle"),
  pointsValue: integer("points_value").notNull().default(1),
});

export const suggestions = pgTable("suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
