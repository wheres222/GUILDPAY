import { PlanTier } from "@prisma/client";

export type PlanConfig = {
  tier: PlanTier;
  label: string;
  feeRate: number;
  monthlyPriceUsd: number;
};

export const PLAN_CONFIG: Record<PlanTier, PlanConfig> = {
  FREE: {
    tier: "FREE",
    label: "Free",
    feeRate: 0.03,
    monthlyPriceUsd: 0
  },
  PRO: {
    tier: "PRO",
    label: "Pro",
    feeRate: 0.015,
    monthlyPriceUsd: 19
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    label: "Enterprise",
    feeRate: 0,
    monthlyPriceUsd: 99
  }
};

export function feeRateForTier(tier: PlanTier): number {
  return PLAN_CONFIG[tier].feeRate;
}

export function monthlyPriceForTier(tier: PlanTier): number {
  return PLAN_CONFIG[tier].monthlyPriceUsd;
}
