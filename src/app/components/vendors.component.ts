import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../vendor.service';
import { Vendor } from '../models';
import { TranslationPipe } from '../translation.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './vendors.component.html'
})
export class VendorsComponent {
  readonly vendorService = inject(VendorService);
  readonly search = signal('');
  readonly editingVendor = signal<Vendor | null>(null);
  readonly formOpen = signal(false);
  readonly formError = signal('');
  readonly filteredVendors = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.vendorService.vendors().filter(vendor =>
      !query || vendor.name.toLowerCase().includes(query) || vendor.company_name.toLowerCase().includes(query) || vendor.phone.includes(query)
    );
  });

  name = '';
  companyName = '';
  phone = '';
  email = '';
  address = '';
  gstin = '';

  openNewVendor(): void {
    this.editingVendor.set(null);
    this.name = '';
    this.companyName = '';
    this.phone = '';
    this.email = '';
    this.address = '';
    this.gstin = '';
    this.formError.set('');
    this.formOpen.set(true);
  }

  editVendor(vendor: Vendor): void {
    this.editingVendor.set(vendor);
    this.name = vendor.name;
    this.companyName = vendor.company_name;
    this.phone = vendor.phone;
    this.email = vendor.email ?? '';
    this.address = vendor.address ?? '';
    this.gstin = vendor.gstin ?? '';
    this.formError.set('');
    this.formOpen.set(true);
  }

  saveVendor(): void {
    try {
      const details = {
        name: this.name,
        company_name: this.companyName,
        phone: this.phone,
        email: this.email,
        address: this.address,
        gstin: this.gstin
      };
      const existing = this.editingVendor();
      if (existing) {
        this.vendorService.update(existing.id, details);
      } else {
        this.vendorService.add(details);
      }
      this.formOpen.set(false);
      this.formError.set('');
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'The operation could not be completed.');
    }
  }
}
