import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { BillingService } from '../billing.service';
import { PaymentType, Receipt } from '../models';
import { TranslationPipe } from '../translation.service';

type PaymentFilter = 'ALL' | PaymentType;
type DatePreset = 'ALL' | 'TODAY' | 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_6_MONTHS' | 'CUSTOM';

@Component({
  selector: 'app-invoice-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './invoice-history.component.html'
})
export class InvoiceHistoryComponent {
  readonly auth = inject(AuthService);
  readonly billing = inject(BillingService);
  readonly search = signal('');
  readonly paymentFilter = signal<PaymentFilter>('ALL');
  readonly datePreset = signal<DatePreset>('ALL');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly selectedInvoice = signal<Receipt | null>(null);

  readonly filteredInvoices = computed(() => {
    const query = this.search().trim().toLowerCase();
    const preset = this.datePreset();
    const startValue = this.startDate();
    const endValue = this.endDate();

    return this.billing.completedInvoices().filter(invoice => {
      const date = new Date(invoice.date);
      const matchesDate = this.matchesDatePreset(date, preset, startValue, endValue);
      const matchesQuery = !query || [
        invoice.invoiceNo,
        invoice.customerName,
        invoice.customerPhone
      ].some(value => value.toLowerCase().includes(query));
      const matchesPayment = this.paymentFilter() === 'ALL' || invoice.paymentType === this.paymentFilter();
      return matchesDate && matchesQuery && matchesPayment;
    });
  });
  readonly totalRevenue = computed(() => this.filteredInvoices()
    .reduce((total, invoice) => total + (invoice.net_amount ?? invoice.total), 0));
  readonly totalDiscountsOffered = computed(() => this.filteredInvoices()
    .reduce((total, invoice) => total + (invoice.total_discounts ?? (
      invoice.lines.reduce((lineTotal, line) => lineTotal + line.discount, 0) + (invoice.discount ?? 0)
    )), 0));
  readonly totalItemCosts = computed(() => this.filteredInvoices()
    .reduce((total, invoice) => total + (invoice.total_cost ?? invoice.lines.reduce(
      (lineTotal, line) => lineTotal + (line.item.purchase_price * line.quantity),
      0
    )), 0));
  readonly netProfitEarned = computed(() => this.filteredInvoices()
    .reduce((total, invoice) => total + (invoice.net_profit ?? this.invoiceProfitValue(invoice)), 0));
  readonly totalCashCollected = computed(() => this.filteredInvoices()
    .filter(invoice => invoice.paymentType === 'CASH')
    .reduce((total, invoice) => total + invoice.total, 0));
  readonly totalCreditOutstanding = computed(() => this.filteredInvoices()
    .filter(invoice => invoice.paymentType === 'CREDIT')
    .reduce((total, invoice) => total + invoice.total, 0));

  @Output() readonly printInvoice = new EventEmitter<Receipt>();
  @Output() readonly editInvoice = new EventEmitter<Receipt>();

  totalItems(invoice: Receipt): number {
    return invoice.lines.reduce((total, line) => total + line.quantity, 0);
  }

  invoiceItemCostValue(invoice: Receipt): number {
    return invoice.total_cost ?? invoice.lines.reduce(
      (total, line) => total + (line.item.purchase_price * line.quantity),
      0
    );
  }

  invoiceProfitValue(invoice: Receipt): number {
    const grossAmount = invoice.lines.reduce((total, line) => total + (line.item.selling_price * line.quantity), 0);
    const totalCost = this.invoiceItemCostValue(invoice);
    const totalDiscounts = invoice.lines.reduce((total, line) => total + line.discount, 0) + (invoice.discount ?? 0);
    return Math.max(0, grossAmount - totalDiscounts) - totalCost;
  }

  matchesDatePreset(date: Date, preset: DatePreset, start: string, end: string): boolean {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    if (preset === 'ALL') {
      return true;
    }

    if (preset === 'TODAY') {
      const today = new Date();
      return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    }

    if (preset === 'THIS_MONTH') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return dayStart >= monthStart && dayEnd <= monthEnd;
    }

    if (preset === 'LAST_MONTH') {
      const now = new Date();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return dayStart >= startOfLastMonth && dayEnd <= endOfLastMonth;
    }

    if (preset === 'LAST_6_MONTHS') {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return dayStart >= sixMonthsAgo && dayStart <= new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    if (preset === 'CUSTOM') {
      if (!start && !end) {
        return true;
      }
      const startDate = start ? new Date(start + 'T00:00:00') : null;
      const endDate = end ? new Date(end + 'T23:59:59.999') : null;
      if (startDate && dayStart < startDate) return false;
      if (endDate && dayEnd > endDate) return false;
      return true;
    }

    return true;
  }

  onDatePresetChange(preset: DatePreset): void {
    this.datePreset.set(preset);
    if (preset !== 'CUSTOM') {
      this.startDate.set('');
      this.endDate.set('');
    }
  }

  printSelectedInvoice(): void {
    const invoice = this.selectedInvoice();
    if (invoice) {
      this.printInvoice.emit(invoice);
    }
  }

  editSelectedInvoice(): void {
    const invoice = this.selectedInvoice();
    if (invoice) {
      this.editInvoice.emit(invoice);
      this.selectedInvoice.set(null);
    }
  }
}
