import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Vendor } from '../models';

@Injectable({ providedIn: 'root' })
export class VendorService {
  readonly vendors = signal<Vendor[]>([]);
  readonly vendorCount = computed(() => this.vendors().length);

  constructor(@Optional() private readonly http?: HttpClient) {}

  async load(): Promise<void> {
    this.vendors.set(await firstValueFrom(this.requireHttp().get<Vendor[]>(`${API_BASE_URL}/vendors`)));
  }

  async add(details: Omit<Vendor, 'id' | 'created_at'>): Promise<Vendor> {
    const vendor = await firstValueFrom(this.requireHttp().post<Vendor>(`${API_BASE_URL}/vendors`, this.validate(details)));
    this.vendors.update(vendors => [vendor, ...vendors]);
    return vendor;
  }

  async update(vendorId: number, details: Omit<Vendor, 'id' | 'created_at'>): Promise<Vendor> {
    const vendor = await firstValueFrom(
      this.requireHttp().patch<Vendor>(`${API_BASE_URL}/vendors/${vendorId}`, this.validate(details, vendorId)),
    );
    this.vendors.update(vendors => vendors.map(existing => existing.id === vendorId ? vendor : existing));
    return vendor;
  }

  findByPhone(phone: string): Vendor | undefined {
    return this.vendors().find(vendor => vendor.phone === phone.trim());
  }

  findById(vendorId: number): Vendor | undefined {
    return this.vendors().find(vendor => vendor.id === vendorId);
  }

  async remove(vendorId: number): Promise<void> {
    await firstValueFrom(this.requireHttp().delete<void>(`${API_BASE_URL}/vendors/${vendorId}`));
    this.vendors.update(vendors => vendors.filter(vendor => vendor.id !== vendorId));
  }

  private validate(details: Omit<Vendor, 'id' | 'created_at'>, excludingId?: number) {
    const name = details.name.trim();
    const companyName = details.company_name.trim();
    const phone = details.phone.trim();
    if (!name || !companyName || !/^[0-9+()\-\s]{7,15}$/.test(phone)) {
      throw new Error('Enter a vendor contact name, company name, and a valid phone number.');
    }
    if (this.vendors().some(vendor => vendor.id !== excludingId && vendor.phone === phone)) {
      throw new Error(`A vendor with phone ${phone} already exists.`);
    }
    return {
      name,
      company_name: companyName,
      phone,
      email: details.email?.trim() || undefined,
      address: details.address?.trim() || undefined,
      gstin: details.gstin?.trim() || undefined,
    };
  }

  private requireHttp(): HttpClient {
    if (!this.http) throw new Error('HTTP client is unavailable.');
    return this.http;
  }
}
