// app/dashboard/users/users-client.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";

type DBUser = {
  id: number;
  github_id: string | number | null;
  github_login: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

export default function UsersClient({
  users,
  isAdmin,
  addUserAction,
  changeRoleAction,
  loadError,
}: {
  users: DBUser[];
  isAdmin: boolean;
  addUserAction: (formData: FormData) => Promise<void>;
  changeRoleAction: (formData: FormData) => Promise<void>;
  loadError?: string | null;
}) {
  // ... (unchanged except add the alert)
  // header …
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <p className="text-slate-600 mt-1">
            Manage access and roles for your organization.
          </p>
        </div>
        {/* Add user button (admin only) … unchanged */}
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
          {loadError}
        </div>
      )}

      <Separator />

      {/* …rest of component unchanged */}
    </main>
  );
}
