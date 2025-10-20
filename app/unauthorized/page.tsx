"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-red-600 text-xl">!</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Oops, looks like you don&apos;t have access to this page.
        </h1>
        <p className="mt-2 text-slate-600">
          If you think this is a mistake, contact an administrator to request
          access.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go to Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/api/auth/signin">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
