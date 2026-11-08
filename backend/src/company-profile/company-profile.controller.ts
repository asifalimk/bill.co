import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CompanyProfileService, CompanyProfileUpdate } from './company-profile.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/company-profile')
@Roles(UserRole.ADMIN, UserRole.CASHIER)
export class CompanyProfileController {
  constructor(private readonly companyProfileService: CompanyProfileService) {}

  @Get()
  findOne() {
    return this.companyProfileService.findOne();
  }

  @Patch()
  @Roles(UserRole.ADMIN)
  update(@Body() dto: CompanyProfileUpdate) {
    return this.companyProfileService.update(dto);
  }
}
