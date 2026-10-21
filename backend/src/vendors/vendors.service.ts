import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.vendor.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: number) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} was not found.`);
    }
    return vendor;
  }

  create(dto: Prisma.VendorCreateInput) {
    return this.prisma.vendor.create({ data: dto });
  }

  async update(id: number, dto: Prisma.VendorUpdateInput) {
    await this.findOne(id);
    return this.prisma.vendor.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.vendor.delete({ where: { id } });
  }
}
