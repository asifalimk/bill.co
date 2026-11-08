import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CheckoutItemDto {
  @IsInt()
  @Min(1)
  item_id!: number;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  line_discount?: number;
}

export class CheckoutInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  invoice_no!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  customer_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  site_note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  customer_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  customer_phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  customer_gstin?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bill_discount?: number;

  @IsIn(['CASH', 'CREDIT'])
  payment_type!: 'CASH' | 'CREDIT';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
}
