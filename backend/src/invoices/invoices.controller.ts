import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('api/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.invoicesService.findAll(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Post('checkout')
  checkout(
    @Body()
    body: {
      invoice_no: string;
      customer_id?: number;
      site_note?: string;
      payment_type: 'CASH' | 'CREDIT';
      items: Array<{ item_id: number; quantity: number; line_discount?: number; selling_price?: number }>;
    },
  ) {
    return this.invoicesService.checkout(body);
  }
}
