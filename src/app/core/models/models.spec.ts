import { BillingService } from '../services/billing.service';
import { CustomerService } from '../services/customer.service';
import { InventoryService } from '../services/inventory.service';
import { VendorService } from '../services/vendor.service';
import { CompanyProfileService } from '../services/company-profile.service';
import { Item } from './index';

describe('Domain model and services', () => {
  it('creates valid billing totals and profit metrics', () => {
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
      min_stock_level: 5
    };

    billing.add(item, 2, 10);
    expect(billing.grossAmount()).toBe(200);
    expect(billing.totalDiscounts()).toBe(10);
    expect(billing.netAmount()).toBe(190);
    expect(billing.netProfit()).toBe(130);
  });

  it('validates customer creation rules and balance adjustments', () => {
    const customerService = new CustomerService();
    const customer = customerService.add({ name: 'Jane Doe', phone: '9999999999', address: 'Kochi', gstin: '32ABC' });
    expect(customer.id).toBe(1);
    customerService.adjustCreditBalance(customer.id, 250);
    expect(customerService.findById(customer.id)?.credit_balance).toBe(250);
    expect(() => customerService.add({ name: 'Jane Doe', phone: '9999999999', address: 'x' })).toThrow();
  });

  it('tracks inventory stock and rejects invalid updates', () => {
    const inventory = new InventoryService();
    const item = inventory.items()[0];
    inventory.adjustStock(item.id, -5);
    expect(inventory.items().find(candidate => candidate.id === item.id)?.stock_qty).toBe(item.stock_qty - 5);
    expect(() => inventory.adjustStock(999, 1)).toThrow();
  });

  it('allows vendor lookup and rejects duplicates', () => {
    const vendorService = new VendorService();
    const vendor = vendorService.add({ name: 'Test Vendor', company_name: 'Vendor Co', phone: '1111111111', address: 'Aluva', gstin: '32XYZ' });
    expect(vendorService.findById(vendor.id)?.company_name).toBe('Vendor Co');
    expect(() => vendorService.add({ name: 'X', company_name: 'Y', phone: '1111111111' })).toThrow();
  });

  it('exposes a default company profile and allows updates', () => {
    const companyProfileService = new CompanyProfileService();
    const initial = companyProfileService.profile();
    expect(initial.store_name).toContain('HARDWARE');
    companyProfileService.update({ store_name: 'Mylabs Hardware' });
    expect(companyProfileService.profile().store_name).toBe('Mylabs Hardware');
  });
});
