import type { LaminationType } from '@/types';

const LAMINATION_UNIT_COST: Record<LaminationType, number> = {
  none: 0,
  gloss: 0.15,
  matte: 0.18,
  soft_touch: 0.35
};

export function calculateLaminationCost(
  sheetsNeeded: number,
  parentWidth: number,
  parentHeight: number,
  lamination: LaminationType
): number {
  const area = (parentWidth * parentHeight) / 1_000_000;
  const unitCost = LAMINATION_UNIT_COST[lamination];
  return +(sheetsNeeded * area * unitCost * 10).toFixed(2);
}

export function calculatePricing(
  totalCost: number,
  quantity: number,
  profitRate: number
): { unitPrice: number; total: number } {
  const multiplier = 1 + profitRate / 100;
  const total = +(totalCost * multiplier).toFixed(2);
  const unitPrice = quantity > 0 ? +(total / quantity).toFixed(4) : 0;
  return { unitPrice, total };
}

export function calculatePaperCost(
  sheetsNeeded: number,
  paperUnitPrice: number,
  paperWeight: number,
  baseWeight: number = 157
): number {
  const weightRatio = paperWeight / baseWeight;
  return +(sheetsNeeded * paperUnitPrice * weightRatio).toFixed(2);
}

export function calculatePrintingCost(
  sheetsNeeded: number,
  isColor: boolean = true
): number {
  const perSheet = isColor ? 0.3 : 0.1;
  return +(Math.max(sheetsNeeded, 50) * perSheet).toFixed(2);
}
