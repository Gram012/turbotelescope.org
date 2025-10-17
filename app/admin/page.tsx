export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getTableData, getSuccessOrFail } from "@/lib/database";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/admin");

  const [tableData, successOrFail] = await Promise.all([
    getTableData(),
    getSuccessOrFail(),
  ]);

  return <AdminDashboard tableData={tableData} successOrFail={successOrFail} />;
}
