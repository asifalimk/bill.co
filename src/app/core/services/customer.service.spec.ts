import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    service = new CustomerService();
  });

  it('should add a customer with valid data', () => {
    const customer = service.add({ name: 'Alice', phone: '9876543210', address: 'Kochi', gstin: '32ABC' });
    expect(customer.phone).toBe('9876543210');
    expect(service.customerCount()).toBe(1);
  });

  it('should reject duplicate phone numbers', () => {
    service.add({ name: 'Alice', phone: '9876543210' });
    expect(() => service.add({ name: 'Bob', phone: '9876543210' })).toThrow();
  });

  it('should update credit balance within valid range', () => {
    const customer = service.add({ name: 'Alice', phone: '9876543210' });
    service.adjustCreditBalance(customer.id, 300);
    expect(service.findById(customer.id)?.credit_balance).toBe(300);
  });

  it('should reject negative credit balances', () => {
    const customer = service.add({ name: 'Alice', phone: '9876543210' });
    expect(() => service.adjustCreditBalance(customer.id, -1)).toThrow();
  });
});
