"use client";

import { Loader2 } from "lucide-react";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 animate-spin text-primary animate-pulse" />
        <p className="text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-700">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
