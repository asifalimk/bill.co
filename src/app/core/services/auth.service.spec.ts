import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  it('should login admin with valid credentials', () => {
    expect(service.login('admin', 'admin123', '1234')).toBe(true);
    expect(service.isAdmin()).toBe(true);
  });

  it('should login cashier with valid pin', () => {
    expect(service.login('cashier', 'x', '1234')).toBe(true);
    expect(service.isAdmin()).toBe(false);
  });

  it('should reject invalid credentials', () => {
    expect(service.login('cashier', 'x', '9999')).toBe(false);
  });

  it('should clear user on logout', () => {
    service.login('admin', 'admin123', '');
    service.logout();
    expect(service.user()).toBeNull();
  });
});
