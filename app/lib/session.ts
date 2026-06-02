import { cookies } from "next/headers";
import { getUserFromSession, SESSION_COOKIE_NAME } from "./authService";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return await getUserFromSession(sessionCookie);
  } catch {
    return null;
  }
}
