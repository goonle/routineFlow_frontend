"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{error.message || "An unexpected error occurred."}</p>
      </div>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
