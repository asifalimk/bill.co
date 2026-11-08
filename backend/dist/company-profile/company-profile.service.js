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
        return this.prisma.companyProfile.upsert({
            where: { id: 1 },
            create: this.defaults(),
            update: {},
        });
    }
    async update(dto) {
        return this.prisma.companyProfile.upsert({
            where: { id: 1 },
            create: { ...this.defaults(), ...dto },
            update: dto,
        });
    }
    defaults() {
        return {
            store_name: 'HARDWARE COUNTER',
            short_name: 'H',
            tagline: 'Retail hardware & supplies',
            phone_primary: '98765 43210',
            address_line1: '24 Market Road',
            city: 'Kochi',
            state: 'Kerala',
            pincode: '682001',
            gstin: '',
            terms_and_conditions: 'Goods once sold are not returnable unless damaged.',
            email: '',
            website: '',
            footer_note: 'Thank you for your business!',
        };
    }
};
exports.CompanyProfileService = CompanyProfileService;
exports.CompanyProfileService = CompanyProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyProfileService);
//# sourceMappingURL=company-profile.service.js.map