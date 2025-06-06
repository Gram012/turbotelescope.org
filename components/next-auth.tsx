"use client";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export function useAuth({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
