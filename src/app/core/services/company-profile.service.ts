import { Injectable, signal } from '@angular/core';
import { CompanyProfile } from '../models';

@Injectable({ providedIn: 'root' })
export class CompanyProfileService {
  readonly profile = signal<CompanyProfile>({
    store_name: 'HARDWARE COUNTER',
    short_name: 'H',
    tagline: 'Retail hardware & supplies',
    phone: '98765 43210',
    address: '24 Market Road, Kochi',
    gstin: '32ABCDE1234F1Z5',
    email: 'hello@hardwarecounter.in',
    website: 'www.hardwarecounter.in',
    footer_note: 'Thank you for your business!',
    terms: 'Goods once sold are not returnable unless damaged.'
  });

  update(details: Partial<CompanyProfile>): void {
    this.profile.update(current => ({
      ...current,
      ...Object.fromEntries(
        Object.entries(details)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      )
    }));
  }
}
