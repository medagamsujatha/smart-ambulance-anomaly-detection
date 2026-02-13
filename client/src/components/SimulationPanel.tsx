import { useSimulationToggle } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, WifiOff, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationPanelProps {
  patientId: number;
}

export function SimulationPanel({ patientId }: SimulationPanelProps) {
  const { mutate: toggleSim, isPending } = useSimulationToggle();

  const scenarios = [
    { id: "NORMAL", label: "Normal Rhythm", icon: Activity, color: "text-emerald-500", desc: "Stable vitals" },
    { id: "DISTRESS", label: "Cardiac Distress", icon: AlertTriangle, color: "text-destructive", desc: "Elevated HR, Low SpO2" },
    { id: "ARTIFACT_NOISE", label: "Motion Artifact", icon: Zap, color: "text-amber-500", desc: "Noisy signal data" },
    { id: "CONNECTION_LOSS", label: "Sensor Loss", icon: WifiOff, color: "text-muted-foreground", desc: "Signal dropout" },
  ] as const;

  return (
    <Card className="border-border/50 shadow-lg shadow-black/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" />
          Simulation Control
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((scenario) => (
          <Button
            key={scenario.id}
            variant="outline"
            disabled={isPending}
            onClick={() => toggleSim({ patientId, scenario: scenario.id, running: true })}
            className="h-auto py-4 flex flex-col items-start gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-2 w-full">
              <scenario.icon className={cn("w-5 h-5", scenario.color)} />
              <span className="font-semibold">{scenario.label}</span>
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-primary/80 text-left">
              {scenario.desc}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
