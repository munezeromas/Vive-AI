import { createFileRoute } from "@tanstack/react-router";
import { Index } from "./index";

export const Route = createFileRoute("/fr")({
  head: () => ({
    meta: [
      { title: "Vive AI - Apprendre plus intelligemment" },
      {
        name: "description",
        content: "Plateforme d'apprentissage inclusive propulsee par l'IA.",
      },
    ],
  }),
  component: () => <Index routeLanguageCode="fr" />,
});
