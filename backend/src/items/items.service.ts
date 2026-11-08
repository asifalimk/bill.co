import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.item.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findByCode(code: string) {
    const item = await this.prisma.item.findUnique({ where: { code } });
    if (!item) {
      throw new NotFoundException(`Item with code ${code} was not found.`);
    }
    return item;
  }

  async findOne(id: number) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item ${id} was not found.`);
    }
    return item;
  }

  create(dto: Prisma.ItemCreateInput) {
    this.validateItem(dto);
    return this.prisma.item.create({ data: { ...dto, stock_qty: 0 } });
  }

  async update(id: number, dto: Prisma.ItemUpdateInput) {
    await this.findOne(id);
    this.validateItem(dto);
    const { stock_qty: _stockQty, ...itemDetails } = dto;
    void _stockQty;
    return this.prisma.item.update({ where: { id }, data: itemDetails });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.item.delete({ where: { id } });
  }

  async adjustStock(id: number, quantity: number) {
    const item = await this.findOne(id);
    if (!Number.isInteger(quantity) || quantity === 0) {
      throw new BadRequestException('Stock adjustment must be a non-zero whole number.');
    }
    if (quantity < 0) {
      const updated = await this.prisma.item.updateMany({
        where: { id, stock_qty: { gte: Math.abs(quantity) } },
        data: { stock_qty: { decrement: Math.abs(quantity) } },
      });
      if (!updated.count) throw new BadRequestException(`Insufficient stock for ${item.name}.`);
      return this.findOne(id);
    }
    return this.prisma.item.update({
      where: { id },
      data: { stock_qty: { increment: quantity } },
    });
  }

  private validateItem(item: Prisma.ItemCreateInput | Prisma.ItemUpdateInput): void {
    const code = typeof item.code === 'string' ? item.code : undefined;
    if (code !== undefined && !/^\d{3}$/.test(code)) {
      throw new BadRequestException('Item code must contain exactly three digits.');
    }
  }
}
