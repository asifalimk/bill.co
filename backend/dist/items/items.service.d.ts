import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class ItemsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string): any;
    findByCode(code: string): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: Prisma.ItemCreateInput): any;
    update(id: number, dto: Prisma.ItemUpdateInput): Promise<any>;
    remove(id: number): Promise<any>;
}
