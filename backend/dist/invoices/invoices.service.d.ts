import { PrismaService } from '../prisma/prisma.service';
export declare class InvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(startDate?: string, endDate?: string): any;
    findOne(id: number): Promise<any>;
    checkout(body: {
        invoice_no: string;
        customer_id?: number;
        site_note?: string;
        payment_type: 'CASH' | 'CREDIT';
        items: Array<{
            item_id: number;
            quantity: number;
            line_discount?: number;
            selling_price?: number;
        }>;
    }): Promise<any>;
}
