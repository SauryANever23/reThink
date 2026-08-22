import { z } from "zod";

export const prioritiesSchema = z.object({
  performance: z.number().min(0).max(100),
  value: z.number().min(0).max(100),
  longevity: z.number().min(0).max(100),
  portability: z.number().min(0).max(100),
  quality: z.number().min(0).max(100),
});

export const decisionInputSchema = z.object({
  budget: z.number().min(0).max(1_000_000),
  goals: z.array(z.string().min(1).max(40)).max(12),
  mustHaves: z.array(z.string().max(40)).max(12),
  wants: z.array(z.string().max(40)).max(12),
  alreadyOwn: z.array(z.string().max(40)).max(12),
  priorities: prioritiesSchema,
  forceIncludeIds: z.array(z.string().max(80)).max(12).optional(),
  forceExcludeIds: z.array(z.string().max(80)).max(20).optional(),
  minRemaining: z.number().min(0).max(1_000_000).optional(),
});

export const whatIfPatchSchema = z.object({
  budgetDelta: z.number().nullable().optional(),
  budgetSet: z.number().min(0).nullable().optional(),
  minRemaining: z.number().min(0).nullable().optional(),
  priorities: prioritiesSchema.nullable().optional(),
  removeCategories: z.array(z.string()).nullable().optional(),
  addMustHaves: z.array(z.string()).nullable().optional(),
  addWants: z.array(z.string()).nullable().optional(),
  addAlreadyOwn: z.array(z.string()).nullable().optional(),
  forceIncludeIds: z.array(z.string()).nullable().optional(),
  forceExcludeIds: z.array(z.string()).nullable().optional(),
  summary: z.string().max(240),
});
