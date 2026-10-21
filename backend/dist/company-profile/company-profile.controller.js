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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProfileController = void 0;
const common_1 = require("@nestjs/common");
const company_profile_service_1 = require("./company-profile.service");
let CompanyProfileController = class CompanyProfileController {
    companyProfileService;
    constructor(companyProfileService) {
        this.companyProfileService = companyProfileService;
    }
    findOne() {
        return this.companyProfileService.findOne();
    }
    update(dto) {
        return this.companyProfileService.update(dto);
    }
};
exports.CompanyProfileController = CompanyProfileController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompanyProfileController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyProfileController.prototype, "update", null);
exports.CompanyProfileController = CompanyProfileController = __decorate([
    (0, common_1.Controller)('api/company-profile'),
    __metadata("design:paramtypes", [company_profile_service_1.CompanyProfileService])
], CompanyProfileController);
//# sourceMappingURL=company-profile.controller.js.map