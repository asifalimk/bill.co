import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class PurchasesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(vendorId?: number): Prisma.PrismaPromise<({
        vendor: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            company_name: string;
            email: string | null;
        };
        lines: {
            id: number;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_total: Prisma.Decimal;
            item_id: number;
            unit_cost: Prisma.Decimal;
            purchase_id: number;
        }[];
    } & {
        id: number;
        invoice_no: string;
        purchase_date: Date;
        notes: string | null;
        total_amount: Prisma.Decimal;
        vendor_id: number;
    })[]>;
    findOne(id: number): Promise<{
        vendor: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            company_name: string;
            email: string | null;
        };
        lines: {
            id: number;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_total: Prisma.Decimal;
            item_id: number;
            unit_cost: Prisma.Decimal;
            purchase_id: number;
        }[];
    } & {
        id: number;
        invoice_no: string;
        purchase_date: Date;
        notes: string | null;
        total_amount: Prisma.Decimal;
        vendor_id: number;
    }>;
    create(body: {
        vendor_id: number;
        invoice_no: string;
        purchase_date?: string;
        notes?: string;
        lines: Array<{
            item_id: number;
            quantity: number;
            unit_cost: number;
            selling_price: number;
        }>;
    }): Promise<({
        vendor: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            company_name: string;
            email: string | null;
        };
        lines: {
            id: number;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_total: Prisma.Decimal;
            item_id: number;
            unit_cost: Prisma.Decimal;
            purchase_id: number;
        }[];
    } & {
        id: number;
        invoice_no: string;
        purchase_date: Date;
        notes: string | null;
        total_amount: Prisma.Decimal;
        vendor_id: number;
    }) | null>;
}
