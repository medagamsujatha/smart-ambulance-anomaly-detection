import { cn } from "@/lib/utils";
import { Activity, Heart, Wind, Thermometer } from "lucide-react";

interface VitalCardProps {
  label: string;
  value: number | string;
  unit: string;
  trend?: "up" | "down" | "stable";
  status?: "normal" | "warning" | "critical";
  icon?: "heart" | "wind" | "temp" | "activity";
}

export function VitalCard({ label, value, unit, status = "normal", icon = "activity" }: VitalCardProps) {
  const IconMap = {
    heart: Heart,
    wind: Wind,
    temp: Thermometer,
    activity: Activity,
  };

  const Icon = IconMap[icon];

  const statusColor = {
    normal: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
    warning: "text-amber-500 border-amber-500/20 bg-amber-500/5",
    critical: "text-destructive border-destructive/20 bg-destructive/5 animate-pulse-soft",
  };

  const iconColor = {
    normal: "text-emerald-500",
    warning: "text-amber-500",
    critical: "text-destructive",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg",
      statusColor[status]
    )}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</h3>
        <div className={cn("p-2 rounded-full bg-background/50 backdrop-blur-sm", iconColor[status])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "text-4xl font-mono font-bold tracking-tight",
          status === "critical" && "animate-pulse"
        )}>
          {value}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </div>

      {/* Decorative scanline background */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-gradient-to-t from-transparent via-current to-transparent bg-[length:100%_4px]" />
    </div>
  );
}
