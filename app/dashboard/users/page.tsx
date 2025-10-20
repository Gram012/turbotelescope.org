import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isAdminSession, SUPER_ADMINS } from "@/lib/authz";
import {
  listUsers,
  addOrActivateUser,
  setUserRole,
  deactivateUser,
  deleteUserByLogin,
  type DBUser,
} from "@/lib/user";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TeamMembersPage() {
  //Require sign-in
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard/users");

  const isAdmin = isAdminSession(session);

  //Load users (and surface any DB error in the client)
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

    const login = String(formData.get("github_login") || "")
      .trim()
      .toLowerCase();
    if (!login) return;

    await addOrActivateUser(login, "user");
    revalidatePath("/dashboard/users");
  }

  async function changeRoleAction(formData: FormData) {
    "use server";
    const s = await getServerSession(authOptions);
    if (!isAdminSession(s)) return;

    const login = String(formData.get("login") || "")
      .trim()
      .toLowerCase();
    const role = String(formData.get("role") || "");
    if (!login || (role !== "user" && role !== "admin")) return;

    await setUserRole(login, role as "user" | "admin");
    revalidatePath("/dashboard/users");
  }

  async function removeUserAction(formData: FormData) {
    "use server";
    const s = await getServerSession(authOptions);
    if (!isAdminSession(s)) return;

    const actorLogin = String((s.user as any).login || "").toLowerCase();
    const login = String(formData.get("login") || "")
      .trim()
      .toLowerCase();
    const mode = String(formData.get("mode") || "deactivate");

    if (!login) return;

    if (login === actorLogin) return;
    if (SUPER_ADMINS.has(login)) return;

    if (mode === "delete") {
      await deleteUserByLogin(login);
    } else {
      await deactivateUser(login);
    }
    revalidatePath("/dashboard/users");
  }

  // Client component render
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
            removeUserAction={removeUserAction}
            loadError={loadError}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
