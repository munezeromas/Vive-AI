import { createFileRoute } from "@tanstack/react-router";
import { Index } from "./index";

export const Route = createFileRoute("/en")({
  head: () => ({
    meta: [
      { title: "Vive AI - Learn Smarter with your AI study mentor" },
      {
        name: "description",
        content: "AI-powered, inclusive learning platform for African students.",
      },
    ],
  }),
  component: () => <Index routeLanguageCode="en" />,
});
