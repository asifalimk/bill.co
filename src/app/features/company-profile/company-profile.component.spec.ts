import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyProfileComponent } from './company-profile.component';
import { CompanyProfileService } from '../../core/services/company-profile.service';

describe('CompanyProfileComponent', () => {
  let fixture: ComponentFixture<CompanyProfileComponent>;
  let component: CompanyProfileComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyProfileComponent],
      providers: [CompanyProfileService]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should build initials from the store name', () => {
    expect(component.initials()).toBe('HC');
  });

  it('should update profile fields through the service', () => {
    component.updateField('store_name', 'New Hardware');
    expect(component.profile().store_name).toBe('New Hardware');
  });
});
