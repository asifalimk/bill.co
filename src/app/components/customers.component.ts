import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../customer.service';
import { Customer } from '../models';
import { TranslationPipe } from '../translation.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './customers.component.html'
})
export class CustomersComponent {
  readonly customerService = inject(CustomerService);
  readonly search = signal('');
  readonly editingCustomer = signal<Customer | null>(null);
  readonly formOpen = signal(false);
  readonly formError = signal('');
  readonly filteredCustomers = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.customerService.customers().filter(customer =>
      !query || customer.name.toLowerCase().includes(query) || customer.phone.includes(query)
    );
  });

  name = '';
  phone = '';
  address = '';
  gstin = '';

  openNewCustomer(): void {
    this.editingCustomer.set(null);
    this.name = '';
    this.phone = '';
    this.address = '';
    this.gstin = '';
    this.formError.set('');
    this.formOpen.set(true);
  }

  editCustomer(customer: Customer): void {
    this.editingCustomer.set(customer);
    this.name = customer.name;
    this.phone = customer.phone;
    this.address = customer.address ?? '';
    this.gstin = customer.gstin ?? '';
    this.formError.set('');
    this.formOpen.set(true);
  }

  saveCustomer(): void {
    try {
      const details = { name: this.name, phone: this.phone, address: this.address, gstin: this.gstin };
      const existing = this.editingCustomer();
      if (existing) {
        this.customerService.update(existing.id, details);
      } else {
        this.customerService.add(details);
      }
      this.formOpen.set(false);
      this.formError.set('');
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'The operation could not be completed.');
    }
  }
}
