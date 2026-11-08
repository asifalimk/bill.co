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
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ItemsService = class ItemsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(search) {
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
    async findByCode(code) {
        const item = await this.prisma.item.findUnique({ where: { code } });
        if (!item) {
            throw new common_1.NotFoundException(`Item with code ${code} was not found.`);
        }
        return item;
    }
    async findOne(id) {
        const item = await this.prisma.item.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`Item ${id} was not found.`);
        }
        return item;
    }
    create(dto) {
        this.validateItem(dto);
        return this.prisma.item.create({ data: { ...dto, stock_qty: 0 } });
    }
    async update(id, dto) {
        await this.findOne(id);
        this.validateItem(dto);
        const { stock_qty: _stockQty, ...itemDetails } = dto;
        void _stockQty;
        return this.prisma.item.update({ where: { id }, data: itemDetails });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.item.delete({ where: { id } });
    }
    async adjustStock(id, quantity) {
        const item = await this.findOne(id);
        if (!Number.isInteger(quantity) || quantity === 0) {
            throw new common_1.BadRequestException('Stock adjustment must be a non-zero whole number.');
        }
        if (quantity < 0) {
            const updated = await this.prisma.item.updateMany({
                where: { id, stock_qty: { gte: Math.abs(quantity) } },
                data: { stock_qty: { decrement: Math.abs(quantity) } },
            });
            if (!updated.count)
                throw new common_1.BadRequestException(`Insufficient stock for ${item.name}.`);
            return this.findOne(id);
        }
        return this.prisma.item.update({
            where: { id },
            data: { stock_qty: { increment: quantity } },
        });
    }
    validateItem(item) {
        const code = typeof item.code === 'string' ? item.code : undefined;
        if (code !== undefined && !/^\d{3}$/.test(code)) {
            throw new common_1.BadRequestException('Item code must contain exactly three digits.');
        }
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ItemsService);
//# sourceMappingURL=items.service.js.map