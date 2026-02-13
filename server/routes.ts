
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { PatientSimulator } from "./simulation"; // We will create this next

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Initialize Simulator
  const simulator = new PatientSimulator(storage);

  // === Patients ===
  app.get(api.patients.list.path, async (req, res) => {
    const patients = await storage.getPatients();
    res.json(patients);
  });

  app.get(api.patients.get.path, async (req, res) => {
    const patient = await storage.getPatient(Number(req.params.id));
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  app.post(api.patients.create.path, async (req, res) => {
    try {
      const input = api.patients.create.input.parse(req.body);
      const patient = await storage.createPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  // === Vitals ===
  app.get(api.vitals.list.path, async (req, res) => {
    // Specialized method in storage to get recent vitals efficiently
    // Casting storage to access the specific method we added
    const dbStorage = storage as any; 
    const limit = req.query.limit ? Number(req.query.limit) : 60;
    const vitals = await dbStorage.getRecentVitals(Number(req.params.patientId), limit);
    res.json(vitals);
  });

  app.get(api.vitals.stats.path, async (req, res) => {
      const patientId = Number(req.params.patientId);
      const stats = simulator.getRiskAssessment(patientId);
      res.json(stats);
  });

  // === Alerts ===
  app.get(api.alerts.list.path, async (req, res) => {
    const alerts = await storage.getAlerts(Number(req.params.patientId));
    res.json(alerts);
  });

  app.patch(api.alerts.acknowledge.path, async (req, res) => {
    const alert = await storage.acknowledgeAlert(Number(req.params.id));
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  });

  // === Simulation ===
  app.post(api.simulation.toggle.path, async (req, res) => {
    const { patientId, scenario, running } = req.body;
    
    if (running) {
        simulator.startSimulation(patientId, scenario);
    } else {
        simulator.stopSimulation(patientId);
    }
    
    res.json({ message: "Simulation updated", state: { running, scenario } });
  });

  // Seed Data
  await seedDatabase(simulator);

  return httpServer;
}

async function seedDatabase(simulator: PatientSimulator) {
  const existingPatients = await storage.getPatients();
  if (existingPatients.length === 0) {
    const patient = await storage.createPatient({
      name: "John Doe",
      age: 45,
      gender: "Male",
      condition: "Cardiac Observation",
      isActive: true
    });
    console.log("Seeded initial patient");
    // Start simulation for the new patient
    simulator.startSimulation(patient.id, "NORMAL");
  } else {
    // Start simulation for existing patients if needed (optional)
    // For demo purposes, let's restart simulation for the first patient
    simulator.startSimulation(existingPatients[0].id, "NORMAL");
  }
}
