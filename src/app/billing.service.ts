import { Injectable, computed, signal } from '@angular/core';
import { CartLine, Item, PaymentType, Receipt } from './models';

@Injectable({ providedIn: 'root' })
export class BillingService {
  readonly lines = signal<CartLine[]>([]);
  readonly completedInvoices = signal<Receipt[]>([]);
  readonly billDiscount = signal(0);
  readonly paymentType = signal<PaymentType>('CASH');
  readonly grossAmount = computed(() => this.lines().reduce(
    (total, line) => total + (line.item.selling_price * line.quantity),
    0
  ));
  readonly totalLineDiscounts = computed(() => this.lines().reduce(
    (total, line) => total + line.discount,
    0
  ));
  readonly totalCost = computed(() => this.lines().reduce(
    (total, line) => total + (line.item.purchase_price * line.quantity),
    0
  ));
  readonly subtotal = computed(() => this.lines().reduce(
    (total, line) => total + Math.max(0, line.quantity * line.item.selling_price - line.discount),
    0
  ));
  readonly totalDiscounts = computed(() => this.totalLineDiscounts() + this.billDiscount());
  readonly netAmount = computed(() => Math.max(0, this.grossAmount() - this.totalDiscounts()));
  readonly netProfit = computed(() => this.netAmount() - this.totalCost());
  readonly itemCount = computed(() => this.lines().reduce((total, line) => total + line.quantity, 0));
  readonly total = computed(() => this.netAmount());

  lineNetProfit(line: CartLine): number {
    return (line.item.selling_price * line.quantity) - line.discount - (line.item.purchase_price * line.quantity);
  }

  invoiceNetProfit(invoice: Receipt): number {
    const lineProfit = invoice.lines.reduce((total, line) => total + this.lineNetProfit(line), 0);
    return lineProfit - (invoice.discount ?? 0);
  }

  invoiceMetrics(invoice: Receipt): { total_cost: number; gross_amount: number; total_discounts: number; net_amount: number; net_profit: number } {
    const grossAmount = invoice.lines.reduce((total, line) => total + (line.item.selling_price * line.quantity), 0);
    const totalCost = invoice.lines.reduce((total, line) => total + (line.item.purchase_price * line.quantity), 0);
    const totalDiscounts = invoice.lines.reduce((total, line) => total + line.discount, 0) + (invoice.discount ?? 0);
    const netAmount = Math.max(0, grossAmount - totalDiscounts);
    const netProfit = netAmount - totalCost;

    return { total_cost: totalCost, gross_amount: grossAmount, total_discounts: totalDiscounts, net_amount: netAmount, net_profit: netProfit };
  }

  add(item: Item, quantity: number, discount: number): void {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }
    if (!Number.isFinite(discount) || discount < 0) {
      throw new Error('Line discount cannot be negative.');
    }
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
    if (!Number.isFinite(value) || (field === 'quantity' && value <= 0) ||
        (field === 'discount' && value < 0)) {
      throw new Error(field === 'quantity'
        ? 'Quantity must be greater than zero.'
        : 'Line discount cannot be negative.');
    }
    const existing = this.lines().find(line => line.item.id === itemId);
    if (!existing) {
      throw new Error(`Cannot update cart: item ${itemId} was not found.`);
    }
    this.lines.update(lines => lines.map(line => {
      if (line.item.id !== itemId) return line;
      const quantity = field === 'quantity' ? value : line.quantity;
      const discount = field === 'discount' ? value : line.discount;
      return {
        ...line,
        quantity,
        discount: Math.min(discount, quantity * line.item.selling_price)
      };
    }));
  }

  updateInvoice(updatedInvoice: Receipt): void {
    if (!this.completedInvoices().some(invoice => invoice.invoiceNo === updatedInvoice.invoiceNo)) {
      throw new Error(`Cannot update invoice ${updatedInvoice.invoiceNo}: invoice was not found.`);
    }
    this.completedInvoices.update(invoices => invoices.map(invoice =>
      invoice.invoiceNo === updatedInvoice.invoiceNo ? updatedInvoice : invoice
    ));
  }

  clear(): void {
    this.lines.set([]);
    this.billDiscount.set(0);
    this.paymentType.set('CASH');
  }
}
