export type ItemCategory = 'Plumbing' | 'Electrical' | 'Fasteners' | 'Tools';
export type ItemUnit = 'Pcs' | 'Mtr' | 'Kg' | 'Box';
export type PaymentType = 'CASH' | 'CREDIT';
export type RefundMode = 'Cash Refund' | 'Credit Balance';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  gstin?: string;
  credit_balance: number;
  created_at: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  category: ItemCategory;
  unit: ItemUnit;
  purchase_price: number;
  selling_price: number;
  stock_qty: number;
  min_stock_level: number;
}

export interface CartLine {
  item: Item;
  quantity: number;
  discount: number;
}

export interface Receipt {
  invoiceNo: string;
  date: Date;
  cashier: string;
  paymentType: PaymentType;
  customerName: string;
  customerPhone: string;
  customerId?: number;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  isEdited: boolean;
  editedAt?: Date;
  editedBy?: string;
}
