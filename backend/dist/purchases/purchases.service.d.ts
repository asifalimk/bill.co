import { PrismaService } from '../prisma/prisma.service';
export declare class PurchasesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(vendorId?: number): any;
    findOne(id: number): Promise<any>;
    create(body: {
        vendor_id: number;
        invoice_no: string;
        notes?: string;
        lines: Array<{
            item_id: number;
            quantity: number;
            unit_cost: number;
            selling_price: number;
        }>;
    }): Promise<any>;
}
