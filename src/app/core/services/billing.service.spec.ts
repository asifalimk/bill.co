import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(() => {
    service = new BillingService();
  });

  it('should add items and compute subtotal, discount and profit', () => {
    service.add({
      id: 1,
      code: '101',
      name: 'PVC Pipe',
      category: 'Plumbing',
      unit: 'Mtr',
      purchase_price: 30,
      selling_price: 50,
      stock_qty: 10,
      min_stock_level: 5
    }, 2, 10);

    expect(service.lines().length).toBe(1);
    expect(service.grossAmount()).toBe(100);
    expect(service.subtotal()).toBe(90);
    expect(service.netProfit()).toBe(40);
  });

  it('should cap line discounts to selling value and reject invalid inputs', () => {
    service.add({
      id: 1,
      code: '101',
      name: 'PVC Pipe',
      category: 'Plumbing',
      unit: 'Mtr',
      purchase_price: 30,
      selling_price: 50,
      stock_qty: 10,
      min_stock_level: 5
    }, 2, 300);
    expect(service.lines()[0].discount).toBe(100);
    expect(() => service.add({
      id: 2,
      code: '102',
      name: 'Another',
      category: 'Plumbing',
      unit: 'Pcs',
      purchase_price: 1,
      selling_price: 2,
      stock_qty: 5,
      min_stock_level: 1
    }, 1, -1)).toThrow();
  });

  it('should update line quantities and clear the cart', () => {
    service.add({
      id: 1,
      code: '101',
      name: 'PVC Pipe',
      category: 'Plumbing',
      unit: 'Mtr',
      purchase_price: 30,
      selling_price: 50,
      stock_qty: 10,
      min_stock_level: 5
    }, 2, 0);

    service.updateLine(1, 'quantity', 3);
    expect(service.lines()[0].quantity).toBe(3);
    service.clear();
    expect(service.lines()).toEqual([]);
    expect(service.billDiscount()).toBe(0);
  });
});
