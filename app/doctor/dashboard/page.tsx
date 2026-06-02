import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/session";
import { getRedirectForRole } from "../../lib/authService";

export default async function DoctorDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "doctor") {
    redirect(getRedirectForRole(user.role) || "/login");
  }

  redirect("/doctor-dashboard");

  return null;
}
