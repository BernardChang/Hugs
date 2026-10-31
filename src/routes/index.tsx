import { createFileRoute } from "@tanstack/react-router";
import { LogicTool } from "@/components/LogicTool";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantifier — Expand & Classify FOL Formulas" },
      {
        name: "description",
        content:
          "A math-notebook tool that expands first-order logic formulas over a two-element domain and classifies them as Valid, Contingent, or Unsatisfiable.",
      },
      { property: "og:title", content: "Quantifier — Expand & Classify FOL" },
      {
        property: "og:description",
        content:
          "Expand ∀ and ∃ over {a, b}, see the propositional form, and check the verdict — with a built-in practice mode.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <LogicTool />;
}
