import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export type CompanyProfileUpdate = Partial<Pick<Prisma.CompanyProfileCreateInput, 'store_name' | 'tagline' | 'phone_primary' | 'address_line1' | 'city' | 'state' | 'pincode' | 'gstin' | 'terms_and_conditions' | 'short_name' | 'email' | 'website' | 'footer_note'>>;
export declare class CompanyProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOne(): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        gstin: string;
        email: string;
        store_name: string;
        tagline: string;
        phone_primary: string;
        address_line1: string;
        city: string;
        state: string;
        pincode: string;
        terms_and_conditions: string;
        short_name: string;
        website: string;
        footer_note: string;
    }>;
    update(dto: CompanyProfileUpdate): Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        gstin: string;
        email: string;
        store_name: string;
        tagline: string;
        phone_primary: string;
        address_line1: string;
        city: string;
        state: string;
        pincode: string;
        terms_and_conditions: string;
        short_name: string;
        website: string;
        footer_note: string;
    }>;
    private defaults;
}
