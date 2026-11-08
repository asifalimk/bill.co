import { Prisma } from '@prisma/client';
import { ItemsService } from './items.service';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    findAll(search: string | undefined, request: AuthenticatedRequest): Promise<Omit<{
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
    }, "purchase_price">[]>;
    findByCode(code: string, request: AuthenticatedRequest): Promise<Omit<{
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
    }, "purchase_price">>;
    findOne(id: number, request: AuthenticatedRequest): Promise<Omit<{
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
    }, "purchase_price">>;
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
    replace(id: number, dto: Prisma.ItemUpdateInput): Promise<{
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
    adjustStock(id: number, body: {
        quantity: number;
    }): Promise<{
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
    private hidePurchasePriceFromCashier;
}
export {};
