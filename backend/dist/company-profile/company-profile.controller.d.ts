import { CompanyProfileService } from './company-profile.service';
export declare class CompanyProfileController {
    private readonly companyProfileService;
    constructor(companyProfileService: CompanyProfileService);
    findOne(): Promise<any>;
    update(dto: Partial<{
        store_name: string;
        tagline: string;
        phone_primary: string;
        address_line1: string;
        city: string;
        state: string;
        pincode: string;
        gstin: string;
        terms_and_conditions: string;
    }>): Promise<any>;
}
