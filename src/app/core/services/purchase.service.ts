import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface PurchaseRecord {
  id: number;
  invoice_no: string;
  purchase_date: string;
  vendor_id: number;
  vendor: { id: number; name: string; company_name: string };
}

export interface PurchaseRequest {
  vendor_id: number;
  invoice_no: string;
  purchase_date?: string;
  notes?: string;
  lines: Array<{
    item_id: number;
    quantity: number;
    unit_cost: number;
    selling_price: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  readonly purchases = signal<PurchaseRecord[]>([]);

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    const purchases = await firstValueFrom(
      this.http.get<PurchaseRecord[]>(`${API_BASE_URL}/purchases`),
    );
    this.purchases.set(purchases);
  }

  async create(purchase: PurchaseRequest): Promise<PurchaseRecord> {
    const created = await firstValueFrom(
      this.http.post<PurchaseRecord>(`${API_BASE_URL}/purchases`, purchase),
    );
    this.purchases.update(purchases => [created, ...purchases]);
    return created;
  }
}
