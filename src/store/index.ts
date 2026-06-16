import { create } from 'zustand';
import type { Customer, Order, ProductionOrder, PaperSpec, OrderStatus } from '@/types';
import { customerStorage, orderStorage, productionStorage, paperSpecStorage } from '@/utils/storage';

interface AppState {
  customers: Customer[];
  orders: Order[];
  productionOrders: ProductionOrder[];
  paperSpecs: PaperSpec[];
  isLoading: boolean;

  loadData: () => void;

  addCustomer: (data: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => Customer | null;
  searchCustomers: (keyword: string) => Customer[];

  addOrder: (data: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrder: (id: string, data: Partial<Order>) => Order | null;
  updateOrderStatus: (id: string, status: OrderStatus) => Order | null;

  addProductionOrder: (data: Omit<ProductionOrder, 'id' | 'createdAt'>) => ProductionOrder;
  updateProductionOrder: (id: string, data: Partial<ProductionOrder>) => ProductionOrder | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  customers: [],
  orders: [],
  productionOrders: [],
  paperSpecs: [],
  isLoading: true,

  loadData: () => {
    set({
      customers: customerStorage.getAll(),
      orders: orderStorage.getAll(),
      productionOrders: productionStorage.getAll(),
      paperSpecs: paperSpecStorage.getAll(),
      isLoading: false
    });
  },

  addCustomer: (data) => {
    const newCustomer = customerStorage.add(data);
    set((state) => ({ customers: [...state.customers, newCustomer] }));
    return newCustomer;
  },

  updateCustomer: (id, data) => {
    const updated = customerStorage.update(id, data);
    if (updated) {
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updated : c))
      }));
    }
    return updated;
  },

  searchCustomers: (keyword) => {
    return customerStorage.search(keyword);
  },

  addOrder: (data) => {
    const newOrder = orderStorage.add(data);
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },

  updateOrder: (id, data) => {
    const updated = orderStorage.update(id, data);
    if (updated) {
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o))
      }));
    }
    return updated;
  },

  updateOrderStatus: (id, status) => {
    const updates: Partial<Order> = { status };
    if (status === 'confirmed') {
      updates.confirmedAt = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    return get().updateOrder(id, updates);
  },

  addProductionOrder: (data) => {
    const newPO = productionStorage.add(data);
    set((state) => ({ productionOrders: [newPO, ...state.productionOrders] }));
    return newPO;
  },

  updateProductionOrder: (id, data) => {
    const updated = productionStorage.update(id, data);
    if (updated) {
      set((state) => ({
        productionOrders: state.productionOrders.map((p) => (p.id === id ? updated : p))
      }));
    }
    return updated;
  }
}));
