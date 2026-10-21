import { Prisma } from '@prisma/client';
import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(): any;
    findOne(id: number): Promise<any>;
    create(dto: Prisma.CustomerCreateInput): any;
    update(id: number, dto: Prisma.CustomerUpdateInput): Promise<any>;
    updateCredit(id: number, body: {
        amount: number;
    }): Promise<any>;
    remove(id: number): Promise<any>;
}
