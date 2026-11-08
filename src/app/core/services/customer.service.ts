import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Customer } from '../models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  readonly customers = signal<Customer[]>([]);
  readonly customerCount = computed(() => this.customers().length);

  constructor(@Optional() private readonly http?: HttpClient) {}

  async load(): Promise<void> {
    const customers = await firstValueFrom(this.requireHttp().get<Customer[]>(`${API_BASE_URL}/customers`));
    this.customers.set(customers.map(customer => this.mapCustomer(customer)));
  }

  async add(details: Omit<Customer, 'id' | 'created_at' | 'credit_balance'>): Promise<Customer> {
    const payload = this.validate(details);
    const customer = this.mapCustomer(await firstValueFrom(
      this.requireHttp().post<Customer>(`${API_BASE_URL}/customers`, payload),
    ));
    this.customers.update(customers => [customer, ...customers]);
    return customer;
  }

  async update(
    customerId: number,
    details: Omit<Customer, 'id' | 'created_at' | 'credit_balance'>,
  ): Promise<Customer> {
    const payload = this.validate(details, customerId);
    const customer = this.mapCustomer(await firstValueFrom(
      this.requireHttp().patch<Customer>(`${API_BASE_URL}/customers/${customerId}`, payload),
    ));
    this.customers.update(customers => customers.map(existing => existing.id === customerId ? customer : existing));
    return customer;
  }

  findByPhone(phone: string): Customer | undefined {
    return this.customers().find(customer => customer.phone === phone.trim());
  }

  findById(customerId: number): Customer | undefined {
    return this.customers().find(customer => customer.id === customerId);
  }

  async adjustCreditBalance(customerId: number, amount: number): Promise<Customer> {
    if (!Number.isFinite(amount)) throw new Error('Credit balance adjustment must be a valid amount.');
    const customer = this.mapCustomer(await firstValueFrom(
      this.requireHttp().patch<Customer>(`${API_BASE_URL}/customers/${customerId}/credit`, { amount }),
    ));
    this.customers.update(customers => customers.map(existing => existing.id === customerId ? customer : existing));
    return customer;
  }

  async remove(customerId: number): Promise<void> {
    await firstValueFrom(this.requireHttp().delete<void>(`${API_BASE_URL}/customers/${customerId}`));
    this.customers.update(customers => customers.filter(customer => customer.id !== customerId));
  }

  private validate(details: Omit<Customer, 'id' | 'created_at' | 'credit_balance'>, excludingId?: number) {
    const name = details.name.trim();
    const phone = details.phone.trim();
    if (!name || !/^\d{7,15}$/.test(phone)) {
      throw new Error('Enter a customer name and a valid 7–15 digit phone number.');
    }
    const duplicate = this.customers().find(customer => customer.id !== excludingId && customer.phone === phone);
    if (duplicate) throw new Error(`A customer with phone ${phone} already exists.`);
    return {
      name,
      phone,
      address: details.address?.trim() || undefined,
      gstin: details.gstin?.trim() || undefined,
    };
  }

  private mapCustomer(customer: Customer): Customer {
    return { ...customer, credit_balance: Number(customer.credit_balance) };
  }

  private requireHttp(): HttpClient {
    if (!this.http) throw new Error('HTTP client is unavailable.');
    return this.http;
  }
}
