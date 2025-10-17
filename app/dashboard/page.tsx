import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard-content";
import { getTableData, getSuccessOrFail } from "@/lib/database";

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard");

  const [tableData, successOrFail] = await Promise.all([
    getTableData(),
    getSuccessOrFail(),
  ]);

  return (
    <DashboardContent
      owner="patkel"
      repo="turbo_telescope"
      showWazAlerts={false}
      tableData={tableData}
      successOrFail={successOrFail}
    />
  );
}
