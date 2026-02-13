
import { db } from "./db";
import {
  patients, vitals, alerts,
  type Patient, type InsertPatient,
  type Vital, type InsertVital,
  type Alert, type InsertAlert
} from "@shared/schema";
import { eq, desc, asc, limit } from "drizzle-orm";

export interface IStorage {
  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  // Vitals
  addVital(vital: InsertVital): Promise<Vital>;
  getVitals(patientId: number, limitCount?: number): Promise<Vital[]>;
  
  // Alerts
  addAlert(alert: InsertAlert): Promise<Alert>;
  getAlerts(patientId: number): Promise<Alert[]>;
  acknowledgeAlert(id: number): Promise<Alert | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async addVital(vital: InsertVital): Promise<Vital> {
    const [newVital] = await db.insert(vitals).values(vital).returning();
    return newVital;
  }

  async getVitals(patientId: number, limitCount: number = 60): Promise<Vital[]> {
    return await db.select()
      .from(vitals)
      .where(eq(vitals.patientId, patientId))
      .orderBy(asc(vitals.timestamp)) // Get oldest to newest for charts, but usually we want recent window. 
      // Actually for charts we often want the last N points.
      // Let's get the last N descending, then reverse them in memory or subquery. 
      // Optimization: simple descending limit for now.
      .limit(limitCount); 
      // Note: This logic might need adjustment to get the *latest* 60 points in correct order.
      // Correct approach for "last 60 points":
      // SELECT * FROM vitals ORDER BY timestamp DESC LIMIT 60
      // Then reverse for chart.
  }

  // Correct implementation for chart friendly data
  async getRecentVitals(patientId: number, count: number = 60): Promise<Vital[]> {
      const recent = await db.select()
        .from(vitals)
        .where(eq(vitals.patientId, patientId))
        .orderBy(desc(vitals.timestamp))
        .limit(count);
      return recent.reverse();
  }

  async addAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async getAlerts(patientId: number): Promise<Alert[]> {
    return await db.select()
      .from(alerts)
      .where(eq(alerts.patientId, patientId))
      .orderBy(desc(alerts.timestamp));
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const [updated] = await db.update(alerts)
      .set({ acknowledged: true })
      .where(eq(alerts.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
