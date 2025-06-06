import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionAuthProvider } from "@/components/session-provider"; // <-- this is the wrapper we defined

export const metadata: Metadata = {
  title: "TURBO Dashboard",
  description: "TURBO Telescope Admin Dashboard",
  generator: "me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionAuthProvider>
          {children}
          <Toaster />
        </SessionAuthProvider>
      </body>
    </html>
  );
}
