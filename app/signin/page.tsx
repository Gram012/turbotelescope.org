"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img
            src="/turboIconB.png"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            Sign in with GitHub
          </h1>
          <p className="text-slate-600">Access the TURBO dashboard</p>
        </div>
        <Button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full bg-black hover:bg-gray-900 text-white"
        >
          <Github className="mr-2 w-5 h-5" />
          Sign in with GitHub
        </Button>
        <div className="text-center mt-4">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
