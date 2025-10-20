export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/authz";
import { DashboardContent } from "@/components/dashboard-content";
import { getTableData, getSuccessOrFail } from "@/lib/database";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard");

  if (isAdminSession(session)) redirect("/admin");

  const [tableData, successOrFail] = await Promise.all([
    getTableData(),
    getSuccessOrFail(),
  ]);

  return (
    <DashboardContent
      showWazAlerts={false}
      owner="patkel"
      repo="turbo_telescope"
      tableData={tableData}
      successOrFail={successOrFail}
    />
  );
}
