import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService:ProductsService,
    
  ){}

  async runSeed(){
    await this.inserNewProducts();
    return 'Seed Executed'
  }

  private async inserNewProducts(){
    await this.productsService.deleteAllProducts();

    const products =initialData.products;

    const insertPromises=[];

    products.forEach(product =>{
      
      insertPromises.push(this.productsService.create(product));      
    })

    await Promise.all(insertPromises);
    
    return true;
  }
}
