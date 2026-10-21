import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationPipe } from '../translation.service';
import { CompanyProfileService } from '../company-profile.service';
import { CompanyProfile } from '../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {
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
