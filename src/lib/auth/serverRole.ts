import { auth } from "@/lib/auth";
import { roleFromEmail, type Role } from "@/lib/auth/roles";

export async function getServerRole(): Promise<Role> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  return roleFromEmail(email);
}
