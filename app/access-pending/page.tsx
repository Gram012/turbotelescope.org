"use client";

import { apiUrl } from "@/lib/utils";

export default function AccessPendingPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-white">
      <img
        src={apiUrl("/turboIconB.png")}
        alt="TURBO Telescope"
        className="w-16 h-16 animate-pulse"
      />
    </main>
  );
}
