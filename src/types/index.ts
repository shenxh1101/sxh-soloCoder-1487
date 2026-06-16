export type ProductType = 'business_card' | 'flyer' | 'sticker';

export type PaperType = 'coated' | 'matte' | 'uncoated' | 'special';

export type LaminationType = 'none' | 'gloss' | 'matte' | 'soft_touch';

export type OrderStatus = 'draft' | 'quoted' | 'confirmed' | 'in_production' | 'completed' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  remark?: string;
  createdAt: string;
}

export interface PaperSpec {
  id: string;
  name: string;
  width: number;
  height: number;
  unitPrice: number;
}

export interface ProductSpec {
  type: ProductType;
  name: string;
  width: number;
  height: number;
}

export interface OrderItem {
  id: string;
  productType: ProductType;
  productName: string;
  paperType: PaperType;
  paperWeight: number;
  finishedWidth: number;
  finishedHeight: number;
  quantity: number;
  lamination: LaminationType;
  parentPaperId: string;
  parentPaperName: string;
  parentWidth: number;
  parentHeight: number;
  layoutHorizontal: number;
  layoutVertical: number;
  perSheetCount: number;
  sheetsNeeded: number;
  rotated: boolean;
  paperCost: number;
  printingCost: number;
  laminationCost: number;
  otherCost: number;
  totalCost: number;
  profitRate: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  status: OrderStatus;
  remark?: string;
  totalAmount: number;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface ProductionItem {
  orderItemId: string;
  productName: string;
  paperSpec: string;
  finishedSize: string;
  parentSize: string;
  layout: string;
  quantity: number;
  sheetsNeeded: number;
  lamination: string;
  cuttingInstruction: string;
  remark?: string;
}

export interface ProductionOrder {
  id: string;
  orderId: string;
  orderNo: string;
  customerName: string;
  items: ProductionItem[];
  status: 'pending' | 'producing' | 'done';
  createdAt: string;
  assignedTo?: string;
}

export interface LayoutResult {
  horizontal: number;
  vertical: number;
  perSheet: number;
  rotated: boolean;
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  business_card: '名片',
  flyer: '宣传单',
  sticker: '不干胶'
};

export const PAPER_TYPE_LABELS: Record<PaperType, string> = {
  coated: '铜版纸',
  matte: '哑粉纸',
  uncoated: '双胶纸',
  special: '特种纸'
};

export const LAMINATION_LABELS: Record<LaminationType, string> = {
  none: '不覆膜',
  gloss: '亮膜',
  matte: '哑膜',
  soft_touch: '触感膜'
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: '草稿',
  quoted: '已报价',
  confirmed: '已确认',
  in_production: '生产中',
  completed: '已完成',
  cancelled: '已取消'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  quoted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-amber-100 text-amber-700',
  in_production: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};
