"use client";

import { Button } from "@/components/ui/button";

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[/dashboard/users] error boundary:", error);
  return (
    <div className="min-h-[40vh] p-8 flex flex-col items-center justify-center text-center">
      <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-slate-600 mb-4">
        {error.message || "The Team Members page failed to load."}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Go back
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-slate-400 mt-3">Error id: {error.digest}</p>
      )}
    </div>
  );
}
