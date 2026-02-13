import { usePatients } from "@/hooks/use-patients";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: patients, isLoading } = usePatients();
  const [search, setSearch] = useState("");

  const filteredPatients = patients?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.condition.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Overview</h2>
          <p className="text-muted-foreground">Monitor all active patients in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Search patients..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full md:w-64 bg-card border-border/50 focus:ring-primary/50" 
                />
            </div>
          <Link href="/patients/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">
              <UserPlus className="w-4 h-4 mr-2" />
              Admit Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: patients?.length || 0, color: "text-foreground" },
          { label: "Critical Status", value: 2, color: "text-destructive" }, // Mock data for example
          { label: "Active Alerts", value: 5, color: "text-warning" },
          { label: "Sensors Online", value: "98%", color: "text-emerald-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/50 border border-border/50 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</div>
            <div className={cn("text-2xl font-bold font-mono", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Patient Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <PatientSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map(patient => (
            <Link key={patient.id} href={`/patients/${patient.id}`} className="group block h-full">
              <Card className="h-full border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden relative">
                {/* Status Indicator Bar */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20" />
                
                <CardContent className="p-6 pl-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {patient.name}
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1 flex gap-2">
                        <span>{patient.age} yrs</span>
                        <span>•</span>
                        <span>{patient.gender}</span>
                      </div>
                    </div>
                    {patient.isActive ? (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="secondary">Discharged</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Condition</span>
                        <div className="font-medium text-sm flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-primary" />
                            {patient.condition}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-2">
                            {/* Mock avatars for care team */}
                            {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                    DR
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform">
                            View Monitor <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {filteredPatients.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No patients found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PatientSkeleton() {
  return (
    <div className="h-64 rounded-xl border border-border/50 bg-card/30 p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-32 bg-secondary" />
        <Skeleton className="h-6 w-16 bg-secondary" />
      </div>
      <Skeleton className="h-4 w-20 bg-secondary" />
      <Skeleton className="h-20 w-full bg-secondary/50 rounded-lg mt-4" />
      <div className="flex justify-between items-center mt-6">
        <Skeleton className="h-8 w-24 rounded-full bg-secondary" />
        <Skeleton className="h-4 w-24 bg-secondary" />
      </div>
    </div>
  );
}
