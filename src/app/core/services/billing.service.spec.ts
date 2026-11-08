import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(() => {
    service = new BillingService();
  });

  it('loads invoice history using server-side date and payment filters', async () => {
    const get = jest.fn().mockReturnValue(of([]));
    const apiService = Injector.create({
      providers: [BillingService, { provide: HttpClient, useValue: { get } }],
    }).get(BillingService);

    await apiService.loadInvoices({
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      paymentType: 'CREDIT',
    });

    expect(get).toHaveBeenCalledWith(
      `${API_BASE_URL}/invoices?startDate=2026-10-01&endDate=2026-10-31&paymentType=CREDIT`,
    );
  });

  it('saves checkout invoices through the API and maps the returned receipt', async () => {
    const invoice = {
      id: 4,
      invoice_no: 'INV-1004',
      customer_id: null,
      customer_name: 'Sam',
      customer_phone: '9876543210',
      customer_gstin: null,
      cashier_name: 'Cashier',
      payment_type: 'CASH',
      site_note: null,
      gross_amount: '100.00',
      bill_discount: '5.00',
      total_discounts: '5.00',
      total_cost: '60.00',
      net_amount: '95.00',
      net_profit: '35.00',
      is_edited: false,
      edited_at: null,
      created_at: '2026-10-23T12:00:00.000Z',
      items: [{
        id: 10,
        item_id: 2,
        code: '101',
        name: 'PVC Pipe',
        category: 'Plumbing',
        unit: 'Mtr',
        quantity: 2,
        purchase_price: '30.00',
        selling_price: '50.00',
        line_discount: '0.00',
        line_total: '100.00',
      }],
    };
    const post = jest.fn().mockReturnValue(of(invoice));
    const apiService = Injector.create({
      providers: [BillingService, { provide: HttpClient, useValue: { post } }],
    }).get(BillingService);
    const request = {
      invoice_no: 'INV-1004',
      customer_name: 'Sam',
      customer_phone: '9876543210',
      bill_discount: 5,
      payment_type: 'CASH' as const,
      items: [{ item_id: 2, quantity: 2, line_discount: 0 }],
    };

    const receipt = await apiService.checkout(request);

    expect(post).toHaveBeenCalledWith(`${API_BASE_URL}/invoices/checkout`, request);
    expect(receipt.total).toBe(95);
    expect(receipt.lines[0].item.purchase_price).toBe(30);
    expect(apiService.completedInvoices()[0].invoiceNo).toBe('INV-1004');
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
    expect(service.netProfit()).toBe(30);
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
