import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CheckoutInvoiceDto } from './dto/checkout-invoice.dto';
import { InvoicesService } from './invoices.service';
interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(startDate?: string, endDate?: string, paymentType?: 'CASH' | 'CREDIT', request?: AuthenticatedRequest): Promise<(({
        customer: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            credit_balance: Prisma.Decimal;
        } | null;
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            purchase_price: Prisma.Decimal;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            line_net_profit: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        invoice_no: string;
        customer_name: string;
        customer_phone: string;
        customer_gstin: string | null;
        cashier_name: string;
        payment_type: import("@prisma/client").$Enums.PaymentType;
        site_note: string | null;
        gross_amount: Prisma.Decimal;
        bill_discount: Prisma.Decimal;
        total_discounts: Prisma.Decimal;
        total_cost: Prisma.Decimal;
        net_amount: Prisma.Decimal;
        net_profit: Prisma.Decimal;
        is_edited: boolean;
        edited_at: Date | null;
        customer_id: number | null;
    }) | (Omit<{
        customer: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            credit_balance: Prisma.Decimal;
        } | null;
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            purchase_price: Prisma.Decimal;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            line_net_profit: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        invoice_no: string;
        customer_name: string;
        customer_phone: string;
        customer_gstin: string | null;
        cashier_name: string;
        payment_type: import("@prisma/client").$Enums.PaymentType;
        site_note: string | null;
        gross_amount: Prisma.Decimal;
        bill_discount: Prisma.Decimal;
        total_discounts: Prisma.Decimal;
        total_cost: Prisma.Decimal;
        net_amount: Prisma.Decimal;
        net_profit: Prisma.Decimal;
        is_edited: boolean;
        edited_at: Date | null;
        customer_id: number | null;
    }, "total_cost" | "net_profit" | "items"> & {
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    }))[]>;
    findOne(id: number, request: AuthenticatedRequest): Promise<({
        customer: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            credit_balance: Prisma.Decimal;
        } | null;
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            purchase_price: Prisma.Decimal;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            line_net_profit: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        invoice_no: string;
        customer_name: string;
        customer_phone: string;
        customer_gstin: string | null;
        cashier_name: string;
        payment_type: import("@prisma/client").$Enums.PaymentType;
        site_note: string | null;
        gross_amount: Prisma.Decimal;
        bill_discount: Prisma.Decimal;
        total_discounts: Prisma.Decimal;
        total_cost: Prisma.Decimal;
        net_amount: Prisma.Decimal;
        net_profit: Prisma.Decimal;
        is_edited: boolean;
        edited_at: Date | null;
        customer_id: number | null;
    }) | (Omit<{
        customer: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            credit_balance: Prisma.Decimal;
        } | null;
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            purchase_price: Prisma.Decimal;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            line_net_profit: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        invoice_no: string;
        customer_name: string;
        customer_phone: string;
        customer_gstin: string | null;
        cashier_name: string;
        payment_type: import("@prisma/client").$Enums.PaymentType;
        site_note: string | null;
        gross_amount: Prisma.Decimal;
        bill_discount: Prisma.Decimal;
        total_discounts: Prisma.Decimal;
        total_cost: Prisma.Decimal;
        net_amount: Prisma.Decimal;
        net_profit: Prisma.Decimal;
        is_edited: boolean;
        edited_at: Date | null;
        customer_id: number | null;
    }, "total_cost" | "net_profit" | "items"> & {
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    })>;
    checkout(body: CheckoutInvoiceDto, request: AuthenticatedRequest): Promise<({
        customer: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            credit_balance: Prisma.Decimal;
        } | null;
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            purchase_price: Prisma.Decimal;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            line_net_profit: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        invoice_no: string;
        customer_name: string;
        customer_phone: string;
        customer_gstin: string | null;
        cashier_name: string;
        payment_type: import("@prisma/client").$Enums.PaymentType;
        site_note: string | null;
        gross_amount: Prisma.Decimal;
        bill_discount: Prisma.Decimal;
        total_discounts: Prisma.Decimal;
        total_cost: Prisma.Decimal;
        net_amount: Prisma.Decimal;
        net_profit: Prisma.Decimal;
        is_edited: boolean;
        edited_at: Date | null;
        customer_id: number | null;
    }) | (Omit<{
        customer: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            credit_balance: Prisma.Decimal;
        } | null;
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            purchase_price: Prisma.Decimal;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            line_net_profit: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        invoice_no: string;
        customer_name: string;
        customer_phone: string;
        customer_gstin: string | null;
        cashier_name: string;
        payment_type: import("@prisma/client").$Enums.PaymentType;
        site_note: string | null;
        gross_amount: Prisma.Decimal;
        bill_discount: Prisma.Decimal;
        total_discounts: Prisma.Decimal;
        total_cost: Prisma.Decimal;
        net_amount: Prisma.Decimal;
        net_profit: Prisma.Decimal;
        is_edited: boolean;
        edited_at: Date | null;
        customer_id: number | null;
    }, "total_cost" | "net_profit" | "items"> & {
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    })>;
    updateInvoice(id: number, body: CheckoutInvoiceDto, request: AuthenticatedRequest): Promise<({
        customer: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            credit_balance: Prisma.Decimal;
        } | null;
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            purchase_price: Prisma.Decimal;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            line_net_profit: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        invoice_no: string;
        customer_name: string;
        customer_phone: string;
        customer_gstin: string | null;
        cashier_name: string;
        payment_type: import("@prisma/client").$Enums.PaymentType;
        site_note: string | null;
        gross_amount: Prisma.Decimal;
        bill_discount: Prisma.Decimal;
        total_discounts: Prisma.Decimal;
        total_cost: Prisma.Decimal;
        net_amount: Prisma.Decimal;
        net_profit: Prisma.Decimal;
        is_edited: boolean;
        edited_at: Date | null;
        customer_id: number | null;
    }) | (Omit<{
        customer: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            phone: string;
            address: string | null;
            gstin: string | null;
            credit_balance: Prisma.Decimal;
        } | null;
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            purchase_price: Prisma.Decimal;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            line_net_profit: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    } & {
        id: number;
        created_at: Date;
        invoice_no: string;
        customer_name: string;
        customer_phone: string;
        customer_gstin: string | null;
        cashier_name: string;
        payment_type: import("@prisma/client").$Enums.PaymentType;
        site_note: string | null;
        gross_amount: Prisma.Decimal;
        bill_discount: Prisma.Decimal;
        total_discounts: Prisma.Decimal;
        total_cost: Prisma.Decimal;
        net_amount: Prisma.Decimal;
        net_profit: Prisma.Decimal;
        is_edited: boolean;
        edited_at: Date | null;
        customer_id: number | null;
    }, "total_cost" | "net_profit" | "items"> & {
        items: {
            id: number;
            code: string;
            name: string;
            category: string;
            unit: string;
            selling_price: Prisma.Decimal;
            created_at: Date;
            quantity: number;
            line_discount: Prisma.Decimal;
            line_total: Prisma.Decimal;
            invoice_id: number;
            item_id: number;
        }[];
    })>;
    private hideProfitFromCashier;
}
export {};
