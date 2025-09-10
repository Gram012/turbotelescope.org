// app/dashboard/users/page.tsx
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TeamMembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard/users");
  if (!isActiveUser(session)) redirect("/access-pending");

  const isAdmin = isAdminSession(session);

  let users: DBUser[] = [];
  let loadError: string | null = null;
  try {
    users = await listUsers();
  } catch (e: any) {
    loadError = e?.message || "Failed to load users.";
  }

  async function addUserAction(formData: FormData) {
    "use server";
    const s = await getServerSession(authOptions);
    if (!isAdminSession(s)) return;
    const login = (formData.get("github_login") as string | null)
      ?.trim()
      .toLowerCase();
    if (!login) return;
    await addOrActivateUser(login, "user");
    revalidatePath("/dashboard/users");
  }

  async function changeRoleAction(formData: FormData) {
    "use server";
    const s = await getServerSession(authOptions);
    if (!isAdminSession(s)) return;
    const login = (formData.get("login") as string | null)
      ?.trim()
      .toLowerCase();
    const role = formData.get("role") as "user" | "admin" | null;
    if (!login || (role !== "user" && role !== "admin")) return;
    await setUserRole(login, role);
    revalidatePath("/dashboard/users");
  }

  const UsersClient = (await import("./users-client")).default;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <h1 className="text-lg font-semibold">Team Members</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <UsersClient
            users={users}
            isAdmin={isAdmin}
            addUserAction={addUserAction}
            changeRoleAction={changeRoleAction}
            loadError={loadError}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
