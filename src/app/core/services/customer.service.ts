import { Injectable, computed, signal } from '@angular/core';
import { Customer } from '../models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  readonly customers = signal<Customer[]>([]);
  readonly customerCount = computed(() => this.customers().length);
  private nextId = 1;

  add(customer: Omit<Customer, 'id' | 'created_at' | 'credit_balance'>): Customer {
    const name = customer.name.trim();
    const phone = customer.phone.trim();
    if (!name || !/^\d{7,15}$/.test(phone)) {
      throw new Error('Enter a customer name and a valid 7–15 digit phone number.');
    }
    if (this.findByPhone(phone)) {
      throw new Error(`A customer with phone ${phone} already exists.`);
    }
    const created: Customer = {
      ...customer,
      id: this.nextId++,
      name,
      phone,
      address: customer.address?.trim() || undefined,
      gstin: customer.gstin?.trim() || undefined,
      credit_balance: 0,
      created_at: new Date().toISOString()
    };
    this.customers.update(customers => [created, ...customers]);
    return created;
  }

  update(customerId: number, details: Omit<Customer, 'id' | 'created_at' | 'credit_balance'>): void {
    const existing = this.customers().find(customer => customer.id === customerId);
    if (!existing) {
      throw new Error(`Cannot update customer ${customerId}: customer was not found.`);
    }
    const name = details.name.trim();
    const phone = details.phone.trim();
    if (!name || !/^\d{7,15}$/.test(phone)) {
      throw new Error('Enter a customer name and a valid 7–15 digit phone number.');
    }
    if (this.customers().some(customer => customer.id !== customerId && customer.phone === phone)) {
      throw new Error(`A customer with phone ${phone} already exists.`);
    }
    this.customers.update(customers => customers.map(customer => customer.id === customerId
      ? {
          ...customer,
          ...details,
          name,
          phone,
          address: details.address?.trim() || undefined,
          gstin: details.gstin?.trim() || undefined
        }
      : customer));
  }

  findByPhone(phone: string): Customer | undefined {
    const normalized = phone.trim();
    return this.customers().find(customer => customer.phone === normalized);
  }

  findById(customerId: number): Customer | undefined {
    return this.customers().find(customer => customer.id === customerId);
  }

  adjustCreditBalance(customerId: number, amount: number): void {
    if (!Number.isFinite(amount)) {
      throw new Error('Credit balance adjustment must be a valid amount.');
    }
    const customer = this.findById(customerId);
    if (!customer) {
      throw new Error(`Cannot update credit balance: customer ${customerId} was not found.`);
    }
    const balance = customer.credit_balance + amount;
    if (balance < 0) {
      throw new Error(`Credit balance for ${customer.name} cannot be negative.`);
    }
    this.customers.update(customers => customers.map(candidate =>
      candidate.id === customerId ? { ...candidate, credit_balance: balance } : candidate
    ));
  }
}
