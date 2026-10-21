import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
  });

  it('should add a new item with valid data', () => {
    service.addItem({ code: '111', name: 'New Fastener', category: 'Fasteners', unit: 'Box', purchase_price: 10, selling_price: 15, stock_qty: 5, min_stock_level: 2 });
    expect(service.items().length).toBeGreaterThan(0);
  });

  it('should reject duplicate item codes', () => {
    expect(() => service.addItem({ code: '101', name: 'Duplicate', category: 'Plumbing', unit: 'Pcs', purchase_price: 1, selling_price: 2, stock_qty: 1, min_stock_level: 1 })).toThrow();
  });

  it('should adjust stock and reject negative totals', () => {
    service.adjustStock(1, -10);
    expect(service.findByCode('101')?.stock_qty).toBe(110);
    expect(() => service.adjustStock(1, -99999)).toThrow();
  });
});
