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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let PurchasesService = class PurchasesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(vendorId) {
        return this.prisma.purchase.findMany({
            where: vendorId ? { vendor_id: vendorId } : undefined,
            include: { lines: true, vendor: true },
            orderBy: { purchase_date: 'desc' },
        });
    }
    async findOne(id) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: { lines: true, vendor: true },
        });
        if (!purchase) {
            throw new common_1.NotFoundException(`Purchase ${id} was not found.`);
        }
        return purchase;
    }
    async create(body) {
        if (!body.invoice_no.trim() || !body.lines.length) {
            throw new common_1.BadRequestException('A vendor invoice number and at least one purchase item are required.');
        }
        return this.prisma.$transaction(async (tx) => {
            const vendor = await tx.vendor.findUnique({ where: { id: body.vendor_id } });
            if (!vendor)
                throw new common_1.NotFoundException(`Vendor ${body.vendor_id} was not found.`);
            const purchaseDate = body.purchase_date ? new Date(body.purchase_date) : new Date();
            if (Number.isNaN(purchaseDate.getTime()))
                throw new common_1.BadRequestException('Invalid purchase date.');
            const purchase = await tx.purchase.create({
                data: {
                    vendor_id: body.vendor_id,
                    invoice_no: body.invoice_no,
                    notes: body.notes,
                    purchase_date: purchaseDate,
                },
            });
            let totalAmount = new client_1.Prisma.Decimal(0);
            for (const line of body.lines) {
                if (!Number.isInteger(line.quantity) || line.quantity <= 0 ||
                    !Number.isFinite(line.unit_cost) || line.unit_cost < 0 ||
                    !Number.isFinite(line.selling_price) || line.selling_price < 0) {
                    throw new common_1.BadRequestException('Purchase quantities and prices must be valid.');
                }
                const item = await tx.item.findUnique({ where: { id: line.item_id } });
                if (!item)
                    throw new common_1.NotFoundException(`Item ${line.item_id} was not found.`);
                await tx.item.update({
                    where: { id: line.item_id },
                    data: {
                        stock_qty: { increment: line.quantity },
                        purchase_price: new client_1.Prisma.Decimal(line.unit_cost),
                        selling_price: new client_1.Prisma.Decimal(line.selling_price),
                    },
                });
                await tx.purchaseItem.create({
                    data: {
                        purchase_id: purchase.id,
                        item_id: line.item_id,
                        quantity: line.quantity,
                        unit_cost: new client_1.Prisma.Decimal(line.unit_cost),
                        selling_price: new client_1.Prisma.Decimal(line.selling_price),
                        line_total: new client_1.Prisma.Decimal(line.unit_cost).mul(line.quantity),
                    },
                });
                totalAmount = totalAmount.add(new client_1.Prisma.Decimal(line.unit_cost).mul(line.quantity));
            }
            await tx.purchase.update({ where: { id: purchase.id }, data: { total_amount: totalAmount } });
            return tx.purchase.findUnique({
                where: { id: purchase.id },
                include: { lines: true, vendor: true },
            });
        });
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map