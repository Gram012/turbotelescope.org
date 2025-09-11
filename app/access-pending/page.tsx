"use client";

export default function AccessPendingPage() {
  // Minimal blank screen with the logo pulsing in the center
  return (
    <main className="min-h-screen grid place-items-center bg-white">
      <img
        src="/turboIconB.png"
        alt="TURBO Telescope"
        className="w-16 h-16 animate-pulse"
      />
    </main>
  );
}
