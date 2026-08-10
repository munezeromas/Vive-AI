export type UserRole = "student" | "teacher" | "parent" | "admin";

export function dashboardForRole(role?: string | null) {
  if (role === "teacher" || role === "admin") return "/teacher";
  if (role === "parent") return "/parent";
  return "/student";
}
