import { Prisma } from '@prisma/client';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
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
    create(dto: CreateCustomerDto): Prisma.Prisma__CustomerClient<{
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
    updateCredit(id: number, body: {
        amount: number;
    }): Promise<{
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
