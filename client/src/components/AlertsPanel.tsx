import { useAlerts, useAcknowledgeAlert } from "@/hooks/use-patients";
import { Alert } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AlertsPanelProps {
  patientId: number;
}

export function AlertsPanel({ patientId }: AlertsPanelProps) {
  const { data: alerts, isLoading } = useAlerts(patientId);
  const { mutate: acknowledge } = useAcknowledgeAlert();

  if (isLoading) return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Loading alerts...</div>;

  const sortedAlerts = alerts?.slice().sort((a, b) => 
    new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
  ) || [];

  return (
    <div className="h-full flex flex-col bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/30">
        <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Recent Alerts</h3>
        </div>
        <span className="text-xs font-mono bg-background px-2 py-1 rounded-full border border-border">
            {sortedAlerts.filter(a => !a.acknowledged).length} Active
        </span>
      </div>
      
      <ScrollArea className="flex-1 p-0">
        <div className="p-2 space-y-2">
            <AnimatePresence>
            {sortedAlerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No recent alerts</div>
            ) : (
                sortedAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onAcknowledge={() => acknowledge(alert.id)} />
                ))
            )}
            </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}

function AlertItem({ alert, onAcknowledge }: { alert: Alert; onAcknowledge: () => void }) {
  const isCritical = alert.type === "CRITICAL";
  const isWarning = alert.type === "WARNING";
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "relative p-3 rounded-lg border flex flex-col gap-2 transition-all",
        alert.acknowledged ? "opacity-60 bg-secondary/50 border-transparent" : "bg-card hover:border-primary/50",
        isCritical && !alert.acknowledged && "border-destructive/50 bg-destructive/10 shadow-[0_0_15px_-5px_hsl(var(--destructive)/0.3)]",
        isWarning && !alert.acknowledged && "border-warning/50 bg-warning/10"
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full border",
            isCritical ? "bg-destructive text-destructive-foreground border-destructive" :
            isWarning ? "bg-warning/20 text-warning border-warning" : "bg-muted text-muted-foreground border-border"
        )}>
            {alert.type}
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            {alert.timestamp && formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
        </span>
      </div>
      
      <p className="text-sm font-medium leading-tight">{alert.message}</p>
      
      {!alert.acknowledged && (
        <Button 
            size="sm" 
            variant="ghost" 
            className="w-full h-7 text-xs mt-1 hover:bg-background/50 hover:text-primary"
            onClick={onAcknowledge}
        >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Acknowledge
        </Button>
      )}
    </motion.div>
  );
}
