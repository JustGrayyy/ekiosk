import express from "express";
import cors from "cors";
import { db } from "./db";
import { studentPoints, scanLogs, redemptionLogs, allowedProducts } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

const app = express();
app.use(cors());
app.use(express.json());

// Admin PIN verification
app.post("/api/verify-admin-pin", (req, res) => {
  const { pin } = req.body;
  const adminPin = process.env.ADMIN_PIN;
  
  if (!adminPin) {
    return res.status(500).json({ valid: false, error: "Server configuration error" });
  }
  
  res.json({ valid: pin === adminPin });
});

// Points increment
app.post("/api/increment-points", async (req, res) => {
  const { lrn, fullName, pointsToAdd, section, productName } = req.body;
  
  try {
    const result = await db.transaction(async (tx) => {
      // Update or insert student points
      const [updatedStudent] = await tx
        .insert(studentPoints)
        .values({
          lrn,
          fullName,
          pointsBalance: pointsToAdd,
          section,
        })
        .onConflictDoUpdate({
          target: studentPoints.lrn,
          set: {
            pointsBalance: sql`${studentPoints.pointsBalance} + ${pointsToAdd}`,
            section: sql`COALESCE(${section}, ${studentPoints.section})`,
            lastUpdated: sql`now()`,
          },
        })
        .returning();

      // Log the scan
      await tx.insert(scanLogs).values({
        lrn,
        section,
        pointsAdded: pointsToAdd,
        productName,
      });

      return updatedStudent;
    });

    res.json(result);
  } catch (error) {
    console.error("Error incrementing points:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get student points
app.get("/api/student/:lrn", async (req, res) => {
  try {
    const [student] = await db
      .select()
      .from(studentPoints)
      .where(eq(studentPoints.lrn, req.params.lrn));
    
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get allowed products
app.get("/api/products", async (req, res) => {
  try {
    const products = await db.select().from(allowedProducts);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
