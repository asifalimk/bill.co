import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CheckoutBody = {
  invoice_no: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_gstin?: string;
  site_note?: string;
  bill_discount?: number;
  payment_type: PaymentType;
  items: Array<{ item_id: number; quantity: number; line_discount?: number }>;
};

const money = (amount: number) => new Prisma.Decimal(amount.toFixed(2));

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(startDate?: string, endDate?: string, paymentType?: PaymentType) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (startDate) {
      const start = new Date(startDate);
      if (Number.isNaN(start.getTime())) throw new BadRequestException('Invalid startDate.');
      createdAt.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (Number.isNaN(end.getTime())) throw new BadRequestException('Invalid endDate.');
      if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }

    return this.prisma.invoice.findMany({
      where: {
        ...(startDate || endDate ? { created_at: createdAt } : {}),
        ...(paymentType ? { payment_type: paymentType } : {}),
      },
      include: { items: true, customer: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} was not found.`);
    return invoice;
  }

  checkout(body: CheckoutBody, cashierName: string) {
    if (body.payment_type === PaymentType.CREDIT && body.customer_id === undefined) {
      throw new BadRequestException('Credit sales require a customer record.');
    }

    return this.prisma.$transaction(async (tx) => {
      const customer = body.customer_id === undefined
        ? null
        : await tx.customer.findUnique({ where: { id: body.customer_id } });
      if (body.customer_id !== undefined && !customer) {
        throw new NotFoundException(`Customer ${body.customer_id} was not found.`);
      }

      const entries = new Map<number, { quantity: number; discount: number }>();
      for (const row of body.items) {
        if (!Number.isInteger(row.quantity) || row.quantity <= 0 ||
            !Number.isFinite(row.line_discount ?? 0) || (row.line_discount ?? 0) < 0) {
          throw new BadRequestException('Invoice item quantities and discounts must be valid.');
        }
        const current = entries.get(row.item_id) ?? { quantity: 0, discount: 0 };
        current.quantity += row.quantity;
        current.discount += row.line_discount ?? 0;
        entries.set(row.item_id, current);
      }

      const prepared: Array<{
        item: { id: number; code: string; name: string; category: string; unit: string; purchase_price: Prisma.Decimal; selling_price: Prisma.Decimal };
        quantity: number;
        discount: number;
        lineTotal: number;
      }> = [];
      let grossAmount = 0;
      let totalCost = 0;
      let lineDiscounts = 0;

      for (const [itemId, entry] of entries) {
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) throw new NotFoundException(`Item ${itemId} was not found.`);
        const stockUpdate = await tx.item.updateMany({
          where: { id: itemId, stock_qty: { gte: entry.quantity } },
          data: { stock_qty: { decrement: entry.quantity } },
        });
        if (!stockUpdate.count) {
          throw new BadRequestException(`Insufficient stock for item ${item.name}.`);
        }

        const sellingPrice = Number(item.selling_price);
        const purchasePrice = Number(item.purchase_price);
        const lineGross = entry.quantity * sellingPrice;
        const discount = Math.min(entry.discount, lineGross);
        const lineTotal = Math.max(0, lineGross - discount);
        prepared.push({ item, quantity: entry.quantity, discount, lineTotal });
        grossAmount += lineGross;
        totalCost += entry.quantity * purchasePrice;
        lineDiscounts += discount;
      }

      const billDiscount = Math.min(body.bill_discount ?? 0, Math.max(0, grossAmount - lineDiscounts));
      const totalDiscounts = lineDiscounts + billDiscount;
      const netAmount = Math.max(0, grossAmount - totalDiscounts);
      const netProfit = netAmount - totalCost;

      if (customer && body.payment_type === PaymentType.CREDIT) {
        await tx.customer.update({
          where: { id: customer.id },
          data: { credit_balance: { increment: money(netAmount) } },
        });
      }

      return tx.invoice.create({
        data: {
          invoice_no: body.invoice_no,
          customer_id: customer?.id ?? null,
          customer_name: body.customer_name?.trim() || customer?.name || '',
          customer_phone: body.customer_phone?.trim() || customer?.phone || '',
          customer_gstin: body.customer_gstin?.trim() || customer?.gstin || null,
          cashier_name: cashierName,
          payment_type: body.payment_type,
          site_note: body.site_note ?? null,
          gross_amount: money(grossAmount),
          bill_discount: money(billDiscount),
          total_discounts: money(totalDiscounts),
          total_cost: money(totalCost),
          net_amount: money(netAmount),
          net_profit: money(netProfit),
          items: {
            create: prepared.map(({ item, quantity, discount, lineTotal }) => ({
              item_id: item.id,
              code: item.code,
              name: item.name,
              category: item.category,
              unit: item.unit,
              quantity,
              purchase_price: item.purchase_price,
              selling_price: item.selling_price,
              line_discount: money(discount),
              line_total: money(lineTotal),
              line_net_profit: money(lineTotal - quantity * Number(item.purchase_price)),
            })),
          },
        },
        include: { items: true, customer: true },
      });
    });
  }

  updateInvoice(id: number, body: CheckoutBody, cashierName: string) {
    if (body.payment_type === PaymentType.CREDIT && body.customer_id === undefined) {
      throw new BadRequestException('Credit sales require a customer record.');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) throw new NotFoundException(`Invoice ${id} was not found.`);
      const customer = body.customer_id === undefined
        ? null
        : await tx.customer.findUnique({ where: { id: body.customer_id } });
      if (body.customer_id !== undefined && !customer) {
        throw new NotFoundException(`Customer ${body.customer_id} was not found.`);
      }

      const quantities = new Map<number, { quantity: number; discount: number }>();
      for (const row of body.items) {
        if (!Number.isInteger(row.quantity) || row.quantity <= 0 ||
            !Number.isFinite(row.line_discount ?? 0) || (row.line_discount ?? 0) < 0) {
          throw new BadRequestException('Invoice item quantities and discounts must be valid.');
        }
        const entry = quantities.get(row.item_id) ?? { quantity: 0, discount: 0 };
        entry.quantity += row.quantity;
        entry.discount += row.line_discount ?? 0;
        quantities.set(row.item_id, entry);
      }

      const oldQuantities = new Map<number, number>();
      existing.items.forEach(line => oldQuantities.set(line.item_id, (oldQuantities.get(line.item_id) ?? 0) + line.quantity));
      const itemIds = new Set([...quantities.keys(), ...oldQuantities.keys()]);
      const prepared: Array<{
        item: { id: number; code: string; name: string; category: string; unit: string; purchase_price: Prisma.Decimal; selling_price: Prisma.Decimal };
        quantity: number;
        discount: number;
        lineTotal: number;
      }> = [];
      let grossAmount = 0;
      let totalCost = 0;
      let lineDiscounts = 0;

      for (const itemId of itemIds) {
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) throw new NotFoundException(`Item ${itemId} was not found.`);
        const quantity = quantities.get(itemId)?.quantity ?? 0;
        const delta = quantity - (oldQuantities.get(itemId) ?? 0);
        if (delta > 0) {
          const changed = await tx.item.updateMany({
            where: { id: itemId, stock_qty: { gte: delta } },
            data: { stock_qty: { decrement: delta } },
          });
          if (!changed.count) throw new BadRequestException(`Insufficient stock for item ${item.name}.`);
        } else if (delta < 0) {
          await tx.item.update({ where: { id: itemId }, data: { stock_qty: { increment: -delta } } });
        }
        if (!quantity) continue;
        const entry = quantities.get(itemId)!;
        const lineGross = quantity * Number(item.selling_price);
        const discount = Math.min(entry.discount, lineGross);
        const lineTotal = Math.max(0, lineGross - discount);
        prepared.push({ item, quantity, discount, lineTotal });
        grossAmount += lineGross;
        totalCost += quantity * Number(item.purchase_price);
        lineDiscounts += discount;
      }

      const billDiscount = Math.min(body.bill_discount ?? 0, Math.max(0, grossAmount - lineDiscounts));
      const totalDiscounts = lineDiscounts + billDiscount;
      const netAmount = Math.max(0, grossAmount - totalDiscounts);
      const netProfit = netAmount - totalCost;
      const previousCreditCustomerId = existing.payment_type === PaymentType.CREDIT
        ? existing.customer_id
        : null;
      const nextCreditCustomerId = body.payment_type === PaymentType.CREDIT ? customer?.id ?? null : null;
      if (previousCreditCustomerId !== null && previousCreditCustomerId === nextCreditCustomerId) {
        const creditDelta = money(netAmount).sub(existing.net_amount);
        if (creditDelta.greaterThan(0)) {
          await tx.customer.update({
            where: { id: previousCreditCustomerId },
            data: { credit_balance: { increment: creditDelta } },
          });
        } else if (creditDelta.lessThan(0)) {
          const reduced = await tx.customer.updateMany({
            where: { id: previousCreditCustomerId, credit_balance: { gte: creditDelta.abs() } },
            data: { credit_balance: { decrement: creditDelta.abs() } },
          });
          if (!reduced.count) throw new BadRequestException('Invoice edit would make the customer credit balance negative.');
        }
      } else {
        if (previousCreditCustomerId !== null) {
          const reduced = await tx.customer.updateMany({
            where: { id: previousCreditCustomerId, credit_balance: { gte: existing.net_amount } },
            data: { credit_balance: { decrement: existing.net_amount } },
          });
          if (!reduced.count) throw new BadRequestException('Unable to reverse the previous invoice credit balance.');
        }
        if (nextCreditCustomerId !== null && customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: { credit_balance: { increment: money(netAmount) } },
          });
        }
      }

      await tx.invoiceItem.deleteMany({ where: { invoice_id: id } });
      return tx.invoice.update({
        where: { id },
        data: {
          customer_id: customer?.id ?? null,
          customer_name: body.customer_name?.trim() || customer?.name || '',
          customer_phone: body.customer_phone?.trim() || customer?.phone || '',
          customer_gstin: body.customer_gstin?.trim() || customer?.gstin || null,
          cashier_name: cashierName,
          payment_type: body.payment_type,
          site_note: body.site_note ?? null,
          gross_amount: money(grossAmount),
          bill_discount: money(billDiscount),
          total_discounts: money(totalDiscounts),
          total_cost: money(totalCost),
          net_amount: money(netAmount),
          net_profit: money(netProfit),
          is_edited: true,
          edited_at: new Date(),
          items: {
            create: prepared.map(({ item, quantity, discount, lineTotal }) => ({
              item_id: item.id,
              code: item.code,
              name: item.name,
              category: item.category,
              unit: item.unit,
              quantity,
              purchase_price: item.purchase_price,
              selling_price: item.selling_price,
              line_discount: money(discount),
              line_total: money(lineTotal),
              line_net_profit: money(lineTotal - quantity * Number(item.purchase_price)),
            })),
          },
        },
        include: { items: true, customer: true },
      });
    });
  }
}
