
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  condition: text("condition").notNull(), // e.g., "Cardiac Arrest", "Trauma"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vitals = pgTable("vitals", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  heartRate: doublePrecision("heart_rate").notNull(),
  spo2: doublePrecision("spo2").notNull(),
  bpSystolic: doublePrecision("bp_systolic").notNull(),
  bpDiastolic: doublePrecision("bp_diastolic").notNull(),
  motion: doublePrecision("motion").notNull(), // Vibration/Movement index
  isArtifact: boolean("is_artifact").default(false), // Flagged by artifact detection
  confidence: doublePrecision("confidence").default(1.0),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  type: text("type").notNull(), // "CRITICAL", "WARNING", "ARTIFACT"
  message: text("message").notNull(),
  riskScore: doublePrecision("risk_score").notNull(),
  acknowledged: boolean("acknowledged").default(false),
});

// === SCHEMAS ===

export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertVitalSchema = createInsertSchema(vitals).omit({ id: true, timestamp: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, timestamp: true });

// === EXPLICIT API TYPES ===

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Vital = typeof vitals.$inferSelect;
export type InsertVital = z.infer<typeof insertVitalSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type RiskAssessment = {
  score: number;
  level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  factors: string[];
};

export type SimulationState = {
  isRunning: boolean;
  scenario: "NORMAL" | "DISTRESS" | "ARTIFACT_NOISE" | "CONNECTION_LOSS";
};
