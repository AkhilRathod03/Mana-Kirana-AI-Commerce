import {
  Shop,
  InventoryItem,
  Customer,
  Order,
  Expense,
  Transaction,
  KhataTransaction,
  OrderStatus,
} from '../types';
import {
  INITIAL_SHOPS,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
  INITIAL_KHATA,
} from '../data/mockData';

const STORAGE_KEYS = {
  SHOPS: 'vyaparai_shops_v1',
  INVENTORY: 'vyaparai_inventory_v1',
  CUSTOMERS: 'vyaparai_customers_v1',
  ORDERS: 'vyaparai_orders_v1',
  EXPENSES: 'vyaparai_expenses_v1',
  TRANSACTIONS: 'vyaparai_transactions_v1',
  KHATA: 'vyaparai_khata_v1',
  CURRENT_LOCATION: 'vyaparai_location_v1',
};

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.SHOPS)) {
      localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(INITIAL_SHOPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.KHATA)) {
      localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(INITIAL_KHATA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify({
        city: 'Hyderabad',
        locality: 'Tara Nagar, Lingampally',
        landmark: 'Near Rythu Bazaar, Lingampally',
      }));
    }

    // Auto-migrate from old Vijayawada data to Hyderabad Lingampally & BHEL
    try {
      const loc = localStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
      if (loc && loc.includes('Vijayawada')) {
        localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(INITIAL_SHOPS));
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        localStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify({
          city: 'Hyderabad',
          locality: 'Tara Nagar, Lingampally',
          landmark: 'Near Rythu Bazaar, Lingampally',
        }));
      }
    } catch {}
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Current Location
  public getLocation(): { city: string; locality: string; landmark: string } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
      return data ? JSON.parse(data) : { city: 'Hyderabad', locality: 'Tara Nagar, Lingampally', landmark: 'Near Rythu Bazaar, Lingampally' };
    } catch {
      return { city: 'Hyderabad', locality: 'Tara Nagar, Lingampally', landmark: 'Near Rythu Bazaar, Lingampally' };
    }
  }

  public setLocation(loc: { city: string; locality: string; landmark: string }) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify(loc));
    this.notify();
  }

  // SHOPS
  public getShops(): Shop[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHOPS);
      return data ? JSON.parse(data) : INITIAL_SHOPS;
    } catch {
      return INITIAL_SHOPS;
    }
  }

  public getShopById(id: string): Shop | undefined {
    return this.getShops().find((s) => s.id === id);
  }

  public updateShop(updated: Shop) {
    const shops = this.getShops().map((s) => (s.id === updated.id ? updated : s));
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
    this.notify();
  }

  // INVENTORY
  public getInventory(shopId?: string): InventoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      const all: InventoryItem[] = data ? JSON.parse(data) : INITIAL_INVENTORY;
      return shopId ? all.filter((item) => item.shopId === shopId) : all;
    } catch {
      return INITIAL_INVENTORY;
    }
  }

  public addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem {
    const all = this.getInventory();
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      lastUpdated: 'Just now',
    };
    all.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(all));
    this.notify();
    return newItem;
  }

  public updateInventoryItem(updated: InventoryItem) {
    const all = this.getInventory().map((item) =>
      item.id === updated.id ? { ...updated, lastUpdated: 'Just now' } : item
    );
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(all));
    this.notify();
  }

  public adjustStock(itemId: string, delta: number) {
    const all = this.getInventory().map((item) => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.quantity + delta);
        let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (newQty === 0) status = 'out_of_stock';
        else if (newQty <= item.minStockLevel) status = 'low_stock';
        return {
          ...item,
          quantity: newQty,
          status,
          lastUpdated: 'Just now',
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(all));
    this.notify();
  }

  public deleteInventoryItem(id: string) {
    const all = this.getInventory().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(all));
    this.notify();
  }

  // CUSTOMERS
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id);
  }

  public addCustomer(customer: Omit<Customer, 'id' | 'khataBalance' | 'totalOrders' | 'lastVisit'>): Customer {
    const all = this.getCustomers();
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      khataBalance: 0,
      totalOrders: 0,
      lastVisit: 'Today',
    };
    all.push(newCust);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(all));
    this.notify();
    return newCust;
  }

  public updateCustomerKhataBalance(customerId: string, newBalance: number) {
    const all = this.getCustomers().map((c) =>
      c.id === customerId ? { ...c, khataBalance: newBalance, lastVisit: 'Today' } : c
    );
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(all));
    this.notify();
  }

  // ORDERS
  public getOrders(shopId?: string): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const all: Order[] = data ? JSON.parse(data) : INITIAL_ORDERS;
      return shopId ? all.filter((o) => o.shopId === shopId) : all;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  public getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderNumber === id);
  }

  public addOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const all = this.getOrders();
    const orderNumber = `LS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: 'Just now',
    };
    all.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));

    // Deduct stock for the ordered items if present in inventory
    const inventory = this.getInventory();
    orderData.items.forEach((item) => {
      const found = inventory.find(
        (inv) =>
          inv.shopId === orderData.shopId &&
          inv.productName.toLowerCase().includes(item.productName.toLowerCase())
      );
      if (found) {
        this.adjustStock(found.id, -item.quantity);
      }
    });

    this.notify();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus) {
    const all = this.getOrders().map((order) => {
      if (order.id === orderId || order.orderNumber === orderId) {
        let estimatedTime = order.estimatedTime;
        if (status === 'shop_accepted') estimatedTime = 'Preparing in 15 mins';
        else if (status === 'preparing') estimatedTime = 'Ready in 5-10 mins';
        else if (status === 'ready') estimatedTime = order.orderType === 'delivery' ? 'Out for delivery' : 'Ready for pickup!';
        else if (status === 'completed') estimatedTime = 'Order Delivered / Picked up';
        else if (status === 'rejected') estimatedTime = 'Cancelled by store';
        return { ...order, status, estimatedTime };
      }
      return order;
    });
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
    this.notify();
  }

  // KHATA
  public getKhata(shopId?: string, customerId?: string): KhataTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KHATA);
      let all: KhataTransaction[] = data ? JSON.parse(data) : INITIAL_KHATA;
      if (shopId) all = all.filter((k) => k.shopId === shopId);
      if (customerId) all = all.filter((k) => k.customerId === customerId);
      return all;
    } catch {
      return INITIAL_KHATA;
    }
  }

  public addKhataTransaction(entry: Omit<KhataTransaction, 'id'>): KhataTransaction {
    const all = this.getKhata();
    const newEntry: KhataTransaction = {
      ...entry,
      id: `kht-${Date.now()}`,
    };
    all.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(all));

    // Update customer's total balance
    this.updateCustomerKhataBalance(entry.customerId, entry.remainingBalance);

    // Also add to transactions log
    this.addTransaction({
      shopId: entry.shopId,
      date: 'Today',
      type: entry.credit > 0 ? 'khata_settlement' : 'khata_credit',
      customerName: entry.customerName,
      amount: entry.credit > 0 ? entry.credit : entry.debit,
      itemsSummary: entry.itemDescription,
    });

    this.notify();
    return newEntry;
  }

  // EXPENSES
  public getExpenses(shopId?: string): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const all: Expense[] = data ? JSON.parse(data) : INITIAL_EXPENSES;
      return shopId ? all.filter((e) => e.shopId === shopId) : all;
    } catch {
      return INITIAL_EXPENSES;
    }
  }

  public addExpense(expense: Omit<Expense, 'id'>): Expense {
    const all = this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    all.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(all));
    this.notify();
    return newExpense;
  }

  // TRANSACTIONS
  public getTransactions(shopId?: string): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const all: Transaction[] = data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
      return shopId ? all.filter((t) => t.shopId === shopId) : all;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  }

  public addTransaction(tx: Omit<Transaction, 'id'>): Transaction {
    const all = this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    all.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(all));
    this.notify();
    return newTx;
  }

  // RESET
  public resetToDemoData() {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(INITIAL_SHOPS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(INITIAL_KHATA));
    this.notify();
  }
}

export const storage = new StorageService();

