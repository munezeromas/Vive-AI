import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { dashboardForRole, type UserRole } from "@/lib/auth-utils";

export function RequireAuth({
  roles,
  children,
}: {
  roles?: UserRole[];
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const sessionState = useSession() as any;
  const session = sessionState.data;
  const isPending = sessionState.isPending || sessionState.isLoading;
  const role = session?.user?.role as UserRole | undefined;

  const isWrongRole = roles && role && !roles.includes(role);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      navigate({ to: "/login" });
      return;
    }
    if (isWrongRole) {
      navigate({ to: dashboardForRole(role) as any });
    }
  }, [isPending, isWrongRole, navigate, role, session?.user]);

  // Still loading session — show spinner
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  // Not authenticated — redirect is in-flight, render nothing
  if (!session?.user) return null;

  // Wrong role — redirect is in-flight, render nothing
  if (isWrongRole) return null;

  return <>{children}</>;
}
