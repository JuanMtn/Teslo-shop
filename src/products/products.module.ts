import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './dto';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[
    TypeOrmModule.forFeature([Product,ProductImage])
  ]
})
export class ProductsModule {}
