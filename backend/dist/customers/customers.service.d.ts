import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        credit_balance: Prisma.Decimal;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        credit_balance: Prisma.Decimal;
    }>;
    create(dto: Prisma.CustomerCreateInput): Prisma.Prisma__CustomerClient<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        credit_balance: Prisma.Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, dto: Prisma.CustomerUpdateInput): Promise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        credit_balance: Prisma.Decimal;
    }>;
    adjustCredit(id: number, amount: number): Promise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        credit_balance: Prisma.Decimal;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        credit_balance: Prisma.Decimal;
    }>;
}
