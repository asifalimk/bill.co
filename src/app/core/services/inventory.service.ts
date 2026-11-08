import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Item } from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  readonly items = signal<Item[]>([]);
  readonly itemCount = computed(() => this.items().length);

  constructor(@Optional() private readonly http?: HttpClient) {}

  async load(): Promise<void> {
    const items = await firstValueFrom(this.requireHttp().get<Item[]>(`${API_BASE_URL}/items`));
    this.items.set(items.map(item => this.mapItem(item)));
  }

  async addItem(item: Omit<Item, 'id'>): Promise<Item> {
    this.validateItem(item);
    const created = this.mapItem(await firstValueFrom(
      this.requireHttp().post<Item>(`${API_BASE_URL}/items`, {
        ...this.toApiItem(item),
        stock_qty: 0,
      }),
    ));
    this.items.update(items => [created, ...items]);
    return created;
  }

  async updateItem(itemId: number, updatedItem: Omit<Item, 'id'>): Promise<Item> {
    this.validateItem(updatedItem, itemId);
    const { stock_qty: _stockQty, ...itemDetails } = this.toApiItem(updatedItem);
    void _stockQty;
    const updated = this.mapItem(await firstValueFrom(
      this.requireHttp().put<Item>(`${API_BASE_URL}/items/${itemId}`, itemDetails),
    ));
    this.items.update(items => items.map(item => item.id === itemId ? updated : item));
    return updated;
  }

  async adjustStock(itemId: number, quantity: number): Promise<Item> {
    if (!Number.isInteger(quantity) || quantity === 0) {
      throw new Error('Stock adjustment must be a non-zero whole number.');
    }

    const updated = this.mapItem(await firstValueFrom(
      this.requireHttp().patch<Item>(`${API_BASE_URL}/items/${itemId}/stock`, { quantity }),
    ));
    this.items.update(items => items.map(item => item.id === itemId ? updated : item));
    return updated;
  }

  async removeItem(itemId: number): Promise<void> {
    await firstValueFrom(this.requireHttp().delete<void>(`${API_BASE_URL}/items/${itemId}`));
    this.items.update(items => items.filter(item => item.id !== itemId));
  }

  findByCode(code: string): Item | undefined {
    return this.items().find(item => item.code === code);
  }

  replaceItems(items: Item[]): void {
    this.items.set(items.map(item => this.mapItem(item)));
  }

  private validateItem(item: Omit<Item, 'id'>, excludingId?: number): void {
    if (!/^\d{3}$/.test(item.code) || !item.name.trim() ||
        !Number.isFinite(Number(item.purchase_price)) || item.purchase_price < 0 ||
        !Number.isFinite(Number(item.selling_price)) || item.selling_price <= 0 ||
        !Number.isInteger(Number(item.stock_qty)) || item.stock_qty < 0 ||
        !Number.isInteger(Number(item.min_stock_level)) || item.min_stock_level < 0) {
      throw new Error('Enter a unique 3-digit code, name, valid prices, stock, and non-negative minimum stock level.');
    }
    if (this.items().some(existing => existing.id !== excludingId && existing.code === item.code)) {
      throw new Error(`Item code ${item.code} already exists.`);
    }
  }

  private toApiItem(item: Omit<Item, 'id'>): Omit<Item, 'id'> {
    return {
      ...item,
      name: item.name.trim(),
      purchase_price: Number(item.purchase_price),
      selling_price: Number(item.selling_price),
      stock_qty: Number(item.stock_qty),
      min_stock_level: Number(item.min_stock_level),
    };
  }

  private mapItem(item: Item): Item {
    return {
      ...item,
      purchase_price: Number(item.purchase_price ?? 0),
      selling_price: Number(item.selling_price),
      stock_qty: Number(item.stock_qty),
      min_stock_level: Number(item.min_stock_level),
    };
  }

  private requireHttp(): HttpClient {
    if (!this.http) throw new Error('HTTP client is unavailable.');
    return this.http;
  }
}
