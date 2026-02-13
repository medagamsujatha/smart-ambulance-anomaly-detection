import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 shadow-2xl">
        <CardContent className="pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">404 Patient Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested resource could not be located in the system records.
          </p>
          <Link href="/">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
