import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Put,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { ItemsService } from './items.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api/items')
@Roles(UserRole.ADMIN, UserRole.CASHIER)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(@Query('search') search: string | undefined, @Req() request: AuthenticatedRequest) {
    const items = await this.itemsService.findAll(search);
    return items.map(item => this.hidePurchasePriceFromCashier(item, request.user.role));
  }

  @Get('shortcode/:code')
  async findByCode(@Param('code') code: string, @Req() request: AuthenticatedRequest) {
    const item = await this.itemsService.findByCode(code);
    return this.hidePurchasePriceFromCashier(item, request.user.role);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    const item = await this.itemsService.findOne(id);
    return this.hidePurchasePriceFromCashier(item, request.user.role);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: Prisma.ItemCreateInput) {
    return this.itemsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Prisma.ItemUpdateInput) {
    return this.itemsService.update(id, dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: Prisma.ItemUpdateInput) {
    return this.itemsService.update(id, dto);
  }

  @Patch(':id/stock')
  @Roles(UserRole.ADMIN)
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { quantity: number },
  ) {
    return this.itemsService.adjustStock(id, body.quantity);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }

  private hidePurchasePriceFromCashier<T extends { purchase_price: unknown }>(item: T, role: UserRole) {
    if (role === UserRole.ADMIN) return item;
    const { purchase_price: purchasePrice, ...publicItem } = item;
    void purchasePrice;
    return publicItem;
  }
}
