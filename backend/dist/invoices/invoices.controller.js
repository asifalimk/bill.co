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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const checkout_invoice_dto_1 = require("./dto/checkout-invoice.dto");
const invoices_service_1 = require("./invoices.service");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async findAll(startDate, endDate, paymentType, request) {
        if (paymentType && paymentType !== 'CASH' && paymentType !== 'CREDIT') {
            throw new common_1.BadRequestException('paymentType must be CASH or CREDIT.');
        }
        const invoices = await this.invoicesService.findAll(startDate, endDate, paymentType);
        return invoices.map(invoice => this.hideProfitFromCashier(invoice, request?.user.role));
    }
    async findOne(id, request) {
        const invoice = await this.invoicesService.findOne(id);
        return this.hideProfitFromCashier(invoice, request.user.role);
    }
    checkout(body, request) {
        return this.invoicesService.checkout(body, request.user.name)
            .then(invoice => this.hideProfitFromCashier(invoice, request.user.role));
    }
    updateInvoice(id, body, request) {
        return this.invoicesService.updateInvoice(id, body, request.user.name)
            .then(invoice => this.hideProfitFromCashier(invoice, request.user.role));
    }
    hideProfitFromCashier(invoice, role) {
        if (role === client_1.UserRole.ADMIN) {
            return invoice;
        }
        const { net_profit: netProfit, total_cost: totalCost, items, ...publicInvoice } = invoice;
        void netProfit;
        void totalCost;
        return {
            ...publicInvoice,
            items: items.map(({ purchase_price: purchasePrice, line_net_profit: lineNetProfit, ...item }) => {
                void purchasePrice;
                void lineNetProfit;
                return item;
            }),
        };
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('paymentType')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkout_invoice_dto_1.CheckoutInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "checkout", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, checkout_invoice_dto_1.CheckoutInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "updateInvoice", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.Controller)('api/invoices'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map