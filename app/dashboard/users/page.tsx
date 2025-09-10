import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isActiveUser, isAdminSession } from "@/lib/authz";
import {
  addOrActivateUser,
  listUsers,
  setUserRole,
  type DBUser,
} from "@/lib/user";
import { revalidatePath } from "next/cache";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import UsersClient from "./users-client";

export const runtime = "nodejs"; // pg requires Node runtime
export const dynamic = "force-dynamic"; // avoid stale caches on client nav

export default async function TeamMembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard/users");
  if (!isActiveUser(session)) redirect("/access-pending");

  const admin = isAdminSession(session);

  let users: DBUser[] = [];
  let loadError: string | null = null;

  try {
    users = await listUsers();
  } catch (e: any) {
    // Surface DB error (e.g., ETIMEDOUT / relation doesn't exist)
    loadError =
      e?.message ||
      "Failed to load users (check DATABASE_URL, network access, and schema).";
  }

  // --- server actions ---
  async function addUserAction(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) return;
    const login = (formData.get("github_login") as string | null)
      ?.trim()
      .toLowerCase();
    if (!login) return;
    await addOrActivateUser(login, "user");
    revalidatePath("/dashboard/users");
  }

  async function changeRoleAction(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) return;
    const login = (formData.get("login") as string | null)
      ?.trim()
      .toLowerCase();
    const role = formData.get("role") as "user" | "admin" | null;
    if (!login || (role !== "user" && role !== "admin")) return;
    await setUserRole(login, role);
    revalidatePath("/dashboard/users");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Page header to match your dashboard look */}
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <h1 className="text-lg font-semibold">Team Members</h1>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <UsersClient
            users={users}
            isAdmin={admin}
            addUserAction={addUserAction}
            changeRoleAction={changeRoleAction}
            loadError={loadError}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
