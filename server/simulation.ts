
import { storage } from "./storage";
import { type InsertVital, type InsertAlert } from "@shared/schema";

// Types for our simulation
type PatientState = {
  patientId: number;
  scenario: "NORMAL" | "DISTRESS" | "ARTIFACT_NOISE" | "CONNECTION_LOSS";
  lastVital: {
    heartRate: number;
    spo2: number;
    bpSystolic: number;
    bpDiastolic: number;
    motion: number;
  };
  intervalId?: NodeJS.Timeout;
};

export class PatientSimulator {
  private patients: Map<number, PatientState> = new Map();
  private storage: any; // typed as any to avoid circular dep issues if interface isn't perfectly matched, but effectively IStorage

  constructor(storageInstance: any) {
    this.storage = storageInstance;
  }

  // Start simulation for a patient
  startSimulation(patientId: number, scenario: PatientState["scenario"] = "NORMAL") {
    if (this.patients.has(patientId)) {
      this.updateScenario(patientId, scenario);
      return;
    }

    const initialState: PatientState = {
      patientId,
      scenario,
      lastVital: {
        heartRate: 75,
        spo2: 98,
        bpSystolic: 120,
        bpDiastolic: 80,
        motion: 0,
      },
    };

    // Start loop
    initialState.intervalId = setInterval(() => this.tick(patientId), 1000);
    this.patients.set(patientId, initialState);
    console.log(`Started simulation for patient ${patientId} in ${scenario} mode`);
  }

  stopSimulation(patientId: number) {
    const state = this.patients.get(patientId);
    if (state?.intervalId) {
      clearInterval(state.intervalId);
    }
    this.patients.delete(patientId);
  }

  updateScenario(patientId: number, scenario: PatientState["scenario"]) {
    const state = this.patients.get(patientId);
    if (state) {
      state.scenario = scenario;
      console.log(`Updated patient ${patientId} scenario to ${scenario}`);
    }
  }

  // Main simulation tick (every second)
  private async tick(patientId: number) {
    const state = this.patients.get(patientId);
    if (!state) return;

    // 1. Generate next vital state based on scenario
    const nextVital = this.generateNextVital(state.lastVital, state.scenario);
    state.lastVital = nextVital;

    // 2. Detect Artifacts (Task 1B)
    const isArtifact = this.detectArtifact(nextVital);

    // 3. Anomaly Detection & Risk Scoring (Task 2A, 2B)
    // We compute this even if artifact, but flag it
    const risk = this.calculateRisk(nextVital);

    // 4. Store Vital
    const vitalInput: InsertVital = {
      patientId,
      heartRate: nextVital.heartRate,
      spo2: nextVital.spo2,
      bpSystolic: nextVital.bpSystolic,
      bpDiastolic: nextVital.bpDiastolic,
      motion: nextVital.motion,
      isArtifact,
      confidence: isArtifact ? 0.3 : 0.95, // Simple confidence logic
    };

    await this.storage.addVital(vitalInput);

    // 5. Generate Alerts if Critical and NOT an artifact (or if persistent)
    if (!isArtifact && risk.level === "CRITICAL") {
      // Simple suppression: don't spam. In real app, check last alert time.
      // For now, we'll just insert.
      const alertInput: InsertAlert = {
        patientId,
        type: "CRITICAL",
        message: `Critical Vitals Detected: ${risk.factors.join(", ")}`,
        riskScore: risk.score,
        acknowledged: false,
      };
      
      // Throttle alerts: check if we sent one recently? 
      // For this assignment MVP, we'll just log it to DB. Frontend can handle dedupe display.
       // optimization: check last alert
       const recentAlerts = await this.storage.getAlerts(patientId);
       const lastAlert = recentAlerts[0];
       const now = new Date();
       if (!lastAlert || (now.getTime() - new Date(lastAlert.timestamp!).getTime() > 10000)) {
           await this.storage.addAlert(alertInput);
       }
    } else if (isArtifact && nextVital.motion > 8) {
         // Maybe alert on severe motion artifact if it persists?
    }
  }

  // Task 1A: Data Generation Logic
  private generateNextVital(last: PatientState["lastVital"], scenario: PatientState["scenario"]) {
    // Helper for random noise
    const noise = (amp: number) => (Math.random() - 0.5) * amp;

    let hr = last.heartRate + noise(2);
    let spo2 = last.spo2 + noise(0.5);
    let sys = last.bpSystolic + noise(1);
    let dia = last.bpDiastolic + noise(1);
    let motion = Math.max(0, noise(1)); // Base motion

    // Apply Scenario Drifts
    if (scenario === "DISTRESS") {
      hr += 0.5; // Drift up
      spo2 -= 0.1; // Drift down
      sys -= 0.2; // Drop (shock?)
    } else if (scenario === "ARTIFACT_NOISE") {
      motion = 5 + Math.random() * 5; // High motion
      // Motion causes random spikes
      if (Math.random() > 0.7) hr += 20; 
      if (Math.random() > 0.7) spo2 -= 5;
    } else if (scenario === "CONNECTION_LOSS") {
        // Drop to zero or hold last value? Let's drop to zero to simulate probe off
        if (Math.random() > 0.8) {
            hr = 0; spo2 = 0;
        }
    }

    // Boundaries / Physiology Limits
    hr = Math.max(30, Math.min(200, hr));
    spo2 = Math.max(60, Math.min(100, spo2));
    sys = Math.max(50, Math.min(200, sys));
    dia = Math.max(30, Math.min(120, dia));
    
    // Normal restoration if switching back to normal
    if (scenario === "NORMAL") {
        hr = hr + (75 - hr) * 0.05; // Return to baseline
        spo2 = spo2 + (98 - spo2) * 0.05;
        sys = sys + (120 - sys) * 0.05;
        dia = dia + (80 - dia) * 0.05;
    }

    return { heartRate: hr, spo2, bpSystolic: sys, bpDiastolic: dia, motion };
  }

  // Task 1B: Artifact Detection
  private detectArtifact(vital: PatientState["lastVital"]): boolean {
    // 1. Motion Artifact
    if (vital.motion > 4.0) return true;

    // 2. Physiological Impossibility (e.g. HR change > 20 in 1 sec - handled in smoothing, but let's check extremes)
    if (vital.heartRate <= 35 || vital.heartRate >= 190) return true; // Extreme bounds often noise
    if (vital.spo2 < 70 && vital.motion > 2) return true; // Low SpO2 with motion is suspicious

    return false;
  }

  // Task 2B: Risk Scoring (NEWS2 Simplified)
  private calculateRisk(vital: PatientState["lastVital"]): { score: number, level: string, factors: string[] } {
    let score = 0;
    const factors: string[] = [];

    // HR
    if (vital.heartRate < 40 || vital.heartRate > 130) { score += 3; factors.push("HR Critical"); }
    else if (vital.heartRate > 110) { score += 1; factors.push("HR High"); }

    // SpO2
    if (vital.spo2 < 92) { score += 3; factors.push("SpO2 Critical"); }
    else if (vital.spo2 < 95) { score += 1; factors.push("SpO2 Low"); }

    // BP
    if (vital.bpSystolic < 90) { score += 3; factors.push("Hypotension"); }
    else if (vital.bpSystolic > 200) { score += 2; factors.push("Hypertension"); }

    // Level
    let level = "LOW";
    if (score >= 7) level = "CRITICAL";
    else if (score >= 5) level = "HIGH";
    else if (score >= 1) level = "MODERATE";

    return { score, level, factors };
  }
  
  // Public accessor for API
  getRiskAssessment(patientId: number) {
      const state = this.patients.get(patientId);
      if (!state) return { riskScore: 0, riskLevel: "LOW", factors: [] };
      return this.calculateRisk(state.lastVital);
  }
}
