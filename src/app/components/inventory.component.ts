import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationPipe } from '../translation.service';
import { AppComponent } from '../app.component';
import { Item, ItemCategory, ItemUnit } from '../models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent {
  @Input({ required: true }) vm!: AppComponent;
  @Output() readonly notify = new EventEmitter<string>();
  readonly editingItem = signal<Item | null>(null);
  editCode = '';
  editName = '';
  editCategory: ItemCategory = 'Plumbing';
  editUnit: ItemUnit = 'Pcs';
  editCost = 0;
  editPrice = 0;
  editStock = 0;
  editMinStock = 20;

  edit(item: Item): void {
    this.editingItem.set(item);
    this.editCode = item.code;
    this.editName = item.name;
    this.editCategory = item.category;
    this.editUnit = item.unit;
    this.editCost = item.purchase_price;
    this.editPrice = item.selling_price;
    this.editStock = item.stock_qty;
    this.editMinStock = item.min_stock_level;
  }

  saveEdit(): void {
    const item = this.editingItem();
    if (!item) return;
    try {
      this.vm.inventory.updateItem(item.id, {
        code: this.editCode.trim(),
        name: this.editName.trim(),
        category: this.editCategory,
        unit: this.editUnit,
        purchase_price: Number(this.editCost),
        selling_price: Number(this.editPrice),
        stock_qty: Number(this.editStock),
        min_stock_level: Number(this.editMinStock)
      });
      this.editingItem.set(null);
      this.notify.emit(`${this.editName.trim()} updated.`);
    } catch (error) {
      this.notify.emit(error instanceof Error ? error.message : 'The operation could not be completed.');
    }
  }
}
