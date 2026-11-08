import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { CartLine, Item, PaymentType, Receipt } from '../models';

interface ApiInvoiceItem {
  id: number;
  item_id: number;
  code: string;
  name: string;
  category: Item['category'];
  unit: Item['unit'];
  quantity: number;
  purchase_price?: number | string;
  selling_price: number | string;
  line_discount: number | string;
  line_total: number | string;
}

interface ApiInvoice {
  id: number;
  invoice_no: string;
  customer_id: number | null;
  customer_name: string;
  customer_phone: string;
  customer_gstin: string | null;
  cashier_name: string;
  payment_type: PaymentType;
  site_note: string | null;
  gross_amount: number | string;
  bill_discount: number | string;
  total_discounts: number | string;
  total_cost?: number | string;
  net_amount: number | string;
  net_profit?: number | string;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  items: ApiInvoiceItem[];
}

export interface CheckoutRequest {
  invoice_no: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_gstin?: string;
  site_note?: string;
  bill_discount: number;
  payment_type: PaymentType;
  items: Array<{ item_id: number; quantity: number; line_discount: number }>;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  readonly lines = signal<CartLine[]>([]);
  readonly completedInvoices = signal<Receipt[]>([]);
  readonly billDiscount = signal(0);
  readonly paymentType = signal<PaymentType>('CASH');
  readonly grossAmount = computed(() => this.lines().reduce(
    (total, line) => total + line.item.selling_price * line.quantity, 0,
  ));
  readonly totalLineDiscounts = computed(() => this.lines().reduce((total, line) => total + line.discount, 0));
  readonly totalCost = computed(() => this.lines().reduce(
    (total, line) => total + line.item.purchase_price * line.quantity, 0,
  ));
  readonly subtotal = computed(() => this.lines().reduce(
    (total, line) => total + Math.max(0, line.quantity * line.item.selling_price - line.discount), 0,
  ));
  readonly totalDiscounts = computed(() => this.totalLineDiscounts() + this.billDiscount());
  readonly netAmount = computed(() => Math.max(0, this.grossAmount() - this.totalDiscounts()));
  readonly netProfit = computed(() => this.netAmount() - this.totalCost());
  readonly itemCount = computed(() => this.lines().reduce((total, line) => total + line.quantity, 0));
  readonly total = computed(() => this.netAmount());
  private invoiceLoadGeneration = 0;

  constructor(@Optional() private readonly http?: HttpClient) {}

  lineNetProfit(line: CartLine): number {
    return line.item.selling_price * line.quantity - line.discount - line.item.purchase_price * line.quantity;
  }

  invoiceNetProfit(invoice: Receipt): number {
    return invoice.lines.reduce((total, line) => total + this.lineNetProfit(line), 0) - (invoice.discount ?? 0);
  }

  invoiceMetrics(invoice: Receipt): {
    total_cost: number; gross_amount: number; total_discounts: number; net_amount: number; net_profit: number;
  } {
    const grossAmount = invoice.lines.reduce((total, line) => total + line.item.selling_price * line.quantity, 0);
    const totalCost = invoice.lines.reduce((total, line) => total + line.item.purchase_price * line.quantity, 0);
    const totalDiscounts = invoice.lines.reduce((total, line) => total + line.discount, 0) + (invoice.discount ?? 0);
    const netAmount = Math.max(0, grossAmount - totalDiscounts);
    return {
      total_cost: totalCost,
      gross_amount: grossAmount,
      total_discounts: totalDiscounts,
      net_amount: netAmount,
      net_profit: netAmount - totalCost,
    };
  }

  async loadInvoices(filters: { startDate?: string; endDate?: string; paymentType?: PaymentType } = {}): Promise<void> {
    const http = this.requireHttp();
    const query = new URLSearchParams();
    if (filters.startDate) query.set('startDate', filters.startDate);
    if (filters.endDate) query.set('endDate', filters.endDate);
    if (filters.paymentType) query.set('paymentType', filters.paymentType);
    const queryString = query.toString();
    const suffix = queryString ? `?${queryString}` : '';
    const generation = ++this.invoiceLoadGeneration;
    const invoices = await firstValueFrom(http.get<ApiInvoice[]>(`${API_BASE_URL}/invoices${suffix}`));
    if (generation === this.invoiceLoadGeneration) {
      this.completedInvoices.set(invoices.map(invoice => this.fromApiInvoice(invoice)));
    }
  }

  async checkout(request: CheckoutRequest): Promise<Receipt> {
    const invoice = await firstValueFrom(
      this.requireHttp().post<ApiInvoice>(`${API_BASE_URL}/invoices/checkout`, request),
    );
    const receipt = this.fromApiInvoice(invoice);
    this.completedInvoices.update(invoices => [receipt, ...invoices.filter(row => row.id !== receipt.id)]);
    return receipt;
  }

  async updateInvoice(invoiceId: number, request: CheckoutRequest): Promise<Receipt> {
    const invoice = await firstValueFrom(
      this.requireHttp().put<ApiInvoice>(`${API_BASE_URL}/invoices/${invoiceId}`, request),
    );
    const receipt = this.fromApiInvoice(invoice);
    this.completedInvoices.update(invoices => invoices.map(row => row.id === receipt.id ? receipt : row));
    return receipt;
  }

  add(item: Item, quantity: number, discount: number): void {
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be greater than zero.');
    if (!Number.isFinite(discount) || discount < 0) throw new Error('Line discount cannot be negative.');
    const lineDiscount = Math.min(discount, quantity * item.selling_price);
    this.lines.update(lines => {
      const existing = lines.find(line => line.item.id === item.id);
      if (existing) {
        return lines.map(line => line.item.id === item.id
          ? { ...line, quantity: line.quantity + quantity, discount: line.discount + lineDiscount }
          : line);
      }
      return [...lines, { item, quantity, discount: lineDiscount }];
    });
  }

  remove(itemId: number): void {
    this.lines.update(lines => lines.filter(line => line.item.id !== itemId));
  }

  updateLine(itemId: number, field: 'quantity' | 'discount', value: number): void {
    if (!Number.isFinite(value) || (field === 'quantity' && value <= 0) || (field === 'discount' && value < 0)) {
      throw new Error(field === 'quantity' ? 'Quantity must be greater than zero.' : 'Line discount cannot be negative.');
    }
    if (!this.lines().some(line => line.item.id === itemId)) {
      throw new Error(`Cannot update cart: item ${itemId} was not found.`);
    }
    this.lines.update(lines => lines.map(line => {
      if (line.item.id !== itemId) return line;
      const quantity = field === 'quantity' ? value : line.quantity;
      const discount = field === 'discount' ? value : line.discount;
      return { ...line, quantity, discount: Math.min(discount, quantity * line.item.selling_price) };
    }));
  }

  clear(): void {
    this.lines.set([]);
    this.billDiscount.set(0);
    this.paymentType.set('CASH');
  }

  private fromApiInvoice(invoice: ApiInvoice): Receipt {
    const lines = invoice.items.map(item => ({
      item: {
        id: item.item_id,
        code: item.code,
        name: item.name,
        category: item.category,
        unit: item.unit,
        purchase_price: Number(item.purchase_price ?? 0),
        selling_price: Number(item.selling_price),
        stock_qty: 0,
        min_stock_level: 0,
      },
      quantity: item.quantity,
      discount: Number(item.line_discount),
    }));
    const billDiscount = Number(invoice.bill_discount);
    const total = Number(invoice.net_amount);
    return {
      id: invoice.id,
      invoiceNo: invoice.invoice_no,
      date: new Date(invoice.created_at),
      cashier: invoice.cashier_name,
      paymentType: invoice.payment_type,
      customerName: invoice.customer_name,
      customerPhone: invoice.customer_phone,
      customerGstin: invoice.customer_gstin ?? undefined,
      customerId: invoice.customer_id ?? undefined,
      site_note: invoice.site_note ?? undefined,
      lines,
      subtotal: total + billDiscount,
      discount: billDiscount,
      total,
      total_cost: invoice.total_cost === undefined ? undefined : Number(invoice.total_cost),
      gross_amount: Number(invoice.gross_amount),
      total_discounts: Number(invoice.total_discounts),
      net_amount: total,
      net_profit: invoice.net_profit === undefined ? undefined : Number(invoice.net_profit),
      isEdited: invoice.is_edited,
      editedAt: invoice.edited_at ? new Date(invoice.edited_at) : undefined,
    };
  }

  private requireHttp(): HttpClient {
    if (!this.http) throw new Error('HTTP client is unavailable.');
    return this.http;
  }
}
