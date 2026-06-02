import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/session";
import { getRedirectForRole } from "../../lib/authService";

export default async function PatientDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/patient/login");
  }

  if (user.role !== "patient") {
    redirect(getRedirectForRole(user.role) || "/login");
  }

  // Send patients to the more feature-rich patient-home UI
  redirect("/patient-home");
}
