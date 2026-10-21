import { CompanyProfileService } from './company-profile.service';

describe('CompanyProfileService', () => {
  let service: CompanyProfileService;

  beforeEach(() => {
    service = new CompanyProfileService();
  });

  it('should expose default profile values', () => {
    expect(service.profile().store_name).toBe('HARDWARE COUNTER');
    expect(service.profile().phone).toBe('98765 43210');
  });

  it('should update profile fields while preserving existing values', () => {
    service.update({ store_name: 'Metro Hardware', gstin: '32NEW1234F1Z5' });
    expect(service.profile().store_name).toBe('Metro Hardware');
    expect(service.profile().gstin).toBe('32NEW1234F1Z5');
  });
});
