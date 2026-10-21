import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} was not found.`);
    }
    return customer;
  }

  create(dto: Prisma.CustomerCreateInput) {
    return this.prisma.customer.create({ data: dto });
  }

  async update(id: number, dto: Prisma.CustomerUpdateInput) {
    await this.findOne(id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async adjustCredit(id: number, amount: number) {
    const customer = await this.findOne(id);
    const updated = await this.prisma.customer.update({
      where: { id },
      data: { credit_balance: customer.credit_balance + amount },
    });
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
