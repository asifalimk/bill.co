import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompanyProfileService } from '../../core/services/company-profile.service';
import { CompanyProfile } from '../../core/models';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="panel settings-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">STORE SETTINGS</p>
          <h2>Company profile</h2>
        </div>
        <div class="brand-preview">
          <span class="brand-mark small">{{ initials() }}</span>
          <div>
            <strong>{{ profile().store_name }}</strong>
            <small>{{ profile().tagline }}</small>
          </div>
        </div>
      </div>
      <form class="form-grid settings-form" (ngSubmit)="$event.preventDefault()">
        <label>Store name<input [ngModel]="profile().store_name" (ngModelChange)="updateField('store_name', $event)" name="store_name"></label>
        <label>Short brand<input [ngModel]="profile().short_name" (ngModelChange)="updateField('short_name', $event)" name="short_name" maxlength="2"></label>
        <label>Tagline<input [ngModel]="profile().tagline" (ngModelChange)="updateField('tagline', $event)" name="tagline"></label>
        <label>Phone<input [ngModel]="profile().phone" (ngModelChange)="updateField('phone', $event)" name="phone"></label>
        <label>Email<input [ngModel]="profile().email" (ngModelChange)="updateField('email', $event)" name="email"></label>
        <label>Website<input [ngModel]="profile().website" (ngModelChange)="updateField('website', $event)" name="website"></label>
        <label class="full-span">Address<textarea [ngModel]="profile().address" (ngModelChange)="updateField('address', $event)" name="address" rows="3"></textarea></label>
        <label>GSTIN<input [ngModel]="profile().gstin" (ngModelChange)="updateField('gstin', $event)" name="gstin"></label>
        <label class="full-span">Footer note<input [ngModel]="profile().footer_note" (ngModelChange)="updateField('footer_note', $event)" name="footer_note"></label>
        <label class="full-span">Terms & conditions<textarea [ngModel]="profile().terms" (ngModelChange)="updateField('terms', $event)" name="terms" rows="3"></textarea></label>
      </form>
    </section>
  `
})
export class CompanyProfileComponent {
  readonly companyProfileService = inject(CompanyProfileService);
  readonly profile = this.companyProfileService.profile;
  readonly initials = computed(() => {
    const name = this.profile().store_name || 'HARDWARE';
    return (name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0] ?? '').join('') || 'H').toUpperCase();
  });

  updateField(field: keyof CompanyProfile, value: string): void {
    this.companyProfileService.update({ [field]: value } as Partial<CompanyProfile>);
  }
}
