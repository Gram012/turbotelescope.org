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
import UsersClient from "./users-client";

export const runtime = "nodejs";

export default async function TeamMembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard/users");
  if (!isActiveUser(session)) redirect("/access-pending");

  const admin = isAdminSession(session);

  // Fetch all users. If not admin, you could filter here to only active users.
  const users = await listUsers();

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
    <UsersClient
      users={users}
      isAdmin={admin}
      addUserAction={addUserAction}
      changeRoleAction={changeRoleAction}
    />
  );
}
