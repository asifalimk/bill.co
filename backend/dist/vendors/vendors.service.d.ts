import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class VendorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findOne(id: number): Promise<any>;
    create(dto: Prisma.VendorCreateInput): any;
    update(id: number, dto: Prisma.VendorUpdateInput): Promise<any>;
    remove(id: number): Promise<any>;
}
