import { create } from "zustand";
import { defaultInput, demoDecision } from "@/data/catalog";
import type {
  DecisionInput,
  RecommendResult,
  StrategyId,
  WhatIfResult,
} from "@/engine/types.ts";

const INPUT_KEY = "rethink.input.v1";
const RESULT_KEY = "rethink.result.v1";

function loadInput(): DecisionInput {
  if (typeof window === "undefined") return defaultInput();
  try {
    const raw = localStorage.getItem(INPUT_KEY);
    if (!raw) return defaultInput();
    return { ...defaultInput(), ...JSON.parse(raw) };
  } catch {
    return defaultInput();
  }
}

function loadResult(): RecommendResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as RecommendResult) : null;
  } catch {
    return null;
  }
}

type WhatIfState = WhatIfResult & { narrative?: string | null; question: string };

type DecisionState = {
  input: DecisionInput;
  result: RecommendResult | null;
  selectedId: StrategyId;
  whatIf: WhatIfState | null;
  hydrate: () => void;
  patchInput: (partial: Partial<DecisionInput>) => void;
  replaceInput: (input: DecisionInput) => void;
  setResult: (result: RecommendResult | null) => void;
  setSelectedId: (id: StrategyId) => void;
  setWhatIf: (value: WhatIfState | null) => void;
  loadDemo: () => void;
  reset: () => void;
};

export const useDecisionStore = create<DecisionState>((set, get) => ({
  input: defaultInput(),
  result: null,
  selectedId: "best_overall",
  whatIf: null,
  hydrate: () => {
    set({ input: loadInput(), result: loadResult() });
  },
  patchInput: (partial) => {
    const input = { ...get().input, ...partial };
    set({ input });
    if (typeof window !== "undefined") {
      localStorage.setItem(INPUT_KEY, JSON.stringify(input));
    }
  },
  replaceInput: (input) => {
    set({ input });
    if (typeof window !== "undefined") {
      localStorage.setItem(INPUT_KEY, JSON.stringify(input));
    }
  },
  setResult: (result) => {
    const selectedId =
      result && result.ok ? result.recommendedId : get().selectedId;
    set({ result, selectedId });
    if (typeof window !== "undefined") {
      if (result) sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
      else sessionStorage.removeItem(RESULT_KEY);
    }
  },
  setSelectedId: (selectedId) => set({ selectedId }),
  setWhatIf: (whatIf) => set({ whatIf }),
  loadDemo: () => {
    get().replaceInput({ ...defaultInput(), ...demoDecision });
  },
  reset: () => {
    const input = defaultInput();
    set({ input, result: null, whatIf: null, selectedId: "best_overall" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(INPUT_KEY);
      sessionStorage.removeItem(RESULT_KEY);
    }
  },
}));
