import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../billing.service';
import { PaymentType, Receipt } from '../models';
import { TranslationPipe } from '../translation.service';

type PaymentFilter = 'ALL' | PaymentType;

@Component({
  selector: 'app-invoice-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './invoice-history.component.html'
})
export class InvoiceHistoryComponent {
  readonly billing = inject(BillingService);
  readonly search = signal('');
  readonly paymentFilter = signal<PaymentFilter>('ALL');
  readonly selectedInvoice = signal<Receipt | null>(null);
  readonly todayInvoices = computed(() => {
    const today = new Date();
    return this.billing.completedInvoices().filter(invoice => {
      const date = new Date(invoice.date);
      return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
    });
  });
  readonly filteredInvoices = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.billing.completedInvoices().filter(invoice => {
      const matchesQuery = !query || [
        invoice.invoiceNo,
        invoice.customerName,
        invoice.customerPhone
      ].some(value => value.toLowerCase().includes(query));
      return matchesQuery &&
        (this.paymentFilter() === 'ALL' || invoice.paymentType === this.paymentFilter());
    });
  });
  readonly totalCashCollected = computed(() => this.todayInvoices()
    .filter(invoice => invoice.paymentType === 'CASH')
    .reduce((total, invoice) => total + invoice.total, 0));
  readonly totalCreditOutstanding = computed(() => this.todayInvoices()
    .filter(invoice => invoice.paymentType === 'CREDIT')
    .reduce((total, invoice) => total + invoice.total, 0));

  @Output() readonly printInvoice = new EventEmitter<Receipt>();
  @Output() readonly editInvoice = new EventEmitter<Receipt>();

  totalItems(invoice: Receipt): number {
    return invoice.lines.reduce((total, line) => total + line.quantity, 0);
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
