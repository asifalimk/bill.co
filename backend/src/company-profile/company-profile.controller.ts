import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CompanyProfileService } from './company-profile.service';

@Controller('api/company-profile')
export class CompanyProfileController {
  constructor(private readonly companyProfileService: CompanyProfileService) {}

  @Get()
  findOne() {
    return this.companyProfileService.findOne();
  }

  @Patch()
  update(@Body() dto: Partial<{ store_name: string; tagline: string; phone_primary: string; address_line1: string; city: string; state: string; pincode: string; gstin: string; terms_and_conditions: string }>) {
    return this.companyProfileService.update(dto);
  }
}
