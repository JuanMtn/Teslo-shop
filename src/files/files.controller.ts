import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter,fileNamer } from './helpers';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter:fileFilter,
    // limits:{fieldSize:10000}
    storage:diskStorage({
      destination: './static/products',
      filename:fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    
    ){
      if(!file){
        throw new BadRequestException('Make sure that file is a image');
      }

    return {
      fileName: file.originalname
    };
  }
}
