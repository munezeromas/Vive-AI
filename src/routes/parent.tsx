import { createFileRoute } from "@tanstack/react-router";
import { ParentLayout } from "@/components/vive/ParentLayout";
import { RequireAuth } from "@/components/vive/RequireAuth";

export const Route = createFileRoute("/parent")({
  component: () => (
    <RequireAuth roles={["parent"]}>
      <ParentLayout />
    </RequireAuth>
  ),
});
