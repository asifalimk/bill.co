import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.prisma.item.create({ data: dto });
  }

  async update(id: number, dto: Prisma.ItemUpdateInput) {
    await this.findOne(id);
    return this.prisma.item.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.item.delete({ where: { id } });
  }
}
