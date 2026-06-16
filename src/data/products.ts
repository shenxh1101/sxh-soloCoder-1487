import type { ProductSpec, ProductType } from '@/types';

export const DEFAULT_PRODUCT_SPECS: ProductSpec[] = [
  {
    type: 'business_card',
    name: '标准名片',
    width: 90,
    height: 54
  },
  {
    type: 'business_card',
    name: '折叠名片',
    width: 90,
    height: 108
  },
  {
    type: 'flyer',
    name: 'A4宣传单',
    width: 210,
    height: 297
  },
  {
    type: 'flyer',
    name: 'A5宣传单',
    width: 148,
    height: 210
  },
  {
    type: 'flyer',
    name: 'A3宣传单',
    width: 297,
    height: 420
  },
  {
    type: 'flyer',
    name: '三折页',
    width: 210,
    height: 285
  },
  {
    type: 'sticker',
    name: '方形不干胶',
    width: 100,
    height: 100
  },
  {
    type: 'sticker',
    name: '圆形不干胶',
    width: 80,
    height: 80
  },
  {
    type: 'sticker',
    name: '长方形不干胶',
    width: 120,
    height: 60
  }
];

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string; desc: string }[] = [
  { value: 'business_card', label: '名片', desc: '90×54mm 标准规格' },
  { value: 'flyer', label: '宣传单', desc: 'A4/A5/A3 多种规格' },
  { value: 'sticker', label: '不干胶', desc: '方形/圆形/异形贴纸' }
];
