import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    findAll(vendorId?: string): any;
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
