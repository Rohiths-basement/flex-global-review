import { AuthGuard } from "@/components/AuthGuard";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardClient />
    </AuthGuard>
  );
}
