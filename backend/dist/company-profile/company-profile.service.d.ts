import { PrismaService } from '../prisma/prisma.service';
export declare class CompanyProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOne(): Promise<any>;
    update(dto: Record<string, any>): Promise<any>;
}
