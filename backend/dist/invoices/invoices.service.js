"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(startDate, endDate) {
        const filters = {};
        if (startDate || endDate) {
            filters.created_at = { gte: startDate ? new Date(startDate) : undefined, lte: endDate ? new Date(endDate) : undefined };
        }
        return this.prisma.invoice.findMany({
            where: filters,
            include: { items: true, customer: true },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { items: true, customer: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice ${id} was not found.`);
        }
        return invoice;
    }
    async checkout(body) {
        return this.prisma.$transaction(async (tx) => {
            if (body.customer_id) {
                const customer = await tx.customer.findUnique({ where: { id: body.customer_id } });
                if (!customer) {
                    throw new common_1.NotFoundException(`Customer ${body.customer_id} was not found.`);
                }
            }
            const preparedItems = [];
            let grossAmount = 0;
            let totalCost = 0;
            let totalDiscounts = 0;
            for (const entry of body.items) {
                const item = await tx.item.findUnique({ where: { id: entry.item_id } });
                if (!item) {
                    throw new common_1.NotFoundException(`Item ${entry.item_id} was not found.`);
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
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map