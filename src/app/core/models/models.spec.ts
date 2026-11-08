import { BillingService } from '../services/billing.service';
import { Item } from './index';

describe('Billing model calculations', () => {
  it('calculates amounts from reactive cart lines', () => {
    const billing = new BillingService();
    const item: Item = {
      id: 10,
      code: '999',
      name: 'Test Item',
      category: 'Tools',
      unit: 'Pcs',
      purchase_price: 30,
      selling_price: 100,
      stock_qty: 12,
      min_stock_level: 5,
    };

    billing.add(item, 2, 10);

    expect(billing.grossAmount()).toBe(200);
    expect(billing.totalDiscounts()).toBe(10);
    expect(billing.netAmount()).toBe(190);
    expect(billing.netProfit()).toBe(130);
  });
});
