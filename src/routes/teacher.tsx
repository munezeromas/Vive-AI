import { createFileRoute } from "@tanstack/react-router";
import { TeacherLayout } from "@/components/vive/TeacherLayout";
import { RequireAuth } from "@/components/vive/RequireAuth";

export const Route = createFileRoute("/teacher")({
  component: () => (
    <RequireAuth roles={["teacher", "admin"]}>
      <TeacherLayout />
    </RequireAuth>
  ),
});
