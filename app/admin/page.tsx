// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/authz";
import { AdminDashboard } from "@/components/admin-dashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/admin");
  if (!isAdminSession(session)) redirect("/dashboard");

  return <AdminDashboard />;
}
