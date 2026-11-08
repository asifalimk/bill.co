import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { VendorService } from './vendor.service';

describe('VendorService', () => {
  function createService(http: object): VendorService {
    return Injector.create({
      providers: [VendorService, { provide: HttpClient, useValue: http }],
    }).get(VendorService);
  }

  it('persists vendor changes through the API', async () => {
    const vendor = {
      id: 1,
      name: 'George',
      company_name: 'Geo Supply',
      phone: '9999999999',
      created_at: new Date().toISOString(),
    };
    const post = jest.fn().mockReturnValue(of(vendor));
    const service = createService({ post });
    const created = await service.add(vendor);
    expect(created.company_name).toBe('Geo Supply');
    expect(service.findByPhone(vendor.phone)?.id).toBe(1);
    expect(post).toHaveBeenCalledWith(`${API_BASE_URL}/vendors`, expect.objectContaining({ name: 'George' }));
  });

  it('rejects duplicate phone numbers from loaded state', async () => {
    const service = createService({ post: jest.fn() });
    service.vendors.set([{
      id: 1,
      name: 'George',
      company_name: 'Geo Supply',
      phone: '9999999999',
      created_at: new Date().toISOString(),
    }]);
    await expect(service.add({ name: 'Other', company_name: 'Other', phone: '9999999999' }))
      .rejects.toThrow('already exists');
  });
});
