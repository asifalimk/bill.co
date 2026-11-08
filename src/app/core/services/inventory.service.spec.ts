import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Item } from '../models';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  const item: Item = {
    id: 1,
    code: '101',
    name: 'PVC Pipe',
    category: 'Plumbing',
    unit: 'Mtr',
    purchase_price: 35,
    selling_price: 50,
    stock_qty: 120,
    min_stock_level: 20,
  };

  function createService(http: object): InventoryService {
    return Injector.create({
      providers: [InventoryService, { provide: HttpClient, useValue: http }],
    }).get(InventoryService);
  }

  it('loads inventory from the API and converts decimal fields', async () => {
    const service = createService({ get: jest.fn().mockReturnValue(of([{ ...item, selling_price: '50.00' }])) });
    await service.load();
    expect(service.items()[0].selling_price).toBe(50);
  });

  it('persists new items before updating its signal state', async () => {
    const post = jest.fn().mockReturnValue(of({ ...item, id: 2, code: '111' }));
    const service = createService({ post });
    await service.addItem({ ...item, code: '111' });
    expect(post).toHaveBeenCalledWith(`${API_BASE_URL}/items`, expect.objectContaining({
      code: '111',
      stock_qty: 0,
    }));
    expect(service.items()[0].id).toBe(2);
  });

  it('does not send stock changes when updating an item', async () => {
    const put = jest.fn().mockReturnValue(of({ ...item, stock_qty: 120 }));
    const service = createService({ put });
    service.replaceItems([item]);
    await service.updateItem(1, { ...item, stock_qty: 0, name: 'Updated PVC Pipe' });
    expect(put).toHaveBeenCalledWith(`${API_BASE_URL}/items/1`, expect.not.objectContaining({
      stock_qty: expect.anything(),
    }));
    expect(service.items()[0].stock_qty).toBe(120);
  });

  it('rejects duplicate item codes using loaded server state', async () => {
    const service = createService({ post: jest.fn() });
    service.replaceItems([item]);
    await expect(service.addItem({ ...item })).rejects.toThrow('already exists');
  });

  it('applies stock adjustments through the API', async () => {
    const patch = jest.fn().mockReturnValue(of({ ...item, stock_qty: 110 }));
    const service = createService({ patch });
    service.replaceItems([item]);
    await service.adjustStock(1, -10);
    expect(patch).toHaveBeenCalledWith(`${API_BASE_URL}/items/1/stock`, { quantity: -10 });
    expect(service.items()[0].stock_qty).toBe(110);
  });
});
