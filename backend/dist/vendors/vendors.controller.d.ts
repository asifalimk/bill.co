import { Prisma } from '@prisma/client';
import { VendorsService } from './vendors.service';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    findAll(): Prisma.PrismaPromise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        company_name: string;
        email: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        company_name: string;
        email: string | null;
    }>;
    create(dto: Prisma.VendorCreateInput): Prisma.Prisma__VendorClient<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        company_name: string;
        email: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, dto: Prisma.VendorUpdateInput): Promise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        company_name: string;
        email: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        phone: string;
        address: string | null;
        gstin: string | null;
        company_name: string;
        email: string | null;
    }>;
}
