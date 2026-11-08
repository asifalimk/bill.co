import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ItemsModule } from './items/items.module';
import { CustomersModule } from './customers/customers.module';
import { VendorsModule } from './vendors/vendors.module';
import { PurchasesModule } from './purchases/purchases.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CompanyProfileModule } from './company-profile/company-profile.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ItemsModule,
    CustomersModule,
    VendorsModule,
    PurchasesModule,
    InvoicesModule,
    CompanyProfileModule,
  ],
})
export class AppModule {}
