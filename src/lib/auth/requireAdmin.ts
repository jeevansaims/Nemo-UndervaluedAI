import { getServerRole } from "./serverRole";

export async function requireAdmin() {
  const role = await getServerRole();
  if (role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
}
