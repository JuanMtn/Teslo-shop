import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";
import { ProductImage } from './entities';
import { query } from 'express';

@Injectable()
export class ProductsService {
  
  private readonly logger= new Logger;

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagesRepository:Repository<ProductImage>,

    private readonly dataSource: DataSource,


  ){}
  
  async create(createProductDto: CreateProductDto) {

    try {
      const {images =[], ...productDetails} = createProductDto;
      const product= this.productRepository.create({
        ...productDetails,
        images: images.map(image =>this.productImagesRepository.create({url:image})) 
      });
      await this.productRepository.save(product);
      return {...product,images};

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto:PaginationDto) {
    const {limit=10, offset=0}=paginationDto;
    const products= await this.productRepository.find({
      take:limit,
      skip:offset,
      relations:{
        images:true
      }
    });

    return products.map(product =>({
      ...product,
      images: product.images.map(img=> img.url)
    }))
  }

  async findOne(term: string) {
    let product:Product;
    if(isUUID(term)){
      product =await this.productRepository.findOneBy({id:term});
    }else{
      const queryBuilder= await this.productRepository.createQueryBuilder('prod');
      product= await queryBuilder
        .where('UPPER(title) =:title or slug =:slug',{
          title:term.toUpperCase(),
          slug:term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images','prod.images')
        .getOne();      
    }

    if(!product)
      throw new NotFoundException(`Product with id ${term} not found`);
    return product;
  }

  async GetOnePlain(term:string){
    const {images=[],...rest} =await this.findOne(term);

    return {
      ...rest,
      images: images.map(img=> img.url)
    }


  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({id,...toUpdate});

    if(!product) throw new NotFoundException(`Product with id: ${ id } not found`);

    //Create Query 
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction()

    try {
      if(images){
        await queryRunner.manager.delete(ProductImage,{product:{id}})
        product.images= images.map(
          image => this.productImagesRepository.create({url:image})
          )
        }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release()
      //await this.productRepository.save(product);
      return this.GetOnePlain(id);
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
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


  async deleteAllProducts(){
    const query= this.productRepository.createQueryBuilder('product');

    try {
      return await query
      .delete()
      .where({})
      .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
