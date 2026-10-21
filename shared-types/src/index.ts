export type ItemCategory = 'Plumbing' | 'Electrical' | 'Fasteners' | 'Tools';
export type ItemUnit = 'Pcs' | 'Mtr' | 'Kg' | 'Box';
export type PaymentType = 'CASH' | 'CREDIT';

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

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string | null;
  gstin?: string | null;
  credit_balance: number;
  created_at: string;
}

export interface Vendor {
  id: number;
  name: string;
  company_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  gstin?: string | null;
  created_at: string;
}

export interface InvoiceItemSnapshot {
  id?: number;
  item_id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  line_discount: number;
  line_total: number;
  line_net_profit: number;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  customer_id?: number | null;
  site_note?: string | null;
  payment_type: PaymentType;
  gross_amount: number;
  total_discounts: number;
  total_cost: number;
  net_amount: number;
  net_profit: number;
  items: InvoiceItemSnapshot[];
  created_at: string;
}

export interface CompanyProfile {
  store_name: string;
  tagline: string;
  phone_primary: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  terms_and_conditions: string;
}
