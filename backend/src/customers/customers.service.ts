import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    if (!Number.isFinite(amount)) {
      throw new BadRequestException('Credit adjustment must be a valid number.');
    }
    await this.findOne(id);
    if (amount < 0) {
      const updated = await this.prisma.customer.updateMany({
        where: { id, credit_balance: { gte: Math.abs(amount) } },
        data: { credit_balance: { decrement: Math.abs(amount) } },
      });
      if (!updated.count) throw new BadRequestException('Credit balance cannot be negative.');
      return this.findOne(id);
    }
    return this.prisma.customer.update({ where: { id }, data: { credit_balance: { increment: amount } } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
