// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTableData, getSuccessOrFail } from "@/lib/database";
import { AdminDashboard } from "@/components/admin-dashboard";

export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/admin");

  const [tableData, successOrFail] = await Promise.all([
    getTableData(),
    getSuccessOrFail(),
  ]);

  return <AdminDashboard tableData={tableData} successOrFail={successOrFail} />;
}
