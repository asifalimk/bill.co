"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CompanyProfileService = class CompanyProfileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne() {
        const profile = await this.prisma.companyProfile.findFirst();
        if (!profile) {
            throw new common_1.NotFoundException('Company profile not found.');
        }
        return profile;
    }
    async update(dto) {
        const existing = await this.prisma.companyProfile.findFirst();
        if (!existing) {
            return this.prisma.companyProfile.create({
                data: {
                    store_name: dto.store_name ?? 'HARDWARE COUNTER',
                    tagline: dto.tagline ?? 'Retail hardware & supplies',
                    phone_primary: dto.phone_primary ?? '98765 43210',
                    address_line1: dto.address_line1 ?? '24 Market Road',
                    city: dto.city ?? 'Kochi',
                    state: dto.state ?? 'Kerala',
                    pincode: dto.pincode ?? '682001',
                    gstin: dto.gstin ?? '32ABCDE1234F1Z5',
                    terms_and_conditions: dto.terms_and_conditions ?? 'Goods once sold are not returnable unless damaged.',
                },
            });
        }
        return this.prisma.companyProfile.update({
            where: { id: existing.id },
            data: dto,
        });
    }
};
exports.CompanyProfileService = CompanyProfileService;
exports.CompanyProfileService = CompanyProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyProfileService);
//# sourceMappingURL=company-profile.service.js.map