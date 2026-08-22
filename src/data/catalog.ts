import categoriesJson from "./categories.json";
import demoJson from "./demo-decision.json";
import productsJson from "./products.json";
import type { Category, DecisionInput, Product } from "@/engine/types.ts";

export const products = productsJson as Product[];
export const categories = categoriesJson as Category[];
export const demoDecision = demoJson as DecisionInput;

export const GOAL_PRESETS = [
  { id: "programming", label: "Programming" },
  { id: "study", label: "Study" },
  { id: "university", label: "University" },
  { id: "gaming", label: "Gaming" },
  { id: "content", label: "Content creation" },
  { id: "travel", label: "Travel" },
  { id: "work", label: "Work" },
] as const;

export const PRIORITY_META = [
  {
    key: "performance" as const,
    label: "Performance",
    hint: "Speed, capability, and how far the kit can be pushed",
  },
  {
    key: "value" as const,
    label: "Price / Value",
    hint: "Useful outcome per dollar spent",
  },
  {
    key: "longevity" as const,
    label: "Longevity",
    hint: "Years of useful life and how repairable it is",
  },
  {
    key: "portability" as const,
    label: "Portability",
    hint: "Weight, size, battery, and travel",
  },
  {
    key: "quality" as const,
    label: "Quality",
    hint: "Build, comfort, and finish",
  },
];

export const defaultInput = (): DecisionInput => ({
  budget: 1000,
  goals: [],
  mustHaves: [],
  wants: [],
  alreadyOwn: [],
  priorities: {
    performance: 25,
    value: 25,
    longevity: 20,
    portability: 15,
    quality: 15,
  },
});
