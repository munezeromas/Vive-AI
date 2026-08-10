import { createFileRoute } from "@tanstack/react-router";
import { Index } from "./index";

export const Route = createFileRoute("/sw")({
  head: () => ({
    meta: [
      { title: "Vive AI - Jifunze kwa urahisi" },
      {
        name: "description",
        content: "Jukwaa la kujifunza linalotumia AI kwa wanafunzi.",
      },
    ],
  }),
  component: () => <Index routeLanguageCode="sw" />,
});
