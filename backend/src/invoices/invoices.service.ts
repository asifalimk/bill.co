import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(startDate?: string, endDate?: string) {
    const filters: any = {};
    if (startDate || endDate) {
      filters.created_at = { gte: startDate ? new Date(startDate) : undefined, lte: endDate ? new Date(endDate) : undefined };
    }
    return this.prisma.invoice.findMany({
      where: filters,
      include: { items: true, customer: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} was not found.`);
    }
    return invoice;
  }

  async checkout(body: {
    invoice_no: string;
    customer_id?: number;
    site_note?: string;
    payment_type: 'CASH' | 'CREDIT';
    items: Array<{ item_id: number; quantity: number; line_discount?: number; selling_price?: number }>;
  }) {
    return this.prisma.$transaction(async (tx) => {
      if (body.customer_id) {
        const customer = await tx.customer.findUnique({ where: { id: body.customer_id } });
        if (!customer) {
          throw new NotFoundException(`Customer ${body.customer_id} was not found.`);
        }
      }

      const preparedItems: Array<{ item: any; quantity: number; line_discount: number; selling_price: number }> = [];
      let grossAmount = 0;
      let totalCost = 0;
      let totalDiscounts = 0;

      for (const entry of body.items) {
        const item = await tx.item.findUnique({ where: { id: entry.item_id } });
        if (!item) {
          throw new NotFoundException(`Item ${entry.item_id} was not found.`);
        }
        if (item.stock_qty < entry.quantity) {
          throw new Error(`Insufficient stock for item ${item.name}.`);
        }

        const lineDiscount = entry.line_discount ?? 0;
        const sellingPrice = entry.selling_price ?? item.selling_price;
        const lineTotal = entry.quantity * sellingPrice - lineDiscount;
        const netProfit = lineTotal - (entry.quantity * item.purchase_price);

        preparedItems.push({ item, quantity: entry.quantity, line_discount: lineDiscount, selling_price: sellingPrice });
        grossAmount += entry.quantity * sellingPrice;
        totalCost += entry.quantity * item.purchase_price;
        totalDiscounts += lineDiscount;

        await tx.item.update({
          where: { id: item.id },
          data: { stock_qty: item.stock_qty - entry.quantity },
        });

        if (body.customer_id && body.payment_type === 'CREDIT') {
          await tx.customer.update({
            where: { id: body.customer_id },
            data: { credit_balance: { increment: lineTotal } },
          });
        }
      }

      const netAmount = Math.max(0, grossAmount - totalDiscounts);
      const netProfit = netAmount - totalCost;

      const invoice = await tx.invoice.create({
        data: {
          invoice_no: body.invoice_no,
          customer_id: body.customer_id ?? null,
          payment_type: body.payment_type,
          site_note: body.site_note ?? null,
          gross_amount: grossAmount,
          total_discounts: totalDiscounts,
          total_cost: totalCost,
          net_amount: netAmount,
          net_profit: netProfit,
          items: {
            create: preparedItems.map((entry) => ({
              item_id: entry.item.id,
              code: entry.item.code,
              name: entry.item.name,
              unit: entry.item.unit,
              quantity: entry.quantity,
              purchase_price: entry.item.purchase_price,
              selling_price: entry.selling_price,
              line_discount: entry.line_discount,
              line_total: entry.quantity * entry.selling_price - entry.line_discount,
              line_net_profit: (entry.quantity * entry.selling_price - entry.line_discount) - (entry.quantity * entry.item.purchase_price),
            })),
          },
        },
        include: { items: true, customer: true },
      });

      return invoice;
    });
  }
}
