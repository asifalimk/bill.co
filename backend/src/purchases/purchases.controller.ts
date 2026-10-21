import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Controller('api/purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  findAll(@Query('vendorId') vendorId?: string) {
    return this.purchasesService.findAll(vendorId ? Number(vendorId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findOne(id);
  }

  @Post()
  create(@Body() body: { vendor_id: number; invoice_no: string; notes?: string; lines: Array<{ item_id: number; quantity: number; unit_cost: number; selling_price: number }> }) {
    return this.purchasesService.create(body);
  }
}
