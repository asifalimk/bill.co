import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type CompanyProfileUpdate = Partial<Pick<
  Prisma.CompanyProfileCreateInput,
  | 'store_name'
  | 'tagline'
  | 'phone_primary'
  | 'address_line1'
  | 'city'
  | 'state'
  | 'pincode'
  | 'gstin'
  | 'terms_and_conditions'
  | 'short_name'
  | 'email'
  | 'website'
  | 'footer_note'
>>;

@Injectable()
export class CompanyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne() {
    return this.prisma.companyProfile.upsert({
      where: { id: 1 },
      create: this.defaults(),
      update: {},
    });
  }

  async update(dto: CompanyProfileUpdate) {
    return this.prisma.companyProfile.upsert({
      where: { id: 1 },
      create: { ...this.defaults(), ...dto },
      update: dto,
    });
  }

  private defaults(): Prisma.CompanyProfileCreateInput {
    return {
      store_name: 'HARDWARE COUNTER',
      short_name: 'H',
      tagline: 'Retail hardware & supplies',
      phone_primary: '98765 43210',
      address_line1: '24 Market Road',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682001',
      gstin: '',
      terms_and_conditions: 'Goods once sold are not returnable unless damaged.',
      email: '',
      website: '',
      footer_note: 'Thank you for your business!',
    };
  }
}
