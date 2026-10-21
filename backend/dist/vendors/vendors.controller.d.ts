import { Prisma } from '@prisma/client';
import { VendorsService } from './vendors.service';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    findAll(): any;
    findOne(id: number): Promise<any>;
    create(dto: Prisma.VendorCreateInput): any;
    update(id: number, dto: Prisma.VendorUpdateInput): Promise<any>;
    remove(id: number): Promise<any>;
}
