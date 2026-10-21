import { Injectable, NotFoundException } from '@nestjs/common';
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
    notes?: string;
    lines: Array<{ item_id: number; quantity: number; unit_cost: number; selling_price: number }>;
  }) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: body.vendor_id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor ${body.vendor_id} was not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          vendor_id: body.vendor_id,
          invoice_no: body.invoice_no,
          notes: body.notes,
        },
      });

      for (const line of body.lines) {
        const item = await tx.item.findUnique({ where: { id: line.item_id } });
        if (!item) {
          throw new NotFoundException(`Item ${line.item_id} was not found.`);
        }

        await tx.item.update({
          where: { id: line.item_id },
          data: {
            stock_qty: item.stock_qty + line.quantity,
            purchase_price: line.unit_cost,
            selling_price: line.selling_price,
          },
        });

        await tx.purchaseLine.create({
          data: {
            purchase_id: purchase.id,
            item_id: line.item_id,
            quantity: line.quantity,
            unit_cost: line.unit_cost,
            selling_price: line.selling_price,
          },
        });
      }

      return tx.purchase.findUnique({
        where: { id: purchase.id },
        include: { lines: true, vendor: true },
      });
    });
  }
}
