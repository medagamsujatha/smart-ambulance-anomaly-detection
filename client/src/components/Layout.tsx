import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, LayoutDashboard, Plus, Settings, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Monitor", icon: LayoutDashboard },
    { href: "/patients/new", label: "Admit Patient", icon: Plus },
    { href: "/settings", label: "System Config", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border/50 bg-card/50 flex-shrink-0 flex flex-col h-16 md:h-screen sticky top-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-border/50 bg-background/50 backdrop-blur-md">
          <Activity className="w-6 h-6 text-primary mr-3 animate-pulse" />
          <span className="text-lg font-bold tracking-tight">
            Medi<span className="text-primary">Guard</span> OS
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] border border-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.label}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="rounded-xl bg-gradient-to-br from-card to-secondary p-4 border border-border/50">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
              <LifeBuoy className="w-3 h-3" />
              <span>System Status</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Online</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-md z-40">
          <h1 className="text-lg font-semibold text-foreground/80">
            {location === "/" ? "Active Monitoring Unit" : "Patient Care System"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
           {/* Background Grid Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
          <div className="relative z-10 max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
