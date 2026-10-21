import { VendorService } from './vendor.service';

describe('VendorService', () => {
  let service: VendorService;

  beforeEach(() => {
    service = new VendorService();
  });

  it('should add a valid vendor', () => {
    const vendor = service.add({ name: 'George', company_name: 'Geo Supply', phone: '9999999999', email: 'geo@test.com', address: 'Kochi', gstin: '32ABC' });
    expect(vendor.company_name).toBe('Geo Supply');
  });

  it('should reject duplicate vendor phone numbers', () => {
    service.add({ name: 'George', company_name: 'Geo Supply', phone: '9999999999' });
    expect(() => service.add({ name: 'Other', company_name: 'Other', phone: '9999999999' })).toThrow();
  });

  it('should find vendor by phone and id', () => {
    const vendor = service.add({ name: 'George', company_name: 'Geo Supply', phone: '8888888888' });
    expect(service.findByPhone('8888888888')?.id).toBe(vendor.id);
    expect(service.findById(vendor.id)?.name).toBe('George');
  });
});
