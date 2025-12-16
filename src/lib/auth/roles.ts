export type Role = "PUBLIC" | "USER" | "ADMIN";

export function roleFromEmail(email?: string | null): Role {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (email && adminEmails.includes(email.toLowerCase())) return "ADMIN";
  return email ? "USER" : "PUBLIC";
}
