"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content";

/**
 * AdminDashboard toggles between normal admin view and "View as default user".
 * - In user view: WAZ Alerts hidden, blue ring overlay, Exit control.
 * - Sidebar remains visible in BOTH modes (rendered by DashboardContent).
 */
export function AdminDashboard() {
  const [userView, setUserView] = useState(false);

  const impersonationControls = !userView ? (
    <Button size="sm" variant="secondary" onClick={() => setUserView(true)}>
      <Eye className="w-4 h-4 mr-2" />
      View as default
    </Button>
  ) : (
    <Button size="sm" onClick={() => setUserView(false)}>
      <EyeOff className="w-4 h-4 mr-2" />
      Exit user view
    </Button>
  );

  return (
    <>
      <DashboardContent
        owner="patkel"
        repo="turbo_telescope"
        showWazAlerts={!userView}
        impersonationControls={impersonationControls}
        disableAuthGuard
      />

      {/* Blue ring + label when impersonating (covers entire viewport incl. sidebar) */}
      {userView && (
        <>
          <div className="pointer-events-none fixed inset-2 rounded-2xl ring-4 ring-blue-500 z-[60]" />
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[61]">
            <span className="rounded-full bg-blue-600 text-white text-xs px-3 py-1 shadow">
              Viewing as default user
            </span>
          </div>
        </>
      )}
    </>
  );
}
