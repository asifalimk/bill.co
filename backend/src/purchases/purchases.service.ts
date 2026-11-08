import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(vendorId?: number) {
    return this.prisma.purchase.findMany({
      where: vendorId ? { vendor_id: vendorId } : undefined,
      include: { lines: true, vendor: true },
      orderBy: { purchase_date: 'desc' },
    });
  }

  async findOne(id: number) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: { lines: true, vendor: true },
    });
    if (!purchase) {
      throw new NotFoundException(`Purchase ${id} was not found.`);
    }
    return purchase;
  }

  async create(body: {
    vendor_id: number;
    invoice_no: string;
    purchase_date?: string;
    notes?: string;
    lines: Array<{ item_id: number; quantity: number; unit_cost: number; selling_price: number }>;
  }) {
    if (!body.invoice_no.trim() || !body.lines.length) {
      throw new BadRequestException('A vendor invoice number and at least one purchase item are required.');
    }

    return this.prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({ where: { id: body.vendor_id } });
      if (!vendor) throw new NotFoundException(`Vendor ${body.vendor_id} was not found.`);
      const purchaseDate = body.purchase_date ? new Date(body.purchase_date) : new Date();
      if (Number.isNaN(purchaseDate.getTime())) throw new BadRequestException('Invalid purchase date.');
      const purchase = await tx.purchase.create({
        data: {
          vendor_id: body.vendor_id,
          invoice_no: body.invoice_no,
          notes: body.notes,
          purchase_date: purchaseDate,
        },
      });

      let totalAmount = new Prisma.Decimal(0);
      for (const line of body.lines) {
        if (!Number.isInteger(line.quantity) || line.quantity <= 0 ||
            !Number.isFinite(line.unit_cost) || line.unit_cost < 0 ||
            !Number.isFinite(line.selling_price) || line.selling_price < 0) {
          throw new BadRequestException('Purchase quantities and prices must be valid.');
        }

        const item = await tx.item.findUnique({ where: { id: line.item_id } });
        if (!item) throw new NotFoundException(`Item ${line.item_id} was not found.`);
        await tx.item.update({
          where: { id: line.item_id },
          data: {
            stock_qty: { increment: line.quantity },
            purchase_price: new Prisma.Decimal(line.unit_cost),
            selling_price: new Prisma.Decimal(line.selling_price),
          },
        });

        await tx.purchaseItem.create({
          data: {
            purchase_id: purchase.id,
            item_id: line.item_id,
            quantity: line.quantity,
            unit_cost: new Prisma.Decimal(line.unit_cost),
            selling_price: new Prisma.Decimal(line.selling_price),
            line_total: new Prisma.Decimal(line.unit_cost).mul(line.quantity),
          },
        });
        totalAmount = totalAmount.add(new Prisma.Decimal(line.unit_cost).mul(line.quantity));
      }

      await tx.purchase.update({ where: { id: purchase.id }, data: { total_amount: totalAmount } });
      return tx.purchase.findUnique({
        where: { id: purchase.id },
        include: { lines: true, vendor: true },
      });
    });
  }
}
