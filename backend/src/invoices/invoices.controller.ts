import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CheckoutInvoiceDto } from './dto/checkout-invoice.dto';
import { InvoicesService } from './invoices.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api/invoices')
@Roles(UserRole.ADMIN, UserRole.CASHIER)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentType') paymentType?: 'CASH' | 'CREDIT',
    @Req() request?: AuthenticatedRequest,
  ) {
    if (paymentType && paymentType !== 'CASH' && paymentType !== 'CREDIT') {
      throw new BadRequestException('paymentType must be CASH or CREDIT.');
    }
    const invoices = await this.invoicesService.findAll(startDate, endDate, paymentType);
    return invoices.map(invoice => this.hideProfitFromCashier(invoice, request?.user.role));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    const invoice = await this.invoicesService.findOne(id);
    return this.hideProfitFromCashier(invoice, request.user.role);
  }

  @Post('checkout')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  checkout(
    @Body() body: CheckoutInvoiceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.invoicesService.checkout(body, request.user.name)
      .then(invoice => this.hideProfitFromCashier(invoice, request.user.role));
  }

  @Put(':id')
  updateInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CheckoutInvoiceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.invoicesService.updateInvoice(id, body, request.user.name)
      .then(invoice => this.hideProfitFromCashier(invoice, request.user.role));
  }

  private hideProfitFromCashier<T extends Prisma.InvoiceGetPayload<{ include: { items: true; customer: true } }>>(
    invoice: T,
    role: UserRole | undefined,
  ) {
    if (role === UserRole.ADMIN) {
      return invoice;
    }

    const {
      net_profit: netProfit,
      total_cost: totalCost,
      items,
      ...publicInvoice
    } = invoice;
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
}
