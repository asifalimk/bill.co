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
        const vendor = await this.prisma.vendor.findUnique({ where: { id: body.vendor_id } });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor ${body.vendor_id} was not found.`);
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
                    throw new common_1.NotFoundException(`Item ${line.item_id} was not found.`);
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
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map