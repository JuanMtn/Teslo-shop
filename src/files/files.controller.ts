import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter,fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('product/:imageName')
  findProductImage(
    @Param('imageName') imageName:string,
    @Res() res: Response
  ){
   const path= this.filesService.getStaticProductImage(imageName);
    
   res.sendFile(path)
  
  return path;
  }


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
