import { Injectable, computed, signal } from '@angular/core';
import { Vendor } from './models';

@Injectable({ providedIn: 'root' })
export class VendorService {
  readonly vendors = signal<Vendor[]>([
    {
      id: 1,
      name: 'Anil Nair',
      company_name: 'Metro Plumbing Supplies',
      phone: '9876543210',
      email: 'sales@metroplumbing.in',
      address: 'Kochi, Kerala',
      gstin: '32ABCDE1234F1Z5',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Sreelatha Menon',
      company_name: 'Bright Electrical Mart',
      phone: '9123456780',
      email: 'hello@brightelectrical.in',
      address: 'Thrissur, Kerala',
      gstin: '32XYZDE5678F1Z5',
      created_at: new Date().toISOString()
    }
  ]);
  readonly vendorCount = computed(() => this.vendors().length);
  private nextId = 3;

  add(vendor: Omit<Vendor, 'id' | 'created_at'>): Vendor {
    const name = vendor.name.trim();
    const companyName = vendor.company_name.trim();
    const phone = vendor.phone.trim();
    if (!name || !companyName || !/^[0-9+()\-\s]{7,15}$/.test(phone)) {
      throw new Error('Enter a vendor contact name, company name, and a valid phone number.');
    }
    if (this.findByPhone(phone)) {
      throw new Error(`A vendor with phone ${phone} already exists.`);
    }
    const created: Vendor = {
      ...vendor,
      id: this.nextId++,
      name,
      company_name: companyName,
      phone,
      email: vendor.email?.trim() || undefined,
      address: vendor.address?.trim() || undefined,
      gstin: vendor.gstin?.trim() || undefined,
      created_at: new Date().toISOString()
    };
    this.vendors.update(vendors => [created, ...vendors]);
    return created;
  }

  update(vendorId: number, details: Omit<Vendor, 'id' | 'created_at'>): void {
    const existing = this.vendors().find(vendor => vendor.id === vendorId);
    if (!existing) {
      throw new Error(`Cannot update vendor ${vendorId}: vendor was not found.`);
    }
    const name = details.name.trim();
    const companyName = details.company_name.trim();
    const phone = details.phone.trim();
    if (!name || !companyName || !/^[0-9+()\-\s]{7,15}$/.test(phone)) {
      throw new Error('Enter a vendor contact name, company name, and a valid phone number.');
    }
    if (this.vendors().some(vendor => vendor.id !== vendorId && vendor.phone === phone)) {
      throw new Error(`A vendor with phone ${phone} already exists.`);
    }
    this.vendors.update(vendors => vendors.map(vendor => vendor.id === vendorId ? {
      ...vendor,
      ...details,
      name,
      company_name: companyName,
      phone,
      email: details.email?.trim() || undefined,
      address: details.address?.trim() || undefined,
      gstin: details.gstin?.trim() || undefined
    } : vendor));
  }

  findByPhone(phone: string): Vendor | undefined {
    return this.vendors().find(vendor => vendor.phone === phone.trim());
  }

  findById(vendorId: number): Vendor | undefined {
    return this.vendors().find(vendor => vendor.id === vendorId);
  }
}
