import { createFileRoute } from "@tanstack/react-router";
import { StudentLayout } from "@/components/vive/StudentLayout";
import { RequireAuth } from "@/components/vive/RequireAuth";

export const Route = createFileRoute("/student")({
  component: () => (
    <RequireAuth roles={["student"]}>
      <StudentLayout />
    </RequireAuth>
  ),
});
