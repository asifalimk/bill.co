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

export interface Vendor {
  id: number;
  name: string;
  company_name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
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

export interface CompanyProfile {
  store_name: string;
  short_name: string;
  tagline: string;
  phone: string;
  address: string;
  gstin: string;
  email: string;
  website: string;
  footer_note: string;
  terms: string;
}

export interface Receipt {
  invoiceNo: string;
  date: Date;
  cashier: string;
  paymentType: PaymentType;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  customerId?: number;
  site_note?: string;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  total_cost?: number;
  gross_amount?: number;
  total_discounts?: number;
  net_amount?: number;
  net_profit?: number;
  isEdited: boolean;
  editedAt?: Date;
  editedBy?: string;
}
