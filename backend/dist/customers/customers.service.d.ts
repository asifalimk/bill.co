import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findOne(id: number): Promise<any>;
    create(dto: Prisma.CustomerCreateInput): any;
    update(id: number, dto: Prisma.CustomerUpdateInput): Promise<any>;
    adjustCredit(id: number, amount: number): Promise<any>;
    remove(id: number): Promise<any>;
}
