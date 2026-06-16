import type { PaperSpec } from '@/types';

export const DEFAULT_PAPER_SPECS: PaperSpec[] = [
  {
    id: 'paper-a3',
    name: 'A3',
    width: 420,
    height: 297,
    unitPrice: 0.8
  },
  {
    id: 'paper-a4',
    name: 'A4',
    width: 297,
    height: 210,
    unitPrice: 0.4
  },
  {
    id: 'paper-a2',
    name: 'A2',
    width: 594,
    height: 420,
    unitPrice: 1.6
  },
  {
    id: 'paper-dadu',
    name: '大度纸',
    width: 889,
    height: 1194,
    unitPrice: 3.5
  },
  {
    id: 'paper-zhengdu',
    name: '正度纸',
    width: 787,
    height: 1092,
    unitPrice: 3.0
  },
  {
    id: 'paper-siji-kai',
    name: '四开纸',
    width: 594,
    height: 440,
    unitPrice: 2.0
  },
  {
    id: 'paper-ba-kai',
    name: '八开纸',
    width: 420,
    height: 297,
    unitPrice: 1.0
  },
  {
    id: 'paper-shiliu-kai',
    name: '十六开纸',
    width: 297,
    height: 210,
    unitPrice: 0.5
  }
];

export const PAPER_WEIGHT_OPTIONS = [
  { value: 128, label: '128g' },
  { value: 157, label: '157g' },
  { value: 200, label: '200g' },
  { value: 250, label: '250g' },
  { value: 300, label: '300g' },
  { value: 350, label: '350g' },
  { value: 400, label: '400g' }
];
