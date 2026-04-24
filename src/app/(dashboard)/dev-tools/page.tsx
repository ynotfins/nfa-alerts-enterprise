"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Database, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DevToolsPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeedIncidents = async () => {
    setIsSeeding(true);
    try {
      toast.info("Firebase seeding not implemented");
      setSeeded(false);
    } catch {
      toast.error("Failed to seed incidents");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <h1 className="text-xl font-bold">Dev Tools</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="text-sm text-muted-foreground mb-6">
          Development utilities for testing
        </p>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Database className="h-5 w-5" />
                Demo Data
              </CardTitle>
              <CardDescription>
                Seed the database with demo incidents for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSeedIncidents}
                disabled={isSeeding || seeded}
                className="w-full h-11"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Seeding Incidents...
                  </>
                ) : seeded ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Demo Incidents Created
                  </>
                ) : (
                  "Seed Demo Incidents"
                )}
              </Button>
              {seeded && (
                <p className="text-sm text-muted-foreground mt-4">
                   8 demo incidents created in Miami-Dade area (fire, flood, storm, wind, hail, other)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Node Env:</span>
                <span className="font-mono">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next.js:</span>
                <span className="font-mono">16.0.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">React:</span>
                <span className="font-mono">19.2.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
