import type { Customer, Order, ProductionOrder, PaperSpec } from '@/types';
import { DEFAULT_PAPER_SPECS } from '@/data/papers';
import { generateId } from './format';

const STORAGE_KEYS = {
  CUSTOMERS: 'printshop_customers',
  ORDERS: 'printshop_orders',
  PRODUCTION_ORDERS: 'printshop_production_orders',
  PAPER_SPECS: 'printshop_paper_specs'
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (e) {
    console.error('Failed to read from storage:', e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export const customerStorage = {
  getAll(): Customer[] {
    const customers = getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    if (customers.length === 0) {
      const defaultCustomers: Customer[] = [
        { id: generateId(), name: '张三', phone: '13800138001', remark: '老客户，月结', createdAt: new Date('2025-01-15').toISOString() },
        { id: generateId(), name: '李总', phone: '13900139002', email: 'li@example.com', createdAt: new Date('2025-03-20').toISOString() },
        { id: generateId(), name: '王经理', phone: '13700137003', address: '科技园A栋501', createdAt: new Date('2025-05-10').toISOString() },
        { id: generateId(), name: '陈小姐', phone: '13600136004', remark: '设计公司，经常印名片', createdAt: new Date('2025-07-22').toISOString() },
        { id: generateId(), name: '刘老板', phone: '13500135005', createdAt: new Date('2025-09-08').toISOString() }
      ];
      saveToStorage(STORAGE_KEYS.CUSTOMERS, defaultCustomers);
      return defaultCustomers;
    }
    return customers;
  },
  save(customers: Customer[]): void {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  },
  add(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const customers = this.getAll();
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    this.save(customers);
    return newCustomer;
  },
  update(id: string, data: Partial<Customer>): Customer | null {
    const customers = this.getAll();
    const index = customers.findIndex(c => c.id === id);
    if (index >= 0) {
      customers[index] = { ...customers[index], ...data };
      this.save(customers);
      return customers[index];
    }
    return null;
  },
  delete(id: string): boolean {
    const customers = this.getAll();
    const filtered = customers.filter(c => c.id !== id);
    if (filtered.length !== customers.length) {
      this.save(filtered);
      return true;
    }
    return false;
  },
  findById(id: string): Customer | undefined {
    return this.getAll().find(c => c.id === id);
  },
  search(keyword: string): Customer[] {
    const k = keyword.toLowerCase();
    return this.getAll().filter(c =>
      c.name.toLowerCase().includes(k) ||
      c.phone.includes(k) ||
      (c.email && c.email.toLowerCase().includes(k))
    );
  }
};

export const orderStorage = {
  getAll(): Order[] {
    const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
    const patched = orders.map(order => {
      const items = order.items.map(item => ({
        ...item,
        useManualPrice: item.useManualPrice ?? false,
        finalUnitPrice: item.finalUnitPrice ?? item.unitPrice,
        finalSubtotal: item.finalSubtotal ?? item.subtotal
      }));
      const totalCost = items.reduce((s, i) => s + i.totalCost, 0);
      const quoteAmount = items.reduce((s, i) => s + i.subtotal, 0);
      const totalAmount = items.reduce((s, i) => s + (i.finalSubtotal || i.subtotal), 0);
      return {
        ...order,
        items,
        totalCost: order.totalCost ?? totalCost,
        quoteAmount: order.quoteAmount ?? quoteAmount,
        totalAmount: order.totalAmount || totalAmount
      };
    });
    if (patched.length === 0) {
      const defaultOrders = generateSampleOrders();
      saveToStorage(STORAGE_KEYS.ORDERS, defaultOrders);
      return defaultOrders;
    }
    return patched;
  },
  save(orders: Order[]): void {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
  },
  add(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const orders = this.getAll();
    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    this.save(orders);
    return newOrder;
  },
  update(id: string, data: Partial<Order>): Order | null {
    const orders = this.getAll();
    const index = orders.findIndex(o => o.id === id);
    if (index >= 0) {
      orders[index] = { ...orders[index], ...data };
      this.save(orders);
      return orders[index];
    }
    return null;
  },
  findById(id: string): Order | undefined {
    return this.getAll().find(o => o.id === id);
  },
  findByCustomer(customerId: string): Order[] {
    return this.getAll().filter(o => o.customerId === customerId);
  }
};

export const productionStorage = {
  getAll(): ProductionOrder[] {
    return getFromStorage<ProductionOrder[]>(STORAGE_KEYS.PRODUCTION_ORDERS, []);
  },
  save(productionOrders: ProductionOrder[]): void {
    saveToStorage(STORAGE_KEYS.PRODUCTION_ORDERS, productionOrders);
  },
  add(po: Omit<ProductionOrder, 'id' | 'createdAt'>): ProductionOrder {
    const pos = this.getAll();
    const newPO: ProductionOrder = {
      ...po,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    pos.unshift(newPO);
    this.save(pos);
    return newPO;
  },
  update(id: string, data: Partial<ProductionOrder>): ProductionOrder | null {
    const pos = this.getAll();
    const index = pos.findIndex(p => p.id === id);
    if (index >= 0) {
      pos[index] = { ...pos[index], ...data };
      this.save(pos);
      return pos[index];
    }
    return null;
  },
  findById(id: string): ProductionOrder | undefined {
    return this.getAll().find(p => p.id === id);
  },
  findByOrderId(orderId: string): ProductionOrder | undefined {
    return this.getAll().find(p => p.orderId === orderId);
  }
};

export const paperSpecStorage = {
  getAll(): PaperSpec[] {
    const specs = getFromStorage<PaperSpec[]>(STORAGE_KEYS.PAPER_SPECS, []);
    if (specs.length === 0) {
      saveToStorage(STORAGE_KEYS.PAPER_SPECS, DEFAULT_PAPER_SPECS);
      return DEFAULT_PAPER_SPECS;
    }
    return specs;
  },
  save(specs: PaperSpec[]): void {
    saveToStorage(STORAGE_KEYS.PAPER_SPECS, specs);
  }
};

function generateSampleOrders(): Order[] {
  const customers = customerStorage.getAll();
  const orders: Order[] = [];
  const now = new Date();

  const orderData = [
    { daysAgo: 5, customerIdx: 0, status: 'completed' as const, product: 'business_card', qty: 500, profit: 50 },
    { daysAgo: 12, customerIdx: 1, status: 'completed' as const, product: 'flyer', qty: 1000, profit: 40 },
    { daysAgo: 20, customerIdx: 0, status: 'completed' as const, product: 'sticker', qty: 2000, profit: 45 },
    { daysAgo: 35, customerIdx: 3, status: 'completed' as const, product: 'business_card', qty: 1000, profit: 55 },
    { daysAgo: 50, customerIdx: 2, status: 'completed' as const, product: 'flyer', qty: 3000, profit: 35 },
    { daysAgo: 68, customerIdx: 0, status: 'completed' as const, product: 'business_card', qty: 500, profit: 50 },
    { daysAgo: 85, customerIdx: 4, status: 'completed' as const, product: 'flyer', qty: 500, profit: 45 },
    { daysAgo: 100, customerIdx: 3, status: 'completed' as const, product: 'business_card', qty: 2000, profit: 60 },
    { daysAgo: 120, customerIdx: 1, status: 'completed' as const, product: 'sticker', qty: 5000, profit: 40 },
    { daysAgo: 2, customerIdx: 2, status: 'confirmed' as const, product: 'flyer', qty: 2000, profit: 38 },
    { daysAgo: 1, customerIdx: 4, status: 'quoted' as const, product: 'business_card', qty: 500, profit: 50 }
  ];

  orderData.forEach((data, idx) => {
    const date = new Date(now);
    date.setDate(date.getDate() - data.daysAgo);
    const customer = customers[data.customerIdx];

    const isBusinessCard = data.product === 'business_card';
    const isFlyer = data.product === 'flyer';
    const isSticker = data.product === 'sticker';

    const fw = isBusinessCard ? 90 : isFlyer ? 210 : 100;
    const fh = isBusinessCard ? 54 : isFlyer ? 297 : 100;
    const pw = 420;
    const ph = 297;

    const bleed = 3;
    const efw = fw + bleed * 2;
    const efh = fh + bleed * 2;
    const h = Math.floor(pw / efw);
    const v = Math.floor(ph / efh);
    const h2 = Math.floor(pw / efh);
    const v2 = Math.floor(ph / efw);
    const count1 = h * v;
    const count2 = h2 * v2;
    const rotated = count2 > count1;
    const perSheet = Math.max(count1, count2);
    const lh = rotated ? h2 : h;
    const lv = rotated ? v2 : v;
    const sheets = Math.ceil(data.qty / perSheet);

    const paperCost = sheets * 0.8 * (300 / 157);
    const printingCost = Math.max(sheets, 50) * 0.3;
    const laminationCost = sheets * 0.1;
    const totalCost = +(paperCost + printingCost + laminationCost).toFixed(2);
    const subtotal = +(totalCost * (1 + data.profit / 100)).toFixed(2);

    const unitPrice = +(subtotal / data.qty).toFixed(4);
    orders.push({
      id: generateId(),
      orderNo: `PO2026${String(now.getMonth() + 1).padStart(2, '0')}${String(1000 + idx).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      status: data.status,
      totalAmount: subtotal,
      quoteAmount: subtotal,
      totalCost,
      remark: idx % 3 === 0 ? '加急处理' : undefined,
      createdAt: date.toISOString(),
      confirmedAt: data.status !== 'quoted' ? date.toISOString() : undefined,
      completedAt: data.status === 'completed' ? new Date(date.getTime() + 86400000 * 2).toISOString() : undefined,
      items: [{
        id: generateId(),
        productType: data.product as 'business_card' | 'flyer' | 'sticker',
        productName: isBusinessCard ? '标准名片' : isFlyer ? 'A4宣传单' : '方形不干胶',
        paperType: idx % 2 === 0 ? 'coated' : 'matte',
        paperWeight: isBusinessCard ? 300 : 157,
        finishedWidth: fw,
        finishedHeight: fh,
        quantity: data.qty,
        lamination: idx % 4 === 0 ? 'gloss' : idx % 4 === 1 ? 'matte' : 'none',
        parentPaperId: 'paper-a3',
        parentPaperName: 'A3',
        parentWidth: pw,
        parentHeight: ph,
        layoutHorizontal: lh,
        layoutVertical: lv,
        perSheetCount: perSheet,
        sheetsNeeded: sheets,
        rotated,
        paperCost: +paperCost.toFixed(2),
        printingCost: +printingCost.toFixed(2),
        laminationCost: +laminationCost.toFixed(2),
        otherCost: 0,
        totalCost,
        profitRate: data.profit,
        unitPrice,
        subtotal,
        useManualPrice: false,
        finalUnitPrice: unitPrice,
        finalSubtotal: subtotal
      }]
    });
  });

  return orders;
}
