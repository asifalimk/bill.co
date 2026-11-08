import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { CompanyProfile } from '../models';

interface ApiCompanyProfile {
  store_name: string;
  short_name: string;
  tagline: string;
  phone_primary: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  terms_and_conditions: string;
  email: string;
  website: string;
  footer_note: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyProfileService {
  readonly profile = signal<CompanyProfile>({
    store_name: 'HARDWARE COUNTER',
    short_name: 'H',
    tagline: 'Retail hardware & supplies',
    phone: '98765 43210',
    address: '24 Market Road, Kochi',
    gstin: '',
    email: '',
    website: '',
    footer_note: 'Thank you for your business!',
    terms: 'Goods once sold are not returnable unless damaged.',
  });
  readonly saveError = signal('');
  private saveTimer: ReturnType<typeof setTimeout> | undefined;
  private pendingFields = new Set<keyof CompanyProfile>();

  constructor(@Optional() private readonly http?: HttpClient) {}

  async load(): Promise<void> {
    if (!this.http) throw new Error('HTTP client is unavailable.');
    const profile = await firstValueFrom(this.http.get<ApiCompanyProfile>(`${API_BASE_URL}/company-profile`));
    this.profile.set(this.fromApi(profile));
  }

  update(details: Partial<CompanyProfile>): void {
    this.profile.update(current => ({
      ...current,
      ...Object.fromEntries(
        Object.entries(details)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
      ),
    }));
    Object.keys(details).forEach(key => this.pendingFields.add(key as keyof CompanyProfile));
    this.saveError.set('');
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      void this.saveCurrentProfile().catch((error: unknown) => {
        this.saveError.set(error instanceof Error ? error.message : 'Unable to save company profile.');
      });
    }, 350);
  }

  private async saveCurrentProfile(): Promise<void> {
    if (!this.http) throw new Error('HTTP client is unavailable.');
    const profile = this.profile();
    const fields: Partial<ApiCompanyProfile> = {};
    this.pendingFields.forEach(field => {
      switch (field) {
        case 'store_name': fields.store_name = profile.store_name; break;
        case 'short_name': fields.short_name = profile.short_name; break;
        case 'tagline': fields.tagline = profile.tagline; break;
        case 'phone': fields.phone_primary = profile.phone; break;
        case 'address':
          fields.address_line1 = profile.address;
          fields.city = '';
          fields.state = '';
          fields.pincode = '';
          break;
        case 'gstin': fields.gstin = profile.gstin; break;
        case 'email': fields.email = profile.email; break;
        case 'website': fields.website = profile.website; break;
        case 'footer_note': fields.footer_note = profile.footer_note; break;
        case 'terms': fields.terms_and_conditions = profile.terms; break;
      }
    });
    const changedFields = [...this.pendingFields];
    changedFields.forEach(field => this.pendingFields.delete(field));
    try {
      await firstValueFrom(
        this.http.patch<ApiCompanyProfile>(`${API_BASE_URL}/company-profile`, fields),
      );
    } catch (error) {
      changedFields.forEach(field => this.pendingFields.add(field));
      throw error;
    }
  }

  private fromApi(profile: ApiCompanyProfile): CompanyProfile {
    return {
      store_name: profile.store_name,
      short_name: profile.short_name,
      tagline: profile.tagline,
      phone: profile.phone_primary,
      address: [profile.address_line1, profile.city, profile.state, profile.pincode].filter(Boolean).join(', '),
      gstin: profile.gstin,
      email: profile.email,
      website: profile.website,
      footer_note: profile.footer_note,
      terms: profile.terms_and_conditions,
    };
  }
}
