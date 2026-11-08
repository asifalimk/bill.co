import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class ItemsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string): Prisma.PrismaPromise<{
        id: number;
        code: string;
        name: string;
        category: string;
        unit: string;
        purchase_price: Prisma.Decimal;
        selling_price: Prisma.Decimal;
        stock_qty: number;
        min_stock_level: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findByCode(code: string): Promise<{
        id: number;
        code: string;
        name: string;
        category: string;
        unit: string;
        purchase_price: Prisma.Decimal;
        selling_price: Prisma.Decimal;
        stock_qty: number;
        min_stock_level: number;
        created_at: Date;
        updated_at: Date;
    }>;
    findOne(id: number): Promise<{
        id: number;
        code: string;
        name: string;
        category: string;
        unit: string;
        purchase_price: Prisma.Decimal;
        selling_price: Prisma.Decimal;
        stock_qty: number;
        min_stock_level: number;
        created_at: Date;
        updated_at: Date;
    }>;
    create(dto: Prisma.ItemCreateInput): Prisma.Prisma__ItemClient<{
        id: number;
        code: string;
        name: string;
        category: string;
        unit: string;
        purchase_price: Prisma.Decimal;
        selling_price: Prisma.Decimal;
        stock_qty: number;
        min_stock_level: number;
        created_at: Date;
        updated_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, dto: Prisma.ItemUpdateInput): Promise<{
        id: number;
        code: string;
        name: string;
        category: string;
        unit: string;
        purchase_price: Prisma.Decimal;
        selling_price: Prisma.Decimal;
        stock_qty: number;
        min_stock_level: number;
        created_at: Date;
        updated_at: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        code: string;
        name: string;
        category: string;
        unit: string;
        purchase_price: Prisma.Decimal;
        selling_price: Prisma.Decimal;
        stock_qty: number;
        min_stock_level: number;
        created_at: Date;
        updated_at: Date;
    }>;
    adjustStock(id: number, quantity: number): Promise<{
        id: number;
        code: string;
        name: string;
        category: string;
        unit: string;
        purchase_price: Prisma.Decimal;
        selling_price: Prisma.Decimal;
        stock_qty: number;
        min_stock_level: number;
        created_at: Date;
        updated_at: Date;
    }>;
    private validateItem;
}
