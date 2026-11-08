import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { CompanyProfileService } from './company-profile.service';

describe('CompanyProfileService', () => {
  function createService(http: object): CompanyProfileService {
    return Injector.create({
      providers: [CompanyProfileService, { provide: HttpClient, useValue: http }],
    }).get(CompanyProfileService);
  }

  it('loads active company branding from the API', async () => {
    const get = jest.fn().mockReturnValue(of({
      store_name: 'Metro Hardware',
      short_name: 'M',
      tagline: 'Tools and supplies',
      phone_primary: '9876543210',
      address_line1: '24 Market Road',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682001',
      gstin: '',
      terms_and_conditions: '',
      email: '',
      website: '',
      footer_note: '',
    }));
    const service = createService({ get });

    await service.load();

    expect(get).toHaveBeenCalledWith(`${API_BASE_URL}/company-profile`);
    expect(service.profile().store_name).toBe('Metro Hardware');
    expect(service.profile().address).toBe('24 Market Road, Kochi, Kerala, 682001');
  });

  it('persists changed profile fields', async () => {
    jest.useFakeTimers();
    const patch = jest.fn().mockReturnValue(of({}));
    const service = createService({ patch });

    service.update({ store_name: 'Metro Hardware' });
    await jest.advanceTimersByTimeAsync(350);

    expect(patch).toHaveBeenCalledWith(`${API_BASE_URL}/company-profile`, { store_name: 'Metro Hardware' });
    expect(service.profile().store_name).toBe('Metro Hardware');
    jest.useRealTimers();
  });
});
