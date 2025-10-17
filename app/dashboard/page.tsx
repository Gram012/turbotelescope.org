// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard-content";
import { isAdminSession } from "@/lib/authz";
import { getSuccessOrFail, getRecentImageEvents } from "@/lib/database.server";

export const revalidate = 0;

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard");
  if (isAdminSession(session)) redirect("/admin");

  // ✅ fetch on the server
  const successOrFail = await getSuccessOrFail();
  const recent = await getRecentImageEvents();

  return (
    <DashboardContent
      showWazAlerts={false}
      owner="patkel"
      repo="turbo_telescope"
      successOrFail={successOrFail} // ✅ pass it
      recent={recent} // ✅ pass it
    />
  );
}
