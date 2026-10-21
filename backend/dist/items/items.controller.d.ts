import { Prisma } from '@prisma/client';
import { ItemsService } from './items.service';
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    findAll(search?: string): any;
    findByCode(code: string): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: Prisma.ItemCreateInput): any;
    update(id: number, dto: Prisma.ItemUpdateInput): Promise<any>;
    remove(id: number): Promise<any>;
}
