import type { LayoutResult } from '@/types';

export function calculateLayout(
  finishedW: number,
  finishedH: number,
  parentW: number,
  parentH: number,
  bleed: number = 3
): LayoutResult {
  if (finishedW <= 0 || finishedH <= 0 || parentW <= 0 || parentH <= 0) {
    return { horizontal: 0, vertical: 0, perSheet: 0, rotated: false };
  }

  const fw = finishedW + bleed * 2;
  const fh = finishedH + bleed * 2;

  const h1 = Math.floor(parentW / fw);
  const v1 = Math.floor(parentH / fh);
  const count1 = h1 * v1;

  const h2 = Math.floor(parentW / fh);
  const v2 = Math.floor(parentH / fw);
  const count2 = h2 * v2;

  if (count2 > count1) {
    return { horizontal: Math.max(0, h2), vertical: Math.max(0, v2), perSheet: Math.max(0, count2), rotated: true };
  }
  return { horizontal: Math.max(0, h1), vertical: Math.max(0, v1), perSheet: Math.max(0, count1), rotated: false };
}

export function calculateSheetsNeeded(quantity: number, perSheet: number): number {
  if (perSheet <= 0) return 0;
  return Math.ceil(quantity / perSheet);
}

export function generateCuttingInstruction(
  horizontal: number,
  vertical: number,
  finishedW: number,
  finishedH: number,
  rotated: boolean
): string {
  const actualW = rotated ? finishedH : finishedW;
  const actualH = rotated ? finishedW : finishedH;
  return `横向切${horizontal - 1}刀（每刀${actualW}mm），纵向切${vertical - 1}刀（每刀${actualH}mm），共${horizontal}×${vertical} = ${horizontal * vertical}张`;
}
