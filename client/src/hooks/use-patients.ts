import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Patient, Vital, Alert, InsertPatient } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// === PATIENTS ===

export function usePatients() {
  return useQuery({
    queryKey: [api.patients.list.path],
    queryFn: async () => {
      const res = await fetch(api.patients.list.path);
      if (!res.ok) throw new Error("Failed to fetch patients");
      return api.patients.list.responses[200].parse(await res.json());
    },
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: [api.patients.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.patients.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch patient");
      return api.patients.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPatient) => {
      const res = await fetch(api.patients.create.path, {
        method: api.patients.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create patient");
      }
      return api.patients.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.patients.list.path] });
      toast({ title: "Success", description: "Patient registered successfully" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}

// === VITALS ===

export function useVitals(patientId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: [api.vitals.list.path, patientId],
    queryFn: async () => {
      const url = buildUrl(api.vitals.list.path, { patientId });
      const res = await fetch(`${url}?limit=50`); // Fetch last 50 points
      if (!res.ok) throw new Error("Failed to fetch vitals");
      return api.vitals.list.responses[200].parse(await res.json());
    },
    enabled: !!patientId && enabled,
    refetchInterval: 1000, // Poll every second for "real-time" feel
  });
}

export function usePatientStats(patientId: number) {
  return useQuery({
    queryKey: [api.vitals.stats.path, patientId],
    queryFn: async () => {
      const url = buildUrl(api.vitals.stats.path, { patientId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.vitals.stats.responses[200].parse(await res.json());
    },
    enabled: !!patientId,
    refetchInterval: 2000,
  });
}

// === ALERTS ===

export function useAlerts(patientId: number) {
  return useQuery({
    queryKey: [api.alerts.list.path, patientId],
    queryFn: async () => {
      const url = buildUrl(api.alerts.list.path, { patientId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return api.alerts.list.responses[200].parse(await res.json());
    },
    enabled: !!patientId,
    refetchInterval: 2000,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.alerts.acknowledge.path, { id });
      const res = await fetch(url, { method: api.alerts.acknowledge.method });
      if (!res.ok) throw new Error("Failed to acknowledge alert");
      return api.alerts.acknowledge.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      // Invalidate specific alert list logic would be complex to target exactly, 
      // but simplistic invalidation works for this scope.
      queryClient.invalidateQueries({ queryKey: [api.alerts.list.path] });
    },
  });
}

// === SIMULATION ===

export function useSimulationToggle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { patientId: number; scenario: "NORMAL" | "DISTRESS" | "ARTIFACT_NOISE" | "CONNECTION_LOSS"; running: boolean }) => {
      const res = await fetch(api.simulation.toggle.path, {
        method: api.simulation.toggle.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to toggle simulation");
      return api.simulation.toggle.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: "Simulation Updated", 
        description: `${variables.scenario} scenario ${variables.running ? 'started' : 'stopped'}` 
      });
      // Invalidate everything to refresh state immediately
      queryClient.invalidateQueries({ queryKey: [api.vitals.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.vitals.stats.path] });
      queryClient.invalidateQueries({ queryKey: [api.alerts.list.path] });
    },
  });
}
