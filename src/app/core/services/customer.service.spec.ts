import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Customer } from '../models';
import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  function createService(http: object): CustomerService {
    return Injector.create({
      providers: [CustomerService, { provide: HttpClient, useValue: http }],
    }).get(CustomerService);
  }

  const customer: Customer = {
    id: 1,
    name: 'Alice',
    phone: '9876543210',
    credit_balance: 0,
    created_at: new Date().toISOString(),
  };

  it('creates customers through the API and updates its signal state', async () => {
    const post = jest.fn().mockReturnValue(of(customer));
    const service = createService({ post });
    const created = await service.add({ name: 'Alice', phone: '9876543210' });
    expect(created.id).toBe(1);
    expect(service.customerCount()).toBe(1);
    expect(post).toHaveBeenCalledWith(`${API_BASE_URL}/customers`, expect.objectContaining({ name: 'Alice' }));
  });

  it('rejects invalid and duplicate phone numbers', async () => {
    const service = createService({ post: jest.fn() });
    service.customers.set([customer]);
    await expect(service.add({ name: 'Bob', phone: '123' })).rejects.toThrow('valid 7–15 digit');
    await expect(service.add({ name: 'Bob', phone: customer.phone })).rejects.toThrow('already exists');
  });

  it('updates customer credit from the API response', async () => {
    const patch = jest.fn().mockReturnValue(of({ ...customer, credit_balance: '300.00' }));
    const service = createService({ patch });
    service.customers.set([customer]);
    await service.adjustCreditBalance(customer.id, 300);
    expect(patch).toHaveBeenCalledWith(`${API_BASE_URL}/customers/1/credit`, { amount: 300 });
    expect(service.findById(1)?.credit_balance).toBe(300);
  });
});
