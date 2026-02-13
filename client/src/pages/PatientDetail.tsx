import { usePatient, useVitals, usePatientStats } from "@/hooks/use-patients";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { VitalCard } from "@/components/VitalCard";
import { RealtimeChart } from "@/components/RealtimeChart";
import { AlertsPanel } from "@/components/AlertsPanel";
import { SimulationPanel } from "@/components/SimulationPanel";
import { cn } from "@/lib/utils";
import NotFound from "./not-found";

export default function PatientDetail() {
  const [match, params] = useRoute("/patients/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: patient, isLoading: loadingPatient } = usePatient(id);
  const { data: vitals = [] } = useVitals(id);
  const { data: stats } = usePatientStats(id);

  if (loadingPatient) return <div className="p-12 text-center text-muted-foreground animate-pulse">Initializing monitor...</div>;
  if (!patient) return <NotFound />;

  const latestVital = vitals[0] || {};
  const riskLevel = stats?.riskLevel || "LOW";

  const riskColor = {
    LOW: "bg-emerald-500",
    MODERATE: "bg-yellow-500",
    HIGH: "bg-orange-500",
    CRITICAL: "bg-destructive animate-pulse"
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Patient Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono mt-1">
              <span className="bg-secondary px-2 py-0.5 rounded">ID: {patient.id.toString().padStart(6, '0')}</span>
              <span>{patient.gender}, {patient.age}y</span>
              <span className="text-primary">• {patient.condition}</span>
            </div>
          </div>
        </div>

        {/* Risk Score Indicator */}
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border border-border/50 shadow-lg">
            <div className="text-right">
                <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Risk Level</div>
                <div className={cn("text-lg font-bold", riskLevel === "CRITICAL" ? "text-destructive" : "text-foreground")}>
                    {riskLevel}
                </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center relative overflow-hidden">
                <div className={cn("absolute inset-0 opacity-20", riskColor[riskLevel])} />
                <span className="font-bold text-sm">{stats?.riskScore.toFixed(0) || 0}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Column: Vitals Summary & Alerts */}
        <div className="lg:col-span-1 flex flex-col gap-6 space-y-6 lg:space-y-0 h-full overflow-y-auto">
            {/* Current Vitals Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <VitalCard 
                    label="Heart Rate" 
                    value={latestVital.heartRate?.toFixed(0) || "--"} 
                    unit="bpm" 
                    icon="heart"
                    status={latestVital.heartRate > 100 || latestVital.heartRate < 60 ? "warning" : "normal"}
                />
                <VitalCard 
                    label="SpO2" 
                    value={latestVital.spo2?.toFixed(0) || "--"} 
                    unit="%" 
                    icon="wind"
                    status={latestVital.spo2 < 95 ? "critical" : "normal"}
                />
                <VitalCard 
                    label="BP Systolic" 
                    value={latestVital.bpSystolic?.toFixed(0) || "--"} 
                    unit="mmHg" 
                    icon="activity"
                    status={latestVital.bpSystolic > 140 ? "warning" : "normal"}
                />
                 <VitalCard 
                    label="Motion Index" 
                    value={latestVital.motion?.toFixed(2) || "0.0"} 
                    unit="G" 
                    icon="activity"
                    status="normal"
                />
            </div>

            {/* Alerts Panel */}
            <div className="flex-1 min-h-[300px]">
                <AlertsPanel patientId={id} />
            </div>
        </div>

        {/* Right Column: Charts & Controls */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[400px]">
                <RealtimeChart 
                    label="ECG / Heart Rate History" 
                    data={vitals} 
                    dataKey="heartRate" 
                    color="#10b981" // emerald-500
                    domain={[40, 160]}
                />
                <RealtimeChart 
                    label="Oxygen Saturation (SpO2)" 
                    data={vitals} 
                    dataKey="spo2" 
                    color="#3b82f6" // blue-500
                    domain={[85, 100]}
                />
                <div className="md:col-span-2 h-48">
                    <RealtimeChart 
                        label="Blood Pressure (Systolic)" 
                        data={vitals} 
                        dataKey="bpSystolic" 
                        color="#f59e0b" // amber-500
                        domain={[80, 180]}
                        height={180}
                    />
                </div>
            </div>

            {/* Simulation Controls */}
            <div className="mt-auto">
                <SimulationPanel patientId={id} />
            </div>
        </div>
      </div>
    </div>
  );
}
