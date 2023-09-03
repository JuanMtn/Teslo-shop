import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";

@Injectable()
export class ProductsService {
  
  private readonly logger= new Logger;

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>

  ){}
  
  async create(createProductDto: CreateProductDto) {
    
    try {
      
      const product= this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  findAll(paginationDto:PaginationDto) {
    const {limit=10, offset=0}=paginationDto;
    return this.productRepository.find({
      take:limit,
      skip:offset,
      //TODO: Relaciones
    });
  }

  async findOne(term: string) {
    let product:Product;
    if(isUUID(term)){
      product =await this.productRepository.findOneBy({id:term});
    }else{
      const queryBuilder= await this.productRepository.createQueryBuilder();
      product= await queryBuilder
        .where('UPPER(title) =:title or slug =:slug',{
          title:term.toUpperCase(),
          slug:term.toLowerCase(),
        }).getOne();      
    }

    if(!product)
      throw new NotFoundException(`Product with id ${term} not found`);
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);

   await this.productRepository.remove(product);
   
  }

  private handleDBExceptions( error:any){ // funcion para controlar errores. Se pueden agregar todos los que se quiere para controlarlos
    if(error.code=== '23505') //error de duplicado de propiedad unica
      throw new BadRequestException(error.detail);

      this.logger.error(error);

      throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}
