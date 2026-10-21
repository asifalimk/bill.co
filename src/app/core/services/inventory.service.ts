import { Injectable, computed, signal } from '@angular/core';
import { Item } from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  readonly items = signal<Item[]>([
    { id: 1, code: '101', name: 'PVC Pipe 1-inch (6m)', category: 'Plumbing', unit: 'Mtr', purchase_price: 35, selling_price: 50, stock_qty: 120, min_stock_level: 20 },
    { id: 2, code: '102', name: 'PVC Elbow 90deg 1-inch', category: 'Plumbing', unit: 'Pcs', purchase_price: 8, selling_price: 15, stock_qty: 300, min_stock_level: 20 },
    { id: 3, code: '201', name: 'LED Bulb 9W White', category: 'Electrical', unit: 'Pcs', purchase_price: 60, selling_price: 90, stock_qty: 85, min_stock_level: 20 },
    { id: 4, code: '204', name: '2-inch Wood Screws Box', category: 'Fasteners', unit: 'Box', purchase_price: 120, selling_price: 175, stock_qty: 45, min_stock_level: 20 },
    { id: 5, code: '301', name: 'Brass Tap 1/2-inch Heavy', category: 'Plumbing', unit: 'Pcs', purchase_price: 280, selling_price: 400, stock_qty: 18, min_stock_level: 20 }
  ]);

  readonly itemCount = computed(() => this.items().length);
  private nextId = 6;

  addItem(item: Omit<Item, 'id'>): void {
    if (!/^\d{3}$/.test(item.code) || !item.name.trim() ||
        !Number.isFinite(item.purchase_price) || item.purchase_price < 0 ||
        !Number.isFinite(item.selling_price) || item.selling_price <= 0 ||
        !Number.isFinite(item.stock_qty) || item.stock_qty < 0 ||
        !Number.isFinite(item.min_stock_level) || item.min_stock_level < 0) {
      throw new Error('Enter a unique 3-digit code, name, valid prices, stock, and non-negative minimum stock level.');
    }
    if (this.items().some(existing => existing.code === item.code)) {
      throw new Error(`Item code ${item.code} already exists.`);
    }
    this.items.update(items => [...items, { ...item, name: item.name.trim(), id: this.nextId++ }]);
  }

  updateItem(itemId: number, updatedItem: Omit<Item, 'id'>): void {
    const existing = this.items().find(item => item.id === itemId);
    if (!existing) {
      throw new Error(`Cannot update item: item ${itemId} was not found.`);
    }
    if (!/^\d{3}$/.test(updatedItem.code) || !updatedItem.name.trim() ||
        !Number.isFinite(updatedItem.purchase_price) || updatedItem.purchase_price < 0 ||
        !Number.isFinite(updatedItem.selling_price) || updatedItem.selling_price <= 0 ||
        !Number.isFinite(updatedItem.stock_qty) || updatedItem.stock_qty < 0 ||
        !Number.isFinite(updatedItem.min_stock_level) || updatedItem.min_stock_level < 0) {
      throw new Error('Enter a unique 3-digit code, name, valid prices, stock, and non-negative minimum stock level.');
    }
    if (this.items().some(item => item.id !== itemId && item.code === updatedItem.code)) {
      throw new Error(`Item code ${updatedItem.code} already exists.`);
    }
    this.items.update(items => items.map(item =>
      item.id === itemId ? { ...updatedItem, id: itemId, name: updatedItem.name.trim() } : item
    ));
  }

  adjustStock(itemId: number, quantity: number): void {
    const item = this.items().find(candidate => candidate.id === itemId);
    if (!item) {
      throw new Error(`Cannot update stock: item ${itemId} was not found.`);
    }
    const stock = item.stock_qty + quantity;
    if (stock < 0) {
      throw new Error(`Insufficient stock for ${item.name}.`);
    }
    this.items.update(items => items.map(candidate =>
      candidate.id === itemId ? { ...candidate, stock_qty: stock } : candidate
    ));
  }

  findByCode(code: string): Item | undefined {
    return this.items().find(item => item.code === code);
  }
}
