import { createFileRoute } from "@tanstack/react-router";
import { Index } from "./index";

export const Route = createFileRoute("/rw")({
  head: () => ({
    meta: [
      { title: "Vive AI - Kwigira hamwe na AI" },
      {
        name: "description",
        content: "Urubuga rwo kwiga rufasha abanyeshuri hifashishijwe AI.",
      },
    ],
  }),
  component: () => <Index routeLanguageCode="rw" />,
});
