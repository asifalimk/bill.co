import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne() {
    const profile = await this.prisma.companyProfile.findFirst();
    if (!profile) {
      throw new NotFoundException('Company profile not found.');
    }
    return profile;
  }

  async update(dto: Record<string, any>) {
    const existing = await this.prisma.companyProfile.findFirst();
    if (!existing) {
      return this.prisma.companyProfile.create({
        data: {
          store_name: dto.store_name ?? 'HARDWARE COUNTER',
          tagline: dto.tagline ?? 'Retail hardware & supplies',
          phone_primary: dto.phone_primary ?? '98765 43210',
          address_line1: dto.address_line1 ?? '24 Market Road',
          city: dto.city ?? 'Kochi',
          state: dto.state ?? 'Kerala',
          pincode: dto.pincode ?? '682001',
          gstin: dto.gstin ?? '32ABCDE1234F1Z5',
          terms_and_conditions: dto.terms_and_conditions ?? 'Goods once sold are not returnable unless damaged.',
        },
      });
    }

    return this.prisma.companyProfile.update({
      where: { id: existing.id },
      data: dto,
    });
  }
}
