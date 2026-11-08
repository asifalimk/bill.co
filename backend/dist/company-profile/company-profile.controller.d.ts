import { CompanyProfileService, CompanyProfileUpdate } from './company-profile.service';
export declare class CompanyProfileController {
    private readonly companyProfileService;
    constructor(companyProfileService: CompanyProfileService);
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
}
